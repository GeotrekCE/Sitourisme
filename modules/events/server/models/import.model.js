'use strict';

const path = require('path'),
  _ = require('lodash'),
  pify = require('pify'),
  moment = require('moment'),
  striptags = require('striptags'),
  he = require('he'),
  DataString = require(path.resolve('./library/data/manipulate.js')),
  config = require(path.resolve('./config/config.js')),
  configImportGEOTREK = require(path.resolve('./config/configImport_GEOTREK.js')),
  { placeApidae } = require(path.resolve('./config/configPlaceApidae.js')),
  configSitraTownByInsee = require(path.resolve('./config/configSitraTownByInsee.js')),
  geotrek = require(path.resolve('./library/import/geotrek.js'));

class importModel extends geotrek
{
  constructor(instanceApi)
  {
    super();
    this.event = null;
    this.instanceApi = instanceApi;
  }

  async formatDatas(element, additionalInformation, structure, proprietaireId, importType, configData, user)
  {
    return this.event = {
      importType: importType,
      importSubType: null,
      typeCode: configData.codeType,
      type: configImportGEOTREK.types[configData.codeType],
      specialId: element.id,
      district: this.getDistrict(element, structure),
      subType: configData.subType,
      category: this.getCategory(element, structure),
      member: configData.member,
      state: 'HIDDEN',
      user: user,
      scope: 2352, //TODO ???
      proprietaireId: proprietaireId,
      name: element.name['fr'],
      nameEn: element.name['en'],
      nameEs: element.name['es'],
      nameIt: element.name['it'],
      nameDe: element.name['de'],
      nameNl: element.name['nl'],
      localization: this.getLocalization(element),
      price: this.getPrice(element),
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
      address: this.getAddress(element),
      website: this.getWebsite(element),
      email: element.email,
      phone: this.getPhone(element, structure),
      pdf: this.getPdf(element, 'fr'),
      pdfEn: this.getPdf(element, 'en'),
      pdfEs: this.getPdf(element, 'es'),
      pdfIt: this.getPdf(element, 'it'),
      pdfDe: this.getPdf(element, 'de'),
      pdfNl: this.getPdf(element, 'nl'),
      image: this.getImage(element),
      url: configImportGEOTREK.geotrekInstance[structure].structures[element.structure].www_events + element.id,
      openingDate: this.getOuverture(element),
      reservation: this.getBooking(element),
      capacity: this.getCapacity(element),
      complementAccueil: this.getComplementAccueil(element),
      idLieu: this.getLieu(element)
    };
  }

  getDistrict(element, structure) {
    let entity = null,
      entityTmp = null

    if (element.districts && element.districts.length && configImportGEOTREK.geotrekInstance[structure].touristicevent_districtToEntities) {
      element.districts.forEach((districtId) => {
        entityTmp = configImportGEOTREK.geotrekInstance[structure].touristicevent_districtToEntities[districtId]
        if (entityTmp !== undefined) entity = entityTmp
      })
    }
    if (entity === null) entity = configImportGEOTREK.geotrekInstance[structure].touristicevent_defaultEntity
    return entity
  }

  getPhone(element, structure) {
    let phone = null,
      phoneTmp = null

    if (element.districts && element.districts.length && configImportGEOTREK.geotrekInstance[structure].touristicevent_districtToEntitiesPhone) {
      element.districts.forEach((districtId) => {
        phoneTmp = configImportGEOTREK.geotrekInstance[structure].touristicevent_districtToEntitiesPhone[districtId]
        if (phoneTmp !== undefined) phone = phoneTmp
      })
    }
    if (phone === null) phone = configImportGEOTREK.geotrekInstance[structure].touristicevent_defaultPhone
    return DataString.cleanPhoneArray(phone)
  }

  getCategory(element, structure) {
    if (configImportGEOTREK.geotrekInstance[structure].touristicevent_cat) {
      return configImportGEOTREK.geotrekInstance[structure].touristicevent_cat[element.type];
    } else {
      return configImportGEOTREK.touristicevent_cat[element.type];
    }
  }

  getLocalization(element) {
    const localization = {};
    if (element.geometry && element.geometry.coordinates && element.geometry.coordinates.length) {
      localization.lat = element.geometry.coordinates[1];
      localization.lon = element.geometry.coordinates[0];
    }
    return localization;
  }

  getDescription(element, lang) {
    let description = '';
    if (element.description && element.description[lang]) {
      description = DataString.stripTags(
        DataString.strEncode(element.description[lang] + "\r\n\r\n")
      );
    }

    if (element.speaker) {
      description = DataString.stripTags(
        DataString.strEncode(description + "Intervenant : " + element.speaker + "\r\n\r\n")
      );
    }

    if (element.target_audience) {
      description = DataString.stripTags(
        DataString.strEncode(description + "Public : " + element.target_audience + "\r\n\r\n")
      );
    }

    return description;
  }

  getLieu(element) {
    if (element.place) {
      let placeId = placeApidae(element.place);
      if (placeId) {
        //if (process.env.NODE_ENV !== 'production') placeId = 11219; //#120 - EQU définissant un lieu (source)
        return placeId;
      }
    }
    return null;
  }

  getAddress(element) {
    if (this.getLieu(element) === null) {
      if (element) {
        const city_codes =  element?.city_codes || element.cities;
        if (
          Array.isArray(city_codes) &&
          city_codes[0] &&
          configSitraTownByInsee[city_codes[0]]
        ) {
          const cityCode = city_codes[0]
          const cityConfig = configSitraTownByInsee[cityCode]

          return {
            address1: null,
            address2: null,
            address3: null,
            cedex: null,
            zipcode: cityConfig.zipcode || cityCode,
            insee: cityCode,
            city: cityConfig.sitraId,
            region: null
          }
        }
      }
    }
    return null
  }

  getOuverture(element) {
    let duration = null,
      dureeSeance = null;

    if (element.begin_date && element.end_date) {
      let horaireOuverture = null,
        horaireFermeture = null;

      if (element.start_time) {
        if (element.end_time) {
          horaireOuverture = element.start_time;
          horaireFermeture = element.end_time;
        } else if (element.duration != '') {
          let horaireOuvertureTmp = moment(element.begin_date + ' ' + element.start_time, 'YYYY-MM-DD HH:mm:ss');
          let horaireFermetureTmp = moment(element.begin_date + ' ' + element.duration, 'YYYY-MM-DD HH:mm:ss');

          let horaireFermetureTmp2 = moment();
          horaireFermetureTmp2.hours(horaireOuvertureTmp.hours() + horaireFermetureTmp.hours());
          horaireFermetureTmp2.minutes(horaireOuvertureTmp.minutes() + horaireFermetureTmp.minutes());
          horaireFermetureTmp2.seconds(horaireOuvertureTmp.seconds() + horaireFermetureTmp.seconds());

          horaireOuverture = new Date(element.begin_date + ' ' + element.start_time);
          horaireFermeture = new Date(
            element.end_date +
            ' ' +
            horaireFermetureTmp2.hours() +
            ':' +
            horaireFermetureTmp2.minutes() +
            ':' +
            ((horaireFermetureTmp2.seconds() < 10) ? "0" + horaireFermetureTmp2.seconds() : horaireFermetureTmp2.seconds())
          );
        }
      }

      if (element.duration) {
        const [durationHour, durationMinute] = element.duration.split(':').map(Number);
        dureeSeance = (durationHour * 60 + durationMinute);
      } else if (element.begin_date == element.end_date && element.start_time && element.end_time) {
        const [startHour, startMinute] = element.start_time.split(':').map(Number);
        const [endHour, endMinute] = element.end_time.split(':').map(Number);

        dureeSeance = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      }

      return {
        periodesOuvertures : [{
          dateStart: element.begin_date,
          dateEnd: element.end_date,
          type: "OUVERTURE_TOUS_LES_JOURS",
          horaireOuverture: horaireOuverture,
          horaireFermeture: horaireFermeture,
        }],
        expiration: [{
          expirationDate: moment(element.end_date),
          expirationAction: "MASQUER_AUTOMATIQUEMENT",
        }],
        dureeSeance: dureeSeance
      }
    }
  }

  getBooking(element) {
    if (element.booking) {
      return {
        complementFr: he.decode(striptags(element.booking)),
      }
    }
  }

  getCapacity(element) {
    if (element.capacity) {
      return {
        value: element.capacity
      }
    }
  }

  getComplementAccueil(element) {
    let accueil = '';
    if (element.meeting_point) {
      accueil = DataString.stripTags(
        DataString.strEncode("Point de rendez-vous : " + element.meeting_point + "\r\n\r\n")
      );
    }
    if (element.organizer) {
      accueil = DataString.stripTags(
        DataString.strEncode(accueil + "Organisateur : " + element.organizer + "\r\n\r\n")
      );
    }
    if (element.place) {
      if (placeApidae(element.place) === null) {
        accueil = DataString.stripTags(
          DataString.strEncode(accueil + "Lieu : " + element.place + "\r\n\r\n")
        );
      }
    }

    if (element.practical_info['fr']) {
      accueil = DataString.stripTags(
        DataString.strEncode(accueil + "Informations pratiques : " + element.practical_info['fr'].replaceAll("<br>", "\r\n") + "\r\n\r\n")
      );
    }

    return accueil;
  }
}

module.exports = importModel;
