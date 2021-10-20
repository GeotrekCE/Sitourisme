const util = require('util');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const _ = require('lodash');
const pify = require('pify');
const moment = require('moment');
const Import = require(path.resolve('library/import/generic.js'));
const DataString = require(path.resolve('library/data/manipulate.js'));
const importUtils = require(__dirname + '/../../importUtils.server.model.js');
const logger = require(path.resolve(
  'library/customColorLogger/customColorLogger.js'
));
// const config = require(path.resolve('config/config.js'));
const configImportRegionDo = require(path.resolve(
  'config/configImport_RegionDo.js'
));
const configSitraTown = require(path.resolve('config/configSitraTown.js'));

const langMapping = {
  'en-US': 'En',
  'es-ES': 'Es',
  'it-It': 'It',
  'de-DE': 'De',
  'nl-NL': 'Nl'
};

var ImportGenericRegionDo = function (options) {
  this.importType = options.importType
    ? options.importType.toUpperCase()
    : null;
  this.user = options.user ? options.user : null;
  this.lang = options.lang ? options.lang : 'fr';
  this.otherLangs = ['en-US', 'es-ES', 'it-IT', 'de-DE', 'nl-NL'];
  this.baseURL = 'https://api.regiondo.com/v1';
  this.entApidaeId = 5171014; // ent id by default
};

// Inherits of import
util.inherits(ImportGenericRegionDo, Import);

ImportGenericRegionDo.prototype.import = function (data, next) {
  try {
    importUtils.initRegion((regionPerZipcode) =>
      this.executeQuery(regionPerZipcode)
    );
  } catch (err) {
    console.log(err);
    next();
  }
};

ImportGenericRegionDo.prototype.executeQuery = async function (
  regionPerZipcode
) {
  // list of access
  let listApiAccess = [
    {
      publicKey: 'OF88a123d28167',
      privateKey: 'e3a123d5956c9b6dc28167612e5c721434a02',
      member: 3448
    },
    {
      publicKey: 'ES60a97de11449',
      privateKey: '9ca97de2ba3e59b731144923bbfc047750d1f',
      member: 3448
    }
  ];
  if (process.env.NODE_ENV === 'production') {
    listApiAccess = [
      // regionDo - Marseille (by default)
      {
        publicKey: 'OF88a123d28167',
        privateKey: 'e3a123d5956c9b6dc28167612e5c721434a02',
        member: 5701
      },
      // regionDo - Esterel
      {
        publicKey: 'ES60a97de11449',
        privateKey: '9ca97de2ba3e59b731144923bbfc047750d1f',
        member: 5249
      }
    ];
  }
  const apiTime = +new Date();
  // create an instance of axios for each access url
  this.listInstanceApi = await Promise.all(
    listApiAccess.map((api) => {
      const hash = crypto
        .createHmac('sha256', api.privateKey)
        .update(`${apiTime}${api.publicKey}`)
        .digest('hex');
      return {
        publicKey: api.publicKey,
        member: api.member,
        api: axios.create({
          baseURL: this.baseURL,
          headers: {
            'X-API-ID': api.publicKey,
            'X-API-TIME': apiTime,
            'X-API-HASH': hash,
            'Accept-Language': 'fr-FR'
          }
        })
      };
    })
  );
  for await (let instance of this.listInstanceApi) {
    logger.info(
      `Begin call http regionDo for ${instance.publicKey} and NODE_ENV=${process.env.NODE_ENV}`
    );
    console.time(`Total time for ${instance.publicKey}`);
    this.currentInstance = instance.api;
    await instance.api
      .get('/products?limit=250&attribute_include_type=all')
      .then(async ({ data }) => {
        // promisify a callback function
        this.doUpsertAsync = await pify(importUtils.doUpsert);
        await this.importProduct(data.data, instance.member, regionPerZipcode);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    console.timeEnd(`Total time for ${instance.publicKey}`);
    logger.info(`End call http regionDo for ${instance.publicKey}`);
  }
};

// import recursively
ImportGenericRegionDo.prototype.importProduct = async function (
  listElement,
  member,
  regionPerZipcode
) {
  if (listElement.length > 0) {
    const element = listElement.shift();
    const detailProduct = await this.getProductByIdAndLanguage(
      element.product_id
    );
    const productsInOtherLanguages = _(
      await Promise.all(
        this.otherLangs.map((lang) =>
          this.getProductByIdAndLanguage(element.product_id, lang)
        )
      )
    )
      .compact()
      .flatten()
      .first();

    const product = {
      ...detailProduct,
      ...productsInOtherLanguages,
      member,
      state: 'HIDDEN',
      importType: this.importType,
      type: this.getType(element),
      specialId: element.product_id,
      metadata: JSON.stringify({
        product_id: element.product_id,
        product_supplier_id: element.product_supplier_id,
        sku: element.sku
      }),
      supplierId: element.product_supplier_id,
      supplierName: await this.getSupplierName(element.product_supplier_id),
      name: this.getName(element.name),
      address: await this.getAddress(element, regionPerZipcode),
      language: await this.getLanguage(element),
      localization: {
        lat: element.geo_lat,
        lon: element.geo_lon
      },
      openingEveryDay: true,
      description: DataString.stripTags(element.description),
      shortDescription: DataString.cutString(
        DataString.stripTags(element.short_description)
      ),
      complement: this.getComplement(element),
      complementAccueil: this.getComplementAccueil(element),
      price: this.getPrice(element),
      reservation: this.getReservation(element),
      privateData: this.getPrivateData(element),
      displayForUser: _(element.category_ids).keys().valueOf()
    };

    if (product.type === 'FETE_ET_MANIFESTATION') {
      product.scope = 2352;
    }

    // ent is defined by supplier
    const objSupplier = _.find(configImportRegionDo.supplier, {
      id: Number(product.supplierId)
    });
    if (objSupplier) {
      product.activityProvider = objSupplier.id_apidae;
      product.activityProviderType = objSupplier.type_apidae;
      this.entApidaeId = objSupplier.ent_apidae;
    }
    product.legalEntity = await this.getLegalEntity(product);

    if (!product.legalEntity.length) {
      console.error('No ent for', product.name);
    }

    console.log(
      'import specialId ==>',
      product.specialId,
      'name ===>',
      product.name
    );
    await this.doUpsertAsync(product, product.specialId, product.importType);
    return this.importProduct(listElement, member, regionPerZipcode);
  } else {
    return;
  }
};

ImportGenericRegionDo.prototype.getName = (name) => {
  return name.trim().replace("' ", "'").replace(" '", "'");
};

ImportGenericRegionDo.prototype.getSupplierName = async function (supplierId) {
  const {
    data: { data },
    status
  } = await this.currentInstance.get(
    `/integration/suppliers?regiondo_supplier_id=${supplierId}`,
    {
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 404; // not error if 404
      }
    }
  );
  if (status === 200 && data && data[0]) {
    return data[0].company_name;
  }
  return null;
};

ImportGenericRegionDo.prototype.getProductByIdAndLanguage = async function (
  productId,
  language = ''
) {
  const {
    data: { data },
    status
  } = await this.currentInstance.get(
    `/products/${productId}?store_locale=${language}`,
    {
      validateStatus(status) {
        return (status >= 200 && status < 300) || status === 404; // not error if 404
      }
    }
  );
  if (status === 200 && data) {
    const lang = language ? langMapping[language] : '';
    return {
      image: _.map(data.image_url, (url) => ({ url })),
      [`name${lang}`]: data.name,
      [`description${lang}`]: DataString.stripTags(data.description),
      [`shortDescription${lang}`]: DataString.cutString(
        DataString.stripTags(data.short_description)
      )
    };
  }
  return null;
};

ImportGenericRegionDo.prototype.getComplement = function (element) {
  let complement = '';
  if (element.location_name) {
    complement += `${element.location_name}\n`;
  }
  if (element.location_specific_info) {
    complement += `${element.location_specific_info}\n`;
  }
  if (element.parking_options_comment) {
    complement += `${element.parking_options_comment}\n`;
  }
  if (element.public_transport_comment) {
    complement += `${element.public_transport_comment}\n`;
  }

  return DataString.stripTags(complement);
};

ImportGenericRegionDo.prototype.getComplementAccueil = function (element) {
  let complementAccueil = '';
  if (element.faq_customer_requirements) {
    complementAccueil += `${element.faq_customer_requirements}\n`;
  }
  if (element.important_info) {
    complementAccueil += `${element.important_info}\n`;
  }
  if (element.faq_other_info) {
    complementAccueil += `${element.faq_other_info}\n`;
  }

  return DataString.stripTags(complementAccueil);
};

ImportGenericRegionDo.prototype.getPrice = function (element) {
  let price = {
    description: '',
    detail: []
  };
  if (element.faq_included) {
    price.description += DataString.stripTags(
      `Compris dans l'offre :\n ${element.faq_included}\n`
    );
  }
  if (element.faq_not_included) {
    price.description += DataString.stripTags(
      `Non compris dans l'offre :\n ${element.faq_not_included}\n`
    );
  }
  if (price.description) {
    price.description = price.description.replace(/[.]/g, '\n');
  }
  if (element.base_price) {
    price.detail.push({
      dateStart: moment('2021-01-01 00:00:00.0'),
      dateEnd: moment('2021-12-31 00:00:00.0'),
      price: [
        {
          min: element.base_price
        }
      ]
    });
  }
  return price;
};

ImportGenericRegionDo.prototype.getReservation = function (element) {
  if (element.wl_regiondo_url) {
    return [
      {
        type: 475,
        website: [element.wl_regiondo_url]
      }
    ];
  }
  return [];
};

/**
 * Get privateData
 *
 * @param {Object} product
 * @returns {Array}
 */
ImportGenericRegionDo.prototype.getPrivateData = function (element) {
  var privateData = {
    objetsTouristiques: [
      {
        donneesPrivees: []
      }
    ]
  };

  if (element.duration_values && element.duration_type) {
    privateData.objetsTouristiques[0].donneesPrivees.push({
      nomTechnique: '1490_regiondo-duree',
      descriptif: {
        libelleFr: `${element.duration_values} ${element.duration_type}`
      }
    });
  }

  if (element.faq_participants) {
    privateData.objetsTouristiques[0].donneesPrivees.push({
      nomTechnique: '1490_regiondo-participants',
      descriptif: {
        libelleFr: element.faq_participants
      }
    });
  }

  if (element.base_price) {
    privateData.objetsTouristiques[0].donneesPrivees.push({
      nomTechnique: '1490_regiondo-prix',
      descriptif: {
        libelleFr: element.base_price
      }
    });
  }

  if (privateData.objetsTouristiques[0].donneesPrivees.length > 0) {
    privateData = JSON.stringify(privateData);
  }
  return privateData;
};

ImportGenericRegionDo.prototype.getAddress = async (
  element,
  regionPerZipcode
) => {
  const address = {
    address1: element.location_address
  };
  let zipcode = element.zipcode;
  // if not zipcode, call api with lon and lat
  if (!zipcode) {
    try {
      const resultZipcode = await axios.get(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${element.geo_lon}&lat=${element.geo_lat}`
      );
      if (resultZipcode.data.features.length > 0) {
        zipcode = resultZipcode.data.features[0].properties.postcode;
      }
    } catch (error) {
      console.error(
        `get zipcode with lat=${element.geo_lat} and lon=${element.geo_lon}`,
        error.message
      );
    }
  }

  if (zipcode) {
    zipcode = String(zipcode);
    if (zipcode.length === 4) {
      zipcode = `0${zipcode}`;
    }
    address.zipcode = zipcode;
    address.region = regionPerZipcode[String(zipcode).substring(0, 2)];
    const city = _.first(configSitraTown[zipcode]);
    if (city) {
      address.city = city.sitraId;
      address.insee = city.insee;
    }
  }
  return address;
};

ImportGenericRegionDo.prototype.getLanguage = function (element) {
  const language = [];
  if (element.language_ids) {
    const langIds = element.language_ids.split(',');
    _.forEach(langIds, (language_id) => {
      const objLang = _.find(configImportRegionDo.langues, { language_id });
      if (objLang) {
        language.push(objLang.id_apidae);
      }
    });
  }
  return language;
};

ImportGenericRegionDo.prototype.getLegalEntity = async function (product) {
  const listLegalEntity = [];
  let legalEntity = await importUtils.findLegalEntityBySpecialIdSitra(
    this.entApidaeId
  );

  if (!legalEntity) {
    try {
      legalEntity = await importUtils.createLegalEntity({
        importType: this.importType,
        type: 'STRUCTURE',
        specialIdSitra: this.entApidaeId,
        name: 'Presta test RegionDO',
        address: product.address
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (legalEntity) {
    if (!legalEntity.website) {
      legalEntity.website = [];
    }
    if (!legalEntity.email) {
      legalEntity.email = [];
    }
    if (!legalEntity.phone) {
      legalEntity.phone = [];
    }
    if (!legalEntity.fax) {
      legalEntity.fax = [];
    }

    listLegalEntity.push({
      type: 'gestion',
      product: legalEntity
    });

    if (product.reservation && product.reservation.length) {
      var resa = product.reservation[0];
      legalEntity.website = DataString.concatArray(
        legalEntity.website,
        resa.website
      );
      legalEntity.email = DataString.concatArray(legalEntity.email, resa.email);
      legalEntity.phone = DataString.concatArray(legalEntity.phone, resa.phone);
      legalEntity.fax = DataString.concatArray(legalEntity.fax, resa.fax);
      listLegalEntity.push({
        type: 'reservation',
        product: legalEntity
      });
    }
  }

  return listLegalEntity;
};

ImportGenericRegionDo.prototype.getType = function (element) {
  const categoryId = _(element.category_ids).keys().map(Number).last();
  let type = null;
  const obj = _.find(configImportRegionDo.type, {
    id_apidae: categoryId
  });
  if (obj && !type) {
    type = obj.type_apidae;
  }
  if (!type) {
    type = 'ACTIVITE';
  }
  return type;
};

module.exports = ImportGenericRegionDo;
