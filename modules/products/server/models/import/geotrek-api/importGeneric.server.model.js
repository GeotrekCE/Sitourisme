const util = require('util');
const path = require('path');
const axios = require('axios');
const pify = require('pify');
const _ = require('lodash');
const Report = require(path.resolve(
  './modules/reports/server/models/report.server.model'
));
const { exportSitraAuto } = require(path.resolve(
  './modules/products/server/models/exportSitra.server.model'
));
const Import = require(path.resolve('library/import/generic.js'));
const importUtils = require(__dirname + '/../../importUtils.server.model.js');
const configImportGEOTREK = require(path.resolve(
  'config/configImport_GEOTREK.js'
));
const configSitraTownByInsee = require(path.resolve(
  'config/configSitraTownByInsee.js'
));
const config = require(__dirname + '/../../../../../../config/config.js');
const DataString = require(path.resolve('library/data/manipulate.js'));

const ImportGenericGeotrekApi = function (options) {
  
  console.log('ImportGenericGeotrekApi');
  
  this.importType = options.importType
    ? options.importType.toUpperCase()
    : null;
  this.user = options.user ? options.user : null;
  this.lang = options.lang ? options.lang : 'fr';
  this.baseURL = 'https://geotrek-admin.ecrins-parcnational.fr/api/v2';
  this.instanceApi = axios.create({
    baseURL: this.baseURL,
    validateStatus(status) {
      return status < 500;
    }
  });
};

// Inherits of import
util.inherits(ImportGenericGeotrekApi, Import);

ImportGenericGeotrekApi.prototype.import = function (data, next) {
  console.log('ImportGenericGeotrekApi.prototype.import');
  try {
    importUtils.initRegion((regionPerZipcode) =>
      this.executeQuery(regionPerZipcode, 0)
    );
  } catch (err) {
    console.error(err);
  }
};

ImportGenericGeotrekApi.prototype.executeQuery = async function (
  regionPerZipcode,
  page
) {
  
  console.log('ImportGenericGeotrekApi.prototype.executeQuery');
  let geoTrekPath = '/trek?format=json';
  let urlNext = '';
  if (config.debug != undefined && config.debug.idGeo != 0) {
    geoTrekPath = '/trek/' + config.debug.idGeo + '?format=json';
  } else {
    urlNext = (page != 0) ? '&page='+page : '';
  }
  console.log('GeoPath = ', geoTrekPath);
  const { data, status } = await this.instanceApi.get(geoTrekPath + urlNext);
  if (status === 200) {
    this.doUpsertAsync = await pify(importUtils.doUpsert);
    console.log('Import page ' + page);
    
    if (config.debug != undefined && config.debug.idGeo != 0) {
      data.results = data;
    }
    
    await this.importProduct(data.results, regionPerZipcode);
   // console.log('Data= ', data);
    if (data.next && config.debug == undefined || data.next && config.debug.allpages == true ){
      page++;
      this.executeQuery(regionPerZipcode, page);
    }
    else{
      // création du fichier de rapport
      const report = new Report();
      report.createModule('products');
      report.createReport(`export_${new Date().getTime()}`, 1);
      const options = {
        report,
        exportType: 'AUTO'
      };
      console.log('exportAuto');
      exportSitraAuto('geotrek-api', options, () => {
        console.log('end of export sitra auto!');
        return;
      });
    }
  } else {
    console.error('Error executeQuery', status, data);
    return null;
  }
};

ImportGenericGeotrekApi.prototype.importProduct = async function (
  listElement,
  regionPerZipcode
) {
  console.log('ImportGenericGeotrekApi.prototype.importProduct', listElement.id);
  
  if (listElement && listElement.length > 0 || listElement.id != undefined) {
    
    console.log('ImportGenericGeotrekApi.prototype.importProduct next');
    
    let element = listElement;
    if (config.debug == undefined || config.debug.idGeo == 0) {
      element = listElement.shift();
    }
    
    //console.log('Elemeent = ', element);
    delete element.steps;
    delete element.geometry;

    switch (element.structure) {
      case 1:
        this.member = 4433;
        break;
      case 5:
        this.member = 6705;
        break;
      case 7:
        this.member = 6696;
        break;
      case 8:
      case 9:
        this.member = 6707;
        break;
      default:
        this.member = null;
        break;
    }
    
    if (config.debug != undefined) { 
      this.member = 3568; 
    }

    if (this.member){
      this.configData = {
        specialId: null,
        codeType: 'EQU',
        subType: '2988',
        member: this.member
      };

      let additionalInformation = {};
      if (element.information_desk && element.information_desks.length) {
        const { data } = await this.instanceApi.get(
          `/informationdesk/${_.last(element.information_desks)}/?format=json`
        );
        if (data) {
          additionalInformation = data;
        }
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
        activity: this.getActivity(element),
        complementAccueil: await this.getComplementAccueil(element, 'fr'),
        complementAccueilEn: await this.getComplementAccueil(element, 'en'),
        complementAccueilEs: await this.getComplementAccueil(element, 'es'),
        complementAccueilIt: await this.getComplementAccueil(element, 'it'),
        complementAccueilDe: await this.getComplementAccueil(element, 'de'),
        complementAccueilNl: await this.getComplementAccueil(element, 'nl'),
        // animauxAcceptes,
        // ambianceIdSitra: 5536,
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

      //if (product.specialId == '962561'){
        console.log(`GeoTrek API => import specialId : ${product.specialId}`);
        //console.log('element= ', element);
        //console.log('element= ', product);
      //} 
      await this.doUpsertAsync(product, product.specialId, product.importType);
    }
    else{
      console.log(`GeoTrek API => NOT import structure : ${element.structure}`);
    }
    if (config.debug == undefined || config.debug.idGeo == 0 ) {
      return this.importProduct(listElement, regionPerZipcode);
    } else {
      return;
    }
  } else {
    console.log("Fin de l'import");
    return;
  }
};


ImportGenericGeotrekApi.prototype.getActivity = function (element) {
  var activity = [];
  if (element.practice) {
    console.log('element.practice = ', element.practice);
    activity.push(configImportGEOTREK.activity[element.practice]);
  }
  return activity;
};

ImportGenericGeotrekApi.prototype.getComplementAccueil = async function (
  element,
  lang
) {
  if (element.difficulty) {
    const { data } = await this.instanceApi.get(
      `trek_difficulty/${element.difficulty}/?format=json`
    );
    return data.label[lang];
  }
  return null;
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
  if (config.debug === undefined) {
    if (element.parking_location && element.parking_location.length) {
      localization.lat = element.parking_location[1];
      localization.lon = element.parking_location[0];
    }
    else if (element.departure_geom && element.departure_geom.length) {
      localization.lat = element.departure_geom[1];
      localization.lon = element.departure_geom[0];
    }
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
    referencesCartographiques: null,
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
  // Hack adding OT WS
  if (config.debug !== undefined) {
    perimetreGeo = [];
    perimetreGeo.push(14707);
  }
  return DataString.cleanArray(perimetreGeo);
};

ImportGenericGeotrekApi.prototype.getDescription = function (element, lang) {
  if (element.description && element.description[lang]) {
    return DataString.stripTags(DataString.strEncode(element.description[lang]));
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
      if (city && config.debug === undefined) {
        address.city = city.sitraId;
      } else {
        address.city = 14707;
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
  //console.log(element.pictures);
  
  /*const image = {
    url : null,
    legend: null,
    name: null,
    description: null
  };
  _.forEach(element.pictures, (picture) => {
    console.log('picture = ', picture);
    if (picture) {
      image.url = this.addUrlHttp(picture['url']);
      image.legend = picture['legend'];
      image.name = picture['title'];
      image.description = picture['author'];
      return image;
    }
  });
  return [];*/
  
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

  const conf = configImportGEOTREK.entity[this.member]
    ? configImportGEOTREK.entity[this.member][element.structure]
    : null;
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
    },
    advised_parking: {
      fr: 'Parking conseillé',
      en: 'Parking recommended',
      es: 'Estacionamiento recomendado',
      it: 'Parcheggio consigliato',
      de: 'Parkplatz empfohlen',
      nl: 'Parkeren aanbevolen'
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
