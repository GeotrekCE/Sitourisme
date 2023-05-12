'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const DataString = require(__dirname +
  '/../../../../library/data/manipulate.js');
const config = require(__dirname + '/../../../../config/config.js');
const configSitra = require(__dirname + '/../../../../config/configSitra.js');
const configSitraTownAndMember = require(__dirname +
  '/../../../../config/configSitraTownAndMember.js');
const configSitraReference = require(__dirname +
  '/../../../../config/configSitraReference.js');
const ExportSitra = require(__dirname + '/exportSitra.server.model.js');
const productmodel = require(__dirname + '/product.model.js');
/**
 * Class ProductFactory
 * Enable create a product's mongoose instance, and init generic CRUD methods
 */
class ProductFactory {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema || {};
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getSchema() {
    return this.schema;
  }

  setSchema(schema) {
    this.schema = schema;
  }

  getMongooseSchema() {
    return new Schema(this.schema, {
      versionKey: false
    });
  }

  setMongooseModel(ProductSchema) {
    mongoose.model(this.name, ProductSchema);
  }

  getDefaultProductSchema() {
    return productmodel.defaultProductSchema;
  }

  /**
   * Method get by url
   */
  getByUrl(url, callback) {
    var Product = mongoose.model(this.name);
    Product.find({ url }).exec((err, product) => {
      if (err) {
        console.log('Error in ' + this.name + ' getByUrl() : ' + err);
      }

      if (callback) {
        callback(err, product);
      }
    });
  }

  /**
   * Method save
   */
  save(product, callback) {
    var Product = mongoose.model(this.name),
      address = product.address ? product.address : null,
      zipcode = address && address.zipcode ? address.zipcode : null,
      data,
      dataL,
      i;

    // Update date last update
    product.lastUpdate = new Date();

    if (!product.url) {
      product.url = this.buildUrl(product);
    }

    product.territory = null;

    if (zipcode && configSitraTownAndMember.perZipcode[zipcode]) {
      data = configSitraTownAndMember.perZipcode[zipcode];
      dataL = data.length;
      for (i = 0; i < dataL; i++) {
        if (address.insee && address.insee === data[i].insee) {
          product.territory = data[i].arrTerritory;
          break;
        }
      }
    }

    // Check url
    __checkUrlHttp(product);

    if (product.specialIdSitra) {
      product.statusImport = 2;
    } else if (
      product.type !== 'NON DEFINI' &&
      (!product.alert || !product.alert.length) &&
      product.member
    ) {
      product.statusImport = 1;
    } else if (product.type === 'STRUCTURE') {
      product.statusImport = 1;
    } else {
      product.statusImport = 0;
    }

    // passerelle arrếté
    if (product.gatewayStatus === false) {
      product.statusImport = 4;
    }

    // Init alert
    product.alert = __checkAlert(product, this.name);
    
    product.save((err) => {
      if (err) {
        // Fix problem with unique url
        if (err.code === 11000) {
          product.url = product.url + 'A';
          return Product.save(product, callback);
        }

        console.log('Error in ' + this.name + ' save() : ', err);
      }

      if (callback && !err) {
        callback(err, product);
      }
    });
  }

  /**
   * Build url
   *
   * @param {Object} product
   * @returns {String}
   */
  buildUrl(product) {
    return `${this.name}/Detail/${this.cleanUrl(product.type)}${
      product.address && product.address.city
        ? '/' + this.cleanUrl(product.address.city)
        : ''
    }/${this.cleanUrl(product.name)}/${this.cleanUrl(product.specialId)}`;
  }

  /**
   * Clean url
   *
   * @param {String} str
   * @returns {String}
   */
  cleanUrl(str) {
    if (typeof str === 'string') {
      str = DataString.removeAccents(str).replace(/[^a-z0-9\-_]/gi, '-');
    }

    return str;
  }

  /**
   * Method check phone
   */
  checkPhone(phone, fieldName) {
    var alert = [],
      phoneRegExpAlertChar = /([^0-9\ ])/,
      phoneRegExpAlertStartWith = /^04|^06|^07|^08|^09/,
      phoneRegExpFinal =
        /^([0-9]{2}) ([0-9]{2}) ([0-9]{2}) ([0-9]{2}) ([0-9]{2})$/;

    if (phone && phone.length) {
      if (phone.match(phoneRegExpAlertChar)) {
        alert.push(
          'Le champ ' +
            fieldName +
            " a un caractère autre qu'un numérique ou espace"
        );
      } else if (!phone.match(phoneRegExpFinal)) {
        alert.push('Le champ ' + fieldName + " n'a pas un format standard");
      } else if (!phone.match(phoneRegExpAlertStartWith)) {
        alert.push(
          'Le champ ' + fieldName + ' ne commence pas par 04, 06, 07, 08, 09'
        );
      }
    }

    return alert;
  }

  /**
   * Method check email
   */
  checkEmail(email, fieldName) {
    var alert = [];

    if (
      !!email &&
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      alert.push('Le champ ' + fieldName + " n'a pas un format standard");
    }

    return alert;
  }

  /**
   * Method delete
   */
  delete(product, callback) {
    // ToDo : modifier mieux plus tard (écris par Nacim)
    if (product.remove) {
      product.remove((err) => {
        if (err) {
          console.log('Error in ' + this.name + ' delete() : ' + err);
          console.log(product);
        }

        if (callback) {
          callback(err);
        }
      });
    }
  }

  /**
   * Method do upsert
   */
  doUpsert(datas, specialId, importType, callback) {
    const Product = mongoose.model(this.name);
    let params = {};

    // Avoid to duplicate legalEntities - address is the matching key
    if (
      this.name === 'LegalEntity' &&
      (datas.address.address1 || datas.address.address2)
    ) {
      params = {
        'address.address1': datas.address.address1,
        'address.address2': datas.address.address2,
        'address.city': datas.address.city,
        'address.insee': datas.address.insee
      };
    } else {
      params = { specialId, importType };
    }

    Product.find(params, (err, docs) => {
      if (err) {
        console.log('Error in ' + this.name + ' doUpsert() : ' + err);
        if (callback) {
          callback(err);
        }
      } else {
        var product =
          docs.length > 0 ? _.extend(docs[0], datas) : new Product(datas);
        // Save
        Product.save(product, callback);
      }
    });
  }

  /**
   * Method export sitra
   */
  exportSitra(products, options, callback) {
    var optionsExportSitra = options || {};
    optionsExportSitra.typeExport = this.name;

    ExportSitra.exportSitra(products, optionsExportSitra, callback);
  }

  /**
   * Method remove product In Sitra
   */
  exportSitraAuto(type, options, callback) {
    options.typeExport = this.name;
    ExportSitra.exportSitraAuto(type, options, callback);
  }
  /**
   * Method removeFromSitra
   */
  /* removeFromSitra(importSubType, specialIdSitraArr, callback) {
    ExportSitra.removeFromSitra(importSubType, specialIdSitraArr, callback);
  } */

  /**
   * Method remove product In Sitra
   */
  removeProductInSitra(product, callback) {
    ExportSitra.removeProductInSitra(product, callback);
  }

  /**
   * Method get sitra sub type
   */
  getSitraSubType(product) {
    var objSubType = {},
      productType = product.type,
      typeLabel,
      configSitraReferenceL,
      i;

    switch (productType) {
      case 'PATRIMOINE_CULTUREL':
        typeLabel = 'PatrimoineCulturelType';
        break;

      case 'PATRIMOINE_NATUREL':
        typeLabel = null;
        break;

      case 'DEGUSTATION':
        typeLabel = null;
        break;

      case 'ACTIVITE':
        typeLabel = 'ActiviteType';
        break;

      case 'EQUIPEMENT':
        typeLabel = 'EquipementRubrique';
        break;

      case 'COMMERCE_ET_SERVICE':
        typeLabel = 'CommerceEtServiceType';
        break;

      case 'HEBERGEMENT_LOCATIF':
        typeLabel = 'HebergementLocatifType';
        break;

      case 'HEBERGEMENT_COLLECTIF':
        typeLabel = 'HebergementCollectifType';
        break;

      case 'HOTELLERIE':
        typeLabel = 'HotellerieType';
        break;

      case 'HOTELLERIE_PLEIN_AIR':
        typeLabel = 'HotelleriePleinAirType';
        break;

      case 'RESTAURATION':
        typeLabel = 'RestaurationType';
        break;

      case 'FETE_ET_MANIFESTATION':
        typeLabel = 'FeteEtManifestationType';
        break;

      case 'SEJOUR_PACKAGE':
        typeLabel = null;
        break;

      case 'NON DEFINI':
        typeLabel = null;
        break;

      default:
        typeLabel = null;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Missing type "' +
              productType +
              '" for sub type in getSitraSubType()'
          );
        }
        break;
    }

    if (typeLabel && configSitraReference) {
      if (configSitraReference[typeLabel]) {
        configSitraReferenceL = configSitraReference[typeLabel].length;
        for (i = 0; i < configSitraReferenceL; i++) {
          objSubType[configSitraReference[typeLabel][i].id] =
            configSitraReference[typeLabel][i].labelFr;
        }
      }
    }

    return objSubType;
  }

  /**
   * Method get sitra keys
   */
  getSitraKeys(data) {
    var arrKeys = [],
      arrKeysTmp;

    _.forEach(
      data,
      function (value, key) {
        if (_.isArray(value) || _.isObject(value)) {
          arrKeysTmp = this.getSitraKeys(value);
          if (arrKeysTmp && arrKeysTmp.length) {
            arrKeys = arrKeys.concat(arrKeysTmp);
          }
        } else if (Number.isInteger(value) && value > 0) {
          if (key !== 'city') {
            arrKeys.push(value);
          }
        }
      },
      this
    );

    return arrKeys;
  }

  /**
   * Method get sitra reference
   */
  getSitraReference(data) {
    var reference = {},
      label,
      arrKeys = this.getSitraKeys(data),
      arrKeysL = arrKeys ? arrKeys.length : 0,
      i;

    for (i = 0; i < arrKeysL; i++) {
      label = __retrieveConfigSitraLabel(arrKeys[i]);
      if (label) {
        reference[arrKeys[i]] = label;
      }
    }

    return reference;
  }

  /**
   * Method get sitra personType reference for VAR83
   */
  getSitraPersonTypeReference(data) {
    var reference = {},
      personTypeIdArr = [4196, 458, 464, 459, 467];

    personTypeIdArr.forEach(function (id) {
      reference[id] = configSitra.reference[id].labelFr;
    });

    return reference;
  }

  /**
   * Method get status import reference
   */
  getStatusImportReference(data) {
    var reference = {
      0: 'non importable',
      1: 'importable',
      2: 'importé',
      3: 'supprimé',
      4: 'passerelle arrêtée'
    };

    return reference;
  }

  /**
   * Method get sitra member reference
   */
  getSitraMemberReference(data) {
    var reference = {},
      memberId = data.member ? data.member : null,
      configMember = configSitraTownAndMember.perMemberId,
      dataMember =
        memberId && configMember && configMember[memberId]
          ? configMember[memberId]
          : null;

    if (dataMember) {
      reference[memberId] = dataMember.labelFr;
    }

    return reference;
  }

  /**
   * Method get sitra civility reference
   */
  getSitraCivilityReference(data) {
    var reference = {},
      civilities = configSitraReference.ContactCivilite;

    if (civilities) {
      _.forEach(civilities, function (dataCivility) {
        reference[dataCivility.id] = dataCivility.labelFr;
      });
    }

    return reference;
  }

  /**
   * Method get sitra internalCriteria reference
   */
  getSITRAInternalCriteriaReference() {
    var reference = {},
      internalCriteria = configSitraReference.internalCriteria;

    if (internalCriteria) {
      _.forEach(internalCriteria, function (dataInternalCriteria) {
        reference[dataInternalCriteria.id] = dataInternalCriteria.labelFr;
      });
    }

    return reference;
  }
}

module.exports = ProductFactory;

/**
 * Retrieve config sitra
 *
 * @param {String} idSitra
 * @returns {String|null}
 * @private
 */
function __retrieveConfigSitraLabel(idSitra) {
  if (
    configSitra.reference[idSitra] &&
    configSitra.reference[idSitra].labelFr
  ) {
    return configSitra.reference[idSitra].labelFr;
  } else if (
    configSitra.territory[idSitra] &&
    configSitra.territory[idSitra].labelFr
  ) {
    return configSitra.territory[idSitra].labelFr;
  } else {
    return null;
  }
}

/**
 * Check http url
 *
 * @param {Object} product
 * @private
 */
function __checkUrlHttp(product) {
  if (product.image) {
    _.forEach(product.image, function (image, i) {
      product.image[i].url = __cleanUrlHttp(image.url);
    });
  }
  if (product.pdf) {
    _.forEach(product.pdf, function (pdf, i) {
      product.pdf[i].url = __cleanUrlHttp(pdf.url);
    });
  }
  if (product.video) {
    _.forEach(product.video, function (video, i) {
      product.video[i].url = __cleanUrlHttp(video.url);
    });
  }
  if (product.socialNetwork) {
    _.forEach(product.socialNetwork, function (socialNetwork, i) {
      product.socialNetwork[i].url = __cleanUrlHttp(socialNetwork.url);
    });
  }
  if (product.website) {
    _.forEach(product.website, function (website, i) {
      product.website[i] = __cleanUrlHttp(website);
    });
  }
  if (product.reservation) {
    _.forEach(product.reservation, function (reservation, i) {
      if (reservation.website) {
        _.forEach(reservation.website, function (website, j) {
          product.reservation[i].website[j] = __cleanUrlHttp(website);
        });
      }
    });
  }
  if (product.contact) {
    _.forEach(product.contact, function (contact, i) {
      if (contact.website) {
        _.forEach(contact.website, function (website, j) {
          product.contact[i].website[j] = __cleanUrlHttp(website);
        });
      }
    });
  }
}

/**
 * Clean url
 *
 * @param {String} url
 * @return {String} The clean url
 * @private
 */
function __cleanUrlHttp(url) {
  if (url && _.isString(url) && !url.match('^https?://|^//')) {
    url = 'http://' + url;
  }

  return url;
}

/**
 * Check alert
 *
 * @param {Object} product
 * @private
 */
function __checkAlert(product, moduleName) {
  var alert = [],
    Product = mongoose.model(moduleName),
    nameClean,
    address = product.address,
    productTypeLC = product.importType
      ? product.importType.toLowerCase()
      : null,
    arrDpt,
    dpt;

  if (product.statusImport === 4) {
    alert.push('passerelle arrêtée');
  }

  // Type
  if (!product.type || product.type === 'NON DEFINI') {
    alert.push("Nos scripts n'ont pas réussi à déterminer le type");
  }
  // Type code
  if (product.typeCode) {
    nameClean = DataString.removeAccents(product.name);
    if (product.typeCode !== 'HPA' && nameClean.match(/Camping/i)) {
      alert.push('Le titre contient "Camping" mais le type n\'est pas un HPA');
    }
    if (product.typeCode !== 'HOT' && nameClean.match(/Hotel/i)) {
      alert.push('Le titre contient "Hotel" mais le type n\'est pas un HPA');
    }
  }
  // Address
  if (address) {
    if (address.zipcode && !address.zipcode.match(/^[0-9][AB0-9][0-9]{3}$/)) {
      alert.push("Le champ code postal n'a pas un format standard");
    } else {
      alert.push("Le champ code postal n'est pas renseigné");
    }
    if (address.city === 0) {
      product.address.city = null;
      alert.push("La commune n'existe pas");
    } else if (!address.city) {
      alert.push("Le champ commune n'est pas renseigné");
    }
  } else {
    alert.push("Le champ adresse n'est pas renseigné");
  }

  // Altitude
  if (product.altitude && product.altitude > 3000) {
    alert.push('Le champ altitude est supérieur à 3000m');
  }

  if (product.type && product.subType) {
    switch (product.type) {
      case 'COMMERCE_ET_SERVICE':
        // subType authorized
        if (![1874, 1875, 4012, 4013, 4014, 4015].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'EQUIPEMENT':
        // subType authorized
        if (![2988, 2991, 2993].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HEBERGEMENT_COLLECTIF':
      case 'HEBERGEMENT_LOCATIF':
        break;
      case 'HOTELLERIE':
        // subType authorized
        if (![2734, 2736].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HOTELLERIE_PLEIN_AIR':
        // subType authorized
        if (![2409, 2410, 2413, 2416, 2418, 3722].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'PATRIMOINE_CULTUREL':
        // subType authorized
        if (
          ![3200, 3201, 3202, 3203, 3204, 3205, 3851].includes(product.subType)
        ) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'RESTAURATION':
        // subType authorized
        if (![2859, 2861, 2865, 2866, 4528].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'FETE_ET_MANIFESTATION':
        // subType authorized
        if (
          ![1958, 1959, 1962, 1966, 1971, 1973, 1974].includes(product.subType)
        ) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      default:
        break;
    }
  }

  // Phone
  // if (product.phone) {
  // 	_.forEach(product.phone, function (phone) {
  // 		alert = alert.concat(Product.checkPhone(phone, 'téléphone'));
  // 	});
  // }
  // Fax
  // if (product.fax) {
  // 	_.forEach(product.fax, function (fax) {
  // 		alert = alert.concat(Product.checkPhone(fax, 'fax'));
  // 	});
  // }
  // Email
  if (product.email && product.email.length) {
    _.forEach(product.email, function (email) {
      alert = alert.concat(Product.checkEmail(email, 'email'));
    });
  }

  // short description
  if (product.shortDescription && product.shortDescription.length > 255) {
    alert.push('la description court dépasse la longueur de 255 caractères!');
  }

  return alert.length ? alert : null;
}
