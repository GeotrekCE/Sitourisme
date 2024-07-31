'use strict';

const path = require('path'),
  _ = require('lodash'),
  pify = require('pify'),
  DataString = require(path.resolve('./library/data/manipulate.js')),
  config = require(path.resolve('./config/config.js')),
  configImportGEOTREK = require(path.resolve('./config/configImport_GEOTREK.js')),
  //configSitraTownByInsee = require(path.resolve('./config/configSitraTownByInsee.js')),
  geotrek = require(path.resolve('./library/import/geotrek.js'));

class importModel extends geotrek
{
  constructor(instanceApi)
  {
    super();
    this.product = null;
    this.instanceApi = instanceApi;
    this.lang = 'fr';
  }
  
  async formatDatas(element, additionalInformation, structure, proprietaireId, importType, configData, user)
  {
    return this.product = {
      importType: importType,
      importSubType: null,
      typeCode: configData.codeType,
      type: configImportGEOTREK.types[configData.codeType],
      specialId: element.id,
      geotrekInstanceId: structure,
      geotrekStructureId: element.structure,
      subType: configData.subType,
      member: configData.member,
      state: 'HIDDEN',
      user: user,
      proprietaireId: proprietaireId,
      name: element.name['fr'],
      nameEn: element.name['en'],
      nameEs: element.name['es'],
      nameIt: element.name['it'],
      nameDe: element.name['de'],
      nameNl: element.name['nl'],
      activity: this.getActivity(element, structure),
      complementAccueil: await this.getComplementAccueil(element, 'fr'),
      complementAccueilEn: await this.getComplementAccueil(element, 'en'),
      complementAccueilEs: await this.getComplementAccueil(element, 'es'),
      complementAccueilIt: await this.getComplementAccueil(element, 'it'),
      complementAccueilDe: await this.getComplementAccueil(element, 'de'),
      complementAccueilNl: await this.getComplementAccueil(element, 'nl'),
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
      itinerary: await this.getItinerary(element, structure),
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
      address: this.getAddress(element, additionalInformation),
      website: this.getWebsite(element, additionalInformation),
      email: this.getEmail(additionalInformation, configImportGEOTREK.geotrekInstance[structure].structures[element.structure].defaultEmail),
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
  }
  
  getActivity(element, structure) {
    var activity = [];
    if (element.practice) {
      if (
        configImportGEOTREK.geotrekInstance[structure].structures[
          element.structure
        ].activity != undefined
        &&
        configImportGEOTREK.geotrekInstance[structure].structures[
          element.structure
        ].activity[element.practice] != undefined
      ) {
        activity.push(
          configImportGEOTREK.geotrekInstance[structure].structures[
            element.structure
          ].activity[element.practice]
        );
      } else {
        activity.push(configImportGEOTREK.activity[element.practice]);
      }
    }
    return activity;
  }

  async getComplementAccueil(element, lang) {
    if (element.difficulty) {
      const { data } = await this.instanceApi.get(
        `trek_difficulty/${element.difficulty}/?format=json`
      );
      return data.label[lang];
    }
    return null;
  }

  getAmbianceLibelle(element, lang) {
    let ambianceLibelle = null;
    if (element.ambiance && element.ambiance[lang]) {
      ambianceLibelle = DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.ambiance[lang])
        )
      );
    }
    return ambianceLibelle;
  }

  getPassagesDelicats(element, lang) {
    if (element.advice && element.advice[lang]) {
      return DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.advice[lang])
        )
      );
    }
    return null;
  }

  getComplement(element, lang) {
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
      complement = DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(complement)
        )
      );
    }
    return complement;
  }

  getLocalization(element) {
    const localization = {};
    if (process.env.NODE_ENV == 'production') {
      if (element.parking_location && element.parking_location.length) {
        localization.lat = element.parking_location[1];
        localization.lon = element.parking_location[0];
      } else if (element.departure_geom && element.departure_geom.length) {
        localization.lat = element.departure_geom[1];
        localization.lon = element.departure_geom[0];
      }
    }
    return localization;
  }
  
  async getItinerary(element, structure) {
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
      if (configImportGEOTREK.geotrekInstance[structure].structures[element.structure].itineraireType != undefined)
      {
        itineraire.itineraireType = configImportGEOTREK.geotrekInstance[structure].structures[element.structure].itineraireType[element.route];
      } else {
        itineraire.itineraireType = configImportGEOTREK.itineraireType[element.route];
      }
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
        element.networks.map((id) =>
          this.instanceApi.get(`/trek_network/${id}`)
        )
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
  }

  getDescription(element, lang) {
    if (element.description && element.description[lang]) {
      return DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.description[lang])
        )
      );
    }
    return '';
  }

  getEmail(additionalElement, defaultEmail) {
    let email = additionalElement.email;
    if (!_.isArray(email)) {
      email = [email];
    }
    if (defaultEmail !== null) {
      email = [defaultEmail];
    }
    return DataString.cleanEmailArray(email);
  }

  getPhone(additionalElement) {
    let phone = additionalElement.phone;
    if (!_.isArray(phone)) {
      phone = [phone];
    }
    return DataString.cleanPhoneArray(phone);
  }

  getGpx(element) {
    if (element.gpx) {
      return [this.addUrlHttp(element.gpx)];
    }
    return [];
  }

  getKml(element) {
    if (element.kml) {
      return [this.addUrlHttp(element.kml)];
    }

    return [];
  }

  getVideo(element, lang) {
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
  }
  
}

module.exports = importModel;