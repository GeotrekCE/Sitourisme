const util = require('util');
const path = require('path');
const axios = require('axios');
const pify = require('pify');
const _ = require('lodash');
const Import = require(path.resolve('library/import/generic.js'));
const importUtils = require(__dirname + '/../../importUtils.server.model.js');
const configImportGEOTREK = require(path.resolve(
  'config/configImport_GEOTREK.js'
));
const configSitraTownByInsee = require(path.resolve(
  'config/configSitraTownByInsee.js'
));
const DataString = require(path.resolve('library/data/manipulate.js'));

const ImportGenericGeotrekApi = function (options) {
  this.importType = options.importType
    ? options.importType.toUpperCase()
    : null;
  this.user = options.user ? options.user : null;
  this.lang = options.lang ? options.lang : 'fr';
  this.baseURL = 'https://geotrek-admin.ecrins-parcnational.fr/api/v2';
  this.instanceApi = axios.create({
    baseURL: this.baseURL,
    ValidityStatus(status) {
      return status < 500;
    }
  });
};

// Inherits of import
util.inherits(ImportGenericGeotrekApi, Import);

ImportGenericGeotrekApi.prototype.import = function (data, next) {
  try {
    importUtils.initRegion((regionPerZipcode) =>
      this.executeQuery(regionPerZipcode)
    );
  } catch (err) {
    console.error(err);
    next();
  }
};

ImportGenericGeotrekApi.prototype.executeQuery = async function (
  regionPerZipcode
) {
  const { data, status } = await this.instanceApi.get('/tour/?format=json');
  if (status === 200) {
    this.doUpsertAsync = await pify(importUtils.doUpsert);
    await this.importProduct(data.results, regionPerZipcode);
  } else {
    console.error(status, data);
  }
};

ImportGenericGeotrekApi.prototype.importProduct = async function (
  listElement,
  regionPerZipcode
) {
  if (listElement && listElement.length > 0) {
    const element = listElement.shift();
    delete element.steps;
    delete element.geometry;

    this.configData = {
      specialId: null,
      codeType: 'EQU',
      subType: '2988',
      member: this.getMember(element)
    };

    // URL en fonction du nom de fichier
    if (this.baseURL.match('ecrins')) {
      this.idProject = 1;
      this.idUrl = 1;
    } else if (this.baseURL.match('chemindesparcs')) {
      this.idProject = 2;
      this.idUrl = 2;
    } else if (this.baseURL.match('sisterons')) {
      this.idProject = 1;
      this.idUrl = 3;
    } else if (this.baseURL.match('portcros')) {
      this.idProject = 3;
      this.idUrl = 4;
    } else if (this.filename.match('alpeshauteprovence')) {
      this.idProject = 5;
      this.idUrl = 6;
    } else if (this.filename.match('alpes')) {
      this.idProject = 4;
      this.idUrl = 5;
    } else if (this.filename.match('mercantour')) {
      this.idProject = 6;
      this.idUrl = 7;
    }

    let additionalInformation = {};
    if (element.information_desks.length) {
      const { data: informationsDesk } = await this.instanceApi.get(
        `/informationdesk/${_.last(element.information_desks)}/?format=json`
      );
      additionalInformation = informationsDesk;
    }

    const product = {
      importType: this.importType,
      importSubType: null,
      typeCode: this.configData.codeType,
      type: configImportGEOTREK.types[this.configData.codeType],
      specialId: element.id,
      subType: this.configData.subType,
      member: this.configData.member,
      state: 'HIDDEN',
      user: this.user,
      name: element.name['fr'],
      nameEn: element.name['en'],
      nameEs: element.name['es'],
      nameIt: element.name['it'],
      nameDe: element.name['de'],
      nameNl: element.name['nl'],
      // activity
      complementAccueil: await this.getComplementAccueil(element, 'fr'),
      complementAccueilEn: await this.getComplementAccueil(element, 'en'),
      complementAccueilEs: await this.getComplementAccueil(element, 'es'),
      complementAccueilIt: await this.getComplementAccueil(element, 'it'),
      complementAccueilDe: await this.getComplementAccueil(element, 'de'),
      complementAccueilNl: await this.getComplementAccueil(element, 'nl'),
      // animauxAcceptes,
      ambianceIdSitra: 5536,
      ambianceLibelle: this.getAmbianceLibelle(element, 'fr'),
      ambianceLibelleEn: this.getAmbianceLibelle(element, 'en'),
      ambianceLibelleEs: this.getAmbianceLibelle(element, 'es'),
      ambianceLibelleIt: this.getAmbianceLibelle(element, 'it'),
      ambianceLibelleDe: this.getAmbianceLibelle(element, 'de'),
      ambianceLibelleNl: this.getAmbianceLibelle(element, 'nl'),
      passagesDelicats: this.getPassagesDelicats(element, 'fr'),
      passagesDelicatsEn: this.getPassagesDelicats(element, 'en'),
      passagesDelicatsEs: this.getPassagesDelicats(element, 'es'),
      passagesDelicatsIt: this.getPassagesDelicats(element, 'it'),
      passagesDelicatsDe: this.getPassagesDelicats(element, 'de'),
      passagesDelicatsNl: this.getPassagesDelicats(element, 'nl'),
      complement: this.getComplement(element, 'fr'),
      complementEn: this.getComplement(element, 'en'),
      complementEs: this.getComplement(element, 'es'),
      complementIt: this.getComplement(element, 'it'),
      complementDe: this.getComplement(element, 'de'),
      complementNl: this.getComplement(element, 'nl'),
      localization: this.getLocalization(element),
      price: this.getPrice(element),
      itinerary: await this.getItinerary(element),
      perimetreGeographique: this.getPerimetreGeographique(element),
      description: this.getDescription(element, 'fr'),
      descriptionEn: this.getDescription(element, 'en'),
      descriptionEs: this.getDescription(element, 'es'),
      descriptionIt: this.getDescription(element, 'it'),
      descriptionDe: this.getDescription(element, 'de'),
      descriptionNl: this.getDescription(element, 'nl'),
      shortDescription: this.getShortDescription(element, 'fr'),
      shortDescriptionEn: this.getShortDescription(element, 'en'),
      shortDescriptionEs: this.getShortDescription(element, 'es'),
      shortDescriptionIt: this.getShortDescription(element, 'it'),
      shortDescriptionDe: this.getShortDescription(element, 'de'),
      shortDescriptionNl: this.getShortDescription(element, 'nl'),
      address: this.getAddress(
        element,
        additionalInformation,
        regionPerZipcode
      ),
      website: this.getWebsite(additionalInformation),
      email: this.getEmail(additionalInformation),
      phone: this.getPhone(additionalInformation),
      gpx: this.getGpx(element),
      kml: this.getKml(element),
      video: this.getVideo(element, 'fr'),
      videoEn: this.getVideo(element, 'en'),
      videoEs: this.getVideo(element, 'es'),
      videoIt: this.getVideo(element, 'it'),
      videoDe: this.getVideo(element, 'de'),
      videoNl: this.getVideo(element, 'nl'),
      pdf: this.getPdf(element, 'fr'),
      pdfEn: this.getPdf(element, 'en'),
      pdfEs: this.getPdf(element, 'es'),
      pdfIt: this.getPdf(element, 'it'),
      pdfDe: this.getPdf(element, 'de'),
      pdfNl: this.getPdf(element, 'nl'),
      image: this.getImage(element)
    };

    product.legalEntity = this.getLegalEntity(element, product);
    product.rateCompletion = this.calculateRateCompletion(product);

    await this.doUpsertAsync(product, product.specialId, product.importType);
    return this.importProduct(listElement, regionPerZipcode);
  } else {
    return;
  }
};

ImportGenericGeotrekApi.prototype.getMember = function (dataProduct) {
  let member = 3437; // geotrek pnr verdon - preprod by default
  if (process.env.NODE_ENV === 'production') {
    if (this.baseURL.match('ecrins')) {
      member = 4433;
    } else if (this.baseURL.match('chemindesparcs')) {
      member = 4430;
      const idStructure = _.get(dataProduct, 'properties.structure.id');
      switch (idStructure) {
        case 2:
          member = 5112; // Luberon
          break;
        case 3:
          member = 5163; // Camarguque
          break;
        case 4:
          member = 5113; // Queyras
          break;
        case 5:
          member = 4730; // Verdon
          break;
        case 6:
          member = 5033; // Alpilles
          break;
        case 7:
          member = 5682; // Baronnies
          break;
        case 8:
          member = 5052; // Préalpes
          break;
        case 9:
          member = 5017; // Sainte Baume
          break;
        case 10:
          member = 5446; // Ventoux
          break;
        default:
          break;
      }
    } else if (this.baseURL.match('sisteron')) {
      member = 4832;
    } else if (this.baseURL.match('portcros')) {
      member = 5193;
    } else if (this.baseURL.match('alpes')) {
      member = 5545;
    }
  }
  return member;
};

ImportGenericGeotrekApi.prototype.getComplementAccueil = async function (
  element,
  lang
) {
  const { data } = await this.instanceApi.get(
    `trek_difficulty/${element.difficulty}/?format=json`
  );
  return data.label[lang];
};

ImportGenericGeotrekApi.prototype.getAmbianceLibelle = function (
  element,
  lang
) {
  let ambianceLibelle = null;
  if (element.ambiance && element.ambiance[lang]) {
    ambianceLibelle = DataString.stripTags(
      DataString.strEncode(element.ambiance[lang])
    );
  }
  return ambianceLibelle;
};

ImportGenericGeotrekApi.prototype.getPassagesDelicats = function (
  element,
  lang
) {
  if (element.advice && element.advice[lang]) {
    return DataString.stripTags(DataString.strEncode(element.advice[lang]));
  }
  return null;
};

ImportGenericGeotrekApi.prototype.getComplement = function (element, lang) {
  let complement = '';

  if (element.departure && element.departure[lang]) {
    complement += `${this.translate('departure', lang)} : ${
      element.departure[lang]
    }.`;
  }
  if (element.arrival && element.arrival[lang]) {
    complement += `\n${this.translate('arrival', lang)} : ${
      element.arrival[lang]
    }.`;
  }
  if (element.access && element.access[lang]) {
    complement += `\n${element.access[lang]}`;
  }
  if (element.advised_parking && element.advised_parking[lang]) {
    complement += `\n${this.translate('advised_parking', lang)} : ${
      element.advised_parking[lang]
    } .`;
  }
  if (element.public_transport && element.public_transport[lang]) {
    complement += `\n${element.public_transport[lang]}`;
  }
  if (complement) {
    complement = DataString.stripTags(DataString.strEncode(complement));
  }
  return complement;
};

ImportGenericGeotrekApi.prototype.getLocalization = function (element) {
  const localization = {};
  if (element.parking_location && element.parking_location.length) {
    localization.lat = element.parking_location[1];
    localization.lon = element.parking_location[0];
  }
  return localization;
};

ImportGenericGeotrekApi.prototype.getPrice = function (element) {
  return {
    gratuit: true
  };
};

ImportGenericGeotrekApi.prototype.getItinerary = async function (element) {
  const itineraire = {
    dailyDuration: null,
    distance: null,
    positive: null,
    negative: null,
    referencesTopoguides: null,
    itineraireType: null,
    itineraireBalise: null,
    precisionsBalisage: ''
  };
  if (element.max_elevation) {
    itineraire.altitudeMaximum = element.max_elevation;
  }
  if (element.duration) {
    itineraire.dailyDuration = DataString.convertDuration(element.duration);
  }
  if (element.length_2d) {
    itineraire.distance = DataString.convertDistance(element.length_2d);
  }
  if (element.ascent) {
    itineraire.positive = element.ascent;
  }
  if (element.descent) {
    itineraire.negative = DataString.convertNegative(element.descent);
  }
  if (element.route) {
    itineraire.itineraireType =
      configImportGEOTREK.itineraireType[element.route];
  }
  if (element.slug) {
    const slugCategory = this.getSlugCategory(element);
    if (slugCategory) {
      itineraire.referencesTopoguides = this.addUrlHttp(
        `/${slugCategory}/${element.slug}/`
      );
    }
  }
  if (element.networks && element.networks.length) {
    const trekNetwork = await Promise.all(
      element.networks.map((id) => this.instanceApi.get(`/trek_network/${id}`))
    );
    const labelNetworks = _(trekNetwork).map('data').map('label').valueOf();

    itineraire.itineraireBalise = 'BALISE';
    let sep = '';
    _.forEach(labelNetworks, (label) => {
      if (label[this.lang] === 'PR') {
        itineraire.precisionsBalisage += `${sep}Balisage Petite Randonée`;
      } else if (label[this.lang] === 'GR') {
        itineraire.precisionsBalisage += `${sep}Balisage Grande Randonée`;
      } else if (label[this.lang] === 'GRP') {
        itineraire.precisionsBalisage += `${sep}Balisage Grande Randonnée de Pays`;
      } else if (label[this.lang] === 'VTT') {
        itineraire.precisionsBalisage += `${sep}Balisage VTT`;
      } else {
        itineraire.precisionsBalisage += `${sep} ${label[this.lang]}`;
      }
      sep += ' - ';
    });
  }
  return itineraire;
};

ImportGenericGeotrekApi.prototype.getPerimetreGeographique = function (
  element
) {
  var perimetreGeo = _.map(element.cities, (item) => {
    const city = configSitraTownByInsee[item];
    if (city) {
      return city.sitraId;
    }
    return null;
  });
  return DataString.cleanArray(perimetreGeo);
};

ImportGenericGeotrekApi.prototype.getDescription = function (element, lang) {
  if (element.description && element.description[lang]) {
    DataString.stripTags(DataString.strEncode(element.description[lang]));
  }
  return '';
};

ImportGenericGeotrekApi.prototype.getShortDescription = function (
  element,
  lang
) {
  if (element.description_teaser && element.description_teaser[lang]) {
    return DataString.stripTags(
      DataString.strEncode(element.description_teaser[lang])
    ).slice(0, 255);
  }
  return null;
};

ImportGenericGeotrekApi.prototype.getAddress = function (
  element,
  additionalElement,
  regionPerZipcode
) {
  const address = {
    address1: additionalElement.street,
    address2: null,
    address3: null,
    cedex: null,
    zipcode: element.departure_city,
    insee: null,
    city: null,
    region: null
  };

  let city = null;
  _.forEach(element.cities, (item) => {
    if (item) {
      address.insee = item;
      city = configSitraTownByInsee[item];
      if (city) {
        address.city = city.sitraId;
      }
    }
  });

  if (regionPerZipcode && address.zipcode) {
    address.region = regionPerZipcode[String(address.zipcode).substring(0, 2)];
  }

  if (!address.address1 && address.address2) {
    address.address1 = address.address2;
    address.address2 = null;
  }

  if (!address.address2 && address.address3) {
    address.address2 = address.address3;
    address.address3 = null;
  }
  return address;
};

ImportGenericGeotrekApi.prototype.getWebsite = function (additionalElement) {
  let website = additionalElement.website;
  if (!_.isArray(website)) {
    website = [website];
  }
  return _.compact(website);
};

ImportGenericGeotrekApi.prototype.getEmail = function (additionalElement) {
  let email = additionalElement.email;
  if (!_.isArray(email)) {
    email = [email];
  }
  return DataString.cleanEmailArray(email);
};

ImportGenericGeotrekApi.prototype.getPhone = function (additionalElement) {
  let phone = additionalElement.phone;
  if (!_.isArray(phone)) {
    phone = [phone];
  }
  return DataString.cleanPhoneArray(phone);
};

ImportGenericGeotrekApi.prototype.getGpx = function (element) {
  if (element.gpx) {
    return [this.addUrlHttp(element.gpx)];
  }
  return [];
};
ImportGenericGeotrekApi.prototype.getKml = function (element) {
  if (element.kml) {
    return [this.addUrlHttp(element.kml)];
  }

  return [];
};

ImportGenericGeotrekApi.prototype.getVideo = function (element, lang) {
  if (element.video && element.video[lang]) {
    let urlVideo = element.video[lang];
    if (urlVideo) {
      urlVideo = [urlVideo];
    }
    return _(urlVideo)
      .map((url) => ({
        url: this.addUrlHttp(url),
        type: 'VIDEO'
      }))
      .valueOf();
  }
  return [];
};

ImportGenericGeotrekApi.prototype.getPdf = function (element, lang) {
  if (element.pdf && element.pdf[lang]) {
    let urlPdf = element.pdf[lang];
    if (urlPdf) {
      urlPdf = [urlPdf];
    }
    return _(urlPdf)
      .map((url) => ({
        url: this.addUrlHttp(url),
        name: 'Pdf',
        type: 'Pdf'
      }))
      .valueOf();
  }
  return [];
};

ImportGenericGeotrekApi.prototype.getImage = function (element) {
  if (element.attachments) {
    return _(element.attachments)
      .map((item) => ({
        url: this.addUrlHttp(item['url']),
        legend: item['legend'],
        name: item['title'],
        description: item['author']
      }))
      .valueOf();
  }
  return [];
};

ImportGenericGeotrekApi.prototype.getLegalEntity = function (element, product) {
  let legalEntity = null;
  const listLegalEntity = [];

  const conf = configImportGEOTREK.entity[this.idProject][element.structure];
  if (conf) {
    legalEntity = {
      specialId: conf.specialId,
      importType: product.importType,
      importSubType: product.importSubType,
      type: 'STRUCTURE',
      name: conf.name,
      address: {
        address1: conf.address1,
        address2: conf.address2,
        city: conf.city,
        insee: conf.insee
      },
      specialIdSitra: conf.specialIdSitra,
      statusImport: conf.statusImport
    };
  }
  if (legalEntity) {
    listLegalEntity.push({
      type: 'information',
      product: legalEntity
    });
    listLegalEntity.push({
      type: 'gestion',
      product: legalEntity
    });
  }

  return listLegalEntity;
};

ImportGenericGeotrekApi.prototype.translate = function (key, ln) {
  const trad = {
    departure: {
      fr: 'Lieu de départ',
      en: 'Departure',
      es: 'Salida',
      it: 'Partenza',
      de: 'Abfahrt',
      nl: 'Vertrek'
    },
    arrival: {
      fr: "Lieu d'arrivée",
      en: 'Arrival',
      es: 'llegada',
      it: 'Arrivo',
      de: 'Ankunft',
      nl: 'Aankomst'
    },
    parking: {
      fr: 'Parking',
      en: 'Parking',
      es: 'Estacionamiento',
      it: 'Parcheggio',
      de: 'Parkplatz',
      nl: 'Parkeren'
    }
  };
  if (trad[key] && trad[key][ln]) {
    return trad[key][ln];
  } else if (trad[key] && trad[key]['en']) {
    return trad[key]['en'];
  } else {
    return key;
  }
};

module.exports = ImportGenericGeotrekApi;
