'use strict'

const _ = require('lodash'),
  path = require('path'),
  DataString = require(path.resolve('./library/data/manipulate.js')),
  configSitraTownByInsee = require(path.resolve('./config/configSitraTownByInsee.js'))

class Import
{
  translate(key, ln) {
    const trad =
    {
      departure:
      {
        fr: 'Lieu de départ',
        en: 'Departure',
        es: 'Salida',
        it: 'Partenza',
        de: 'Abfahrt',
        nl: 'Vertrek'
      },
      arrival:
      {
        fr: "Lieu d'arrivée",
        en: 'Arrival',
        es: 'llegada',
        it: 'Arrivo',
        de: 'Ankunft',
        nl: 'Aankomst'
      },
      parking:
      {
        fr: 'Parking',
        en: 'Parking',
        es: 'Estacionamiento',
        it: 'Parcheggio',
        de: 'Parkplatz',
        nl: 'Parkeren'
      },
      advised_parking:
      {
        fr: 'Parking conseillé',
        en: 'Parking recommended',
        es: 'Estacionamiento recomendado',
        it: 'Parcheggio consigliato',
        de: 'Parkplatz empfohlen',
        nl: 'Parkeren aanbevolen'
      },
      access:
      {
        fr: 'Accès routier', 
        en: 'Road access',
        es: 'Acceso por carretera',
        it: 'Accesso stradale',
        de: 'Straßenzugang',
        nl: 'Toegang via de weg'
      },
      public_transport:
      {
        fr: 'Transports en commun', 
        en: 'Public transport',
        es: 'Transporte público',
        it: 'Trasporto pubblico',
        de: 'Öffentliche Verkehrsmittel',
        nl: 'Openbaar vervoer'
      }
    }

    if (trad[key] && trad[key][ln]) {
      return trad[key][ln]
    } else if (trad[key] && trad[key]['en']) {
      return trad[key]['en']
    } else {
      return key
    }
  }

  getPrice(element) {
    return element.price > 0
    ? { gratuit: false, description: element.price.toString().replace('.', ',') + ' €' }
    : { gratuit: true };
  }

  getPerimetreGeographique(element) {
    // let perimetreGeo = _.map(element?.city_codes || element.cities, (item) => {
    //   const city = configSitraTownByInsee[item];
    //   if (city) {
    //     return city.sitraId;
    //   }
    //   return null;
    // });
    // if (process.env.NODE_ENV == 'development') {
    //   perimetreGeo = [];
    //   perimetreGeo.push(14707);
    // }
    // return DataString.cleanArray(perimetreGeo);
    // Périmètre géographique temporairement supprimé de l'import/export :
    // erreurs d'écriture côté Apidae.
    return [];
  }

  getShortDescription(element, lang) {
    if (element.description_teaser && element.description_teaser[lang]) {
      return DataString.stripTags(
        DataString.strEncode(
          DataString.br2nl(element.description_teaser[lang])
        )
      ).slice(0, 255);
    }
    return null;
  }

  getAddress(element, additionalElement) {
    const insee_field = element?.departure_city_code || element.departure_city;
    if (element
      && insee_field
      && configSitraTownByInsee[insee_field] === undefined)
    {
      //TODO : Add to reports
      console.error("Zipcode missing for this Insee code city : " + insee_field);
    }
    const address = {
      address1: (additionalElement) ? additionalElement.street : null,
      address2: null,
      address3: null,
      cedex: null,
      zipcode: (element && insee_field && configSitraTownByInsee[insee_field] !== undefined) ? configSitraTownByInsee[insee_field].zipcode : insee_field,
      insee: insee_field,
      city: (configSitraTownByInsee[insee_field] && process.env.NODE_ENV == 'production') ? configSitraTownByInsee[insee_field].sitraId : 14707,
      region: null
    };

    if (!address.address1 && address.address2) {
      address.address1 = address.address2;
      address.address2 = null;
    }

    if (!address.address2 && address.address3) {
      address.address2 = address.address3;
      address.address3 = null;
    }
    return address;
  }

  getWebsite(element, additionalElement) {
    if (additionalElement) {
      let website = additionalElement.website;
      if (!_.isArray(website)) {
        website = [website];
      }
      return _.compact(website);
    } else if (element.website) {
      return element.website;
    } else {
      return null;
    }
  }

  getPdf(element, lang) {
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
  }

  getImage(element) {
    if (element.attachments) {
       let images = (element.attachments)
        .filter((item) => {
          if (item['type'] == 'image')
          {
            return {
              url: this.addUrlHttp(item['url']),
              legend: item['legend'],
              title: item['title'],
              author: item['author']
            };
          }
        });
        images = _(images).valueOf();
      return images;
    }
    return [];
  }

  start(callback) {
    this.__initParser(function (err) {
      if (err)
        throw err;

      if (callback)
        callback();
    });
  }

  reset(next) {
    next(null);
  }

  current(next) {
    next(null, []);
  }

  import(data, next) {
    next();
  }

  __initParser(callback) {
    const self = this;

    this.reset(function (err) {
      if (err)
        throw err;

      self.__next(callback);
    });
  }

  __next(callback) {
    const self = this;
    console.log('7. import geotrek > __next > __import');
    this.current(function (err, data) {
      if (err)
        throw err;

      if (data) {
        self.__import(data, callback);
      } else {
        if (callback) {
          callback(err);
        }
      }
    });
  }

  __import(data, callback) {
    const self = this;
    console.log('8. import geotrek > __next > import');

    this.import(data, function (err) {
      if (err)
        throw err;

      self.__next(callback);
    });
  }

  calculateRateCompletion(product) {
    let score = 0;

    if (product.type)
      score++;

    if (product.subType)
      score++;

    if (product.name)
      score++;

    if (product.territory && product.territory.length)
      score++;

    if (product.website && product.website.length)
      score++;

    if (product.email && product.email.length)
      score++;

    if (product.phone && product.phone.length)
      score++;

    if (product.shortDescription)
      score++;

    if (product.description)
      score++;

    if (product.complement)
      score++;

    if (product.ambiance)
      score++;

    if (product.passagesDelicats)
      score++;

    if (product.address) {
      if (product.address.address1)
        score++;

      if (product.address.zipcode)
        score++;
    }

    if (product.localization &&
      product.localization.lat !== null &&
      product.localization.lon !== null
    )
      score++;

    if (product.itinerary) {
      score++;
      if (product.itinerary.dailyDuration !== null)
        score++;

      if (product.itinerary.distance !== null)
        score++;

      if (product.itinerary.positive !== null)
        score++;

      if (product.itinerary.negative !== null)
        score++;

      if (product.itinerary.itineraireType !== null)
        score++;

      if (product.itinerary.itineraireBalise !== null)
        score++;
    }

    if (product.image && product.image.length) {
      score++;
      if (product.image[0].description)
        score++;
    }

    if (product.equipment && product.equipment.length)
      score++;

    if (product.openingDate && product.openingDate.description)
      score++;

    if (product.price && product.price.description)
      score++;

    if (product.website && product.website.length)
      score++;

    if (product.email && product.email.length)
      score++;

    if (product.phone && product.phone.length)
      score++;

    if (product.typeDetail && product.typeDetail.length)
      score++;

    if (product.legalEntity && product.legalEntity.length > 0)
      score++;

    return _.floor((score * 100) / 22);
  }

  addUrlHttp(url) {
    if (url && _.isString(url) && !url.match('^https?://|^//'))
      url = this.url + url;

    return url;
  }
}

module.exports = Import;
