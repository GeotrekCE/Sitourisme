'use strict';

var path = require('path'),
  util = require('util'),
  fs = require('fs'),
  _ = require('lodash'),
  moment = require('moment');

var Import = require(path.resolve('library/import/generic.js')),
  importUtils = require(path.resolve(
    'modules/products/server/models/importUtils.server.model.js'
  )),
  configSitraTownByInsee = require(path.resolve(
    'config/configSitraTownByInsee.js'
  )),
  DataString = require(path.resolve('library/data/manipulate.js')),
  // Mapping for GEOTREK
  configImportGEOTREK = require(path.resolve('config/configImport_GEOTREK.js'));

/**
 * function ImportGenericGEOTREK
 * @param urlFile
 * @param options
 * @constructor
 */
var ImportGenericGEOTREK = function (urlFile, options) {
  this.urlFile = urlFile;
  this.filename = path.basename(urlFile);
  this.importType = options.importType
    ? options.importType.toUpperCase()
    : null;
  this.user = options.user ? options.user : null;
  this.lang = options.lang ? options.lang : 'fr';

  // Product data
  this.configData = {};

  // Debug
  this.debugMissingMapping = [];

  // URL en fonction du nom de fichier
  if (this.filename.match('Ecrins')) {
    this.idProject = 1;
    this.idUrl = 1;
  } else if (this.filename.match('cheminDesParcs')) {
    this.idProject = 2;
    this.idUrl = 2;
  } else if (this.filename.match('Sisteron')) {
    this.idProject = 1;
    this.idUrl = 3;
  } else if (this.filename.match('PortCros')) {
    this.idProject = 3;
    this.idUrl = 4;
  } else if (this.filename.match('randoAlpesHauteProvence')) {
    this.idProject = 5;
    this.idUrl = 6;
  } else if (this.filename.match('randoAlpes')) {
    this.idProject = 4;
    this.idUrl = 5;
  } else if (this.filename.match('Mercantour')) {
    this.idProject = 6;
    this.idUrl = 7;
  }
  this.dateTrek = configImportGEOTREK.urlDateTrek[this.idProject]
    ? configImportGEOTREK.urlDateTrek[this.idProject]
    : null;
  this.url = configImportGEOTREK.url[this.idUrl];

  this.arrDataDateTrek = []; //liste de tous les id de produit modifiés qu'il faut importer
};

// Inherits of import
util.inherits(ImportGenericGEOTREK, Import);

/**
 * Reset
 *
 * @param {function} next
 */
ImportGenericGEOTREK.prototype.reset = function (next) {
  // appel à l'API v2 pour récupérer le fichier des produits pour tester la date d'update
  this.arrDataDateTrek = [];

  if (this.dateTrek) {
    // on va rechercher la date du dernier import
    var filename =
      __dirname + '/../../../../../../../var/data/import/geotrek/dateScript';
    var dateScript = fs.readFileSync(filename, 'utf8');

    filename =
      __dirname +
      '/../../../../../../../var/data/import/geotrek/' +
      this.dateTrek;

    var dataDateTrek = fs.readFileSync(filename, 'utf8');
    let jsonDateTrek = null;
    try {
      jsonDateTrek = JSON.parse(dataDateTrek);
    } catch (error) {
      jsonDateTrek = moment().format('YYYY-MM-DD');
    }

    _.forOwn(jsonDateTrek.results, (item, key) => {
      const dateUpdate = moment(item.update_datetime).format('YYYY-MM-DD');
      const dateCreate = moment(item.create_datetime).format('YYYY-MM-DD');
      var specialId = this.getSpecialId(item);
      if (dateUpdate >= dateScript || dateCreate >= dateScript) {
        this.arrDataDateTrek.push(item.id); //liste des id mis à jour
      } else {
        // on modifie juste la date de visu (pour ne pas le supprimer)
        this.updateVisuProduct(specialId);
      }
    });
  }

  fs.readFile(this.urlFile, 'utf8', (err, data) => {
    this.__parseFile(err, data, next);
  });
};

/**
 * Parse file
 *
 * @param {err} err
 * @param {string} data
 * @param {function} next
 * @private
 */
ImportGenericGEOTREK.prototype.__parseFile = function (err, data, next) {
  if (err) {
    console.error('Error: ' + err);
    return;
  }

  this.index = 0;
  this.arrData = [];

  const json = JSON.parse(data);
  _.forOwn(json['features'], (item, key) => {
    var productId = item.id;
    this.arrData.push(item);
    /*if (this.dateTrek) {
			if (this.arrDataDateTrek.indexOf(productId) != -1) {
				this.arrData.push(item);
			}
		} else {
			this.arrData.push(item);
		} */
  });
  console.log(this.arrData.length + ' produits à importer');
  if (next) {
    next();
  }
};

/**
 * Current
 *
 * @param {function} next
 */
ImportGenericGEOTREK.prototype.current = function (next) {
  var data = null;

  if (this.arrData && this.arrData[this.index]) {
    data = this.arrData[this.index++];
  } else {
    this.arrData = [];
    if (process.env.NODE_ENV === 'development') {
      console.log(this.debugMissingMapping);
    }
  }

  next(null, data);
};

/**
 * update visu product
 *
 * @param {string} specialId
 */
ImportGenericGEOTREK.prototype.updateVisuProduct = function (specialId) {
  var mongoose = require('mongoose'),
    Product = mongoose.model('Product');

  console.log(
    'Objet présent mais non modifié (updateVisuProduct): ' + specialId
  );

  Product.update(
    {
      importType: this.importType,
      specialId: specialId
    },
    { $set: { lastVisu: new Date() } }
  ).exec(function (err) {
    if (err) {
      console.log('Error in updateVisuProduct : ' + err);
    }
  });
};

/**
 * Import
 *
 * @param {Object} data
 * @param {function} next
 */
ImportGenericGEOTREK.prototype.import = function (data, next) {
  if (data) {
    try {
      importUtils.initRegion((regionPerZipcode) =>
        this.importProduct(data, next, regionPerZipcode)
      );
    } catch (err) {
      console.error(err);
      next();
    }
  } else {
    if (next) {
      next(null);
    }
  }
};

/**
 * Import product
 *
 * @param {Object} dataProduct
 * @param {function} next
 * @param {Object} regionPerZipcode
 */
ImportGenericGEOTREK.prototype.importProduct = function (
  dataProduct,
  next,
  regionPerZipcode
) {
  this.configData = {
    specialId: null,
    codeType: 'EQU',
    subType: '2988',
    member: this.getMember(dataProduct)
  };

  //on ne prend que les published = true
  var published = this.getPublished(dataProduct);
  if (published === true) {
    // common fields
    var product = {
      importType: this.getImportType(),
      importSubType: null,
      typeCode: this.configData.codeType,
      type: this.getType(this.configData.codeType),
      specialId: this.getSpecialId(dataProduct) + '-' + this.configData.member,
      subType: this.configData.subType,
      member: this.configData.member,
      state: 'HIDDEN',
      user: this.user
    };

    if (this.lang == 'fr') {
      product.name = this.getName(dataProduct);
      product.activity = this.getActivity(dataProduct);
      product.complementAccueil = this.getComplementAccueil(dataProduct);
      product.animauxAcceptes = this.getAnimauxAcceptes(dataProduct);
      if (process.env.NODE_ENV !== 'production') {
        product.ambianceIdSitra = this.getAmbianceIdSitra(dataProduct);
        product.ambianceLibelle = this.getAmbianceLibelle(dataProduct);
      }
      product.passagesDelicats = this.getPassagesDelicats(dataProduct);
      product.complement = this.getComplement(dataProduct, 'fr');
      product.localization = this.getLocalization(dataProduct);
      product.price = this.getPrice(dataProduct);
      product.itinerary = this.getItinerary(dataProduct);
      product.perimetreGeographique =
        this.getPerimetreGeographique(dataProduct);
      product.description = this.getDescription(dataProduct);
      product.shortDescription = this.getShortDescription(dataProduct);
      product.address = this.getAddress(dataProduct, regionPerZipcode);
      product.website = this.getWebsite(dataProduct);
      product.email = this.getEmail(dataProduct);
      product.phone = this.getPhone(dataProduct);
      product.gpx = this.getGpx(dataProduct);
      product.kml = this.getKml(dataProduct);
      product.video = this.getVideo(dataProduct);
      product.pdf = this.getPdf(dataProduct);
      product.image = this.getImage(dataProduct);
    } else {
      var cle =
        this.lang.charAt(0).toUpperCase() +
        this.lang.substring(1).toLowerCase();

      product['name' + cle] = this.getName(dataProduct);
      product['description' + cle] = this.getDescription(dataProduct);
      product['shortDescription' + cle] = this.getShortDescription(dataProduct);
      product['complementAccueil' + cle] =
        this.getComplementAccueil(dataProduct);
      product['website' + cle] = this.getWebsite(dataProduct);
      if (process.env.NODE_ENV !== 'production') {
        product['ambianceLibelle' + cle] = this.getAmbianceLibelle(dataProduct);
      }
      product['passagesDelicats' + cle] = this.getPassagesDelicats(dataProduct);
      product['complement' + cle] = this.getComplement(dataProduct, this.lang);
      product['gpx' + cle] = this.getGpx(dataProduct);
      product['kml' + cle] = this.getKml(dataProduct);
      product['video' + cle] = this.getVideo(dataProduct);
      product['pdf' + cle] = this.getPdf(dataProduct);
    }

    // Upsert product
    if (this.lang == 'fr' && (!product.specialId || !product.name)) {
      console.error(product.specialId);
      this.debugMissingMapping.push(product.specialId);
    }

    // define value and remove doublon
    //this.cleanProduct(product);
    if (this.lang == 'fr') {
      product.legalEntity = this.getLegalEntity(product, dataProduct);
      product.rateCompletion = this.calculateRateCompletion(product);
    }
    console.log(`GeoTrek => import specialId : ${product.specialId}`);
    importUtils.doUpsert(product, product.specialId, product.importType, next);
  } else {
    next();
  }
};

ImportGenericGEOTREK.prototype.getMember = function (dataProduct) {
  let member = 3437; // geotrek pnr verdon - preprod by default
  if (process.env.NODE_ENV === 'production') {
    if (this.filename.match('cheminDesParcs')) {
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
    } else if (this.filename.match('Sisteron')) {
      member = 4832;
    } else if (this.filename.match('PortCros')) {
      member = 5193;
    } else if (this.filename.match('AlpesHauteProvence')) {
      member = 5992;
    } else if (this.filename.match('Alpes')) {
      member = 5545;
    } else if (this.filename.match('Mercantour')) {
      member = 6026;
    }
  }
  return member;
};

/**
 * Get import type
 *
 * @returns {String}
 */
ImportGenericGEOTREK.prototype.getImportType = function () {
  return this.importType;
};

/**
 * Get import sub type
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getImportSubType = function () {
  return null;
};

/**
 * Get special id
 * @param dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getPublished = function (dataProduct) {
  var published = dataProduct['properties']['published'];
  return published;
};

/**
 * Get special id
 * @param dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getSpecialId = function (dataProduct) {
  this.configData.specialId = dataProduct['id'];
  return dataProduct['id'] || null;
};

/**
 * Get type
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getType = function (type) {
  type = configImportGEOTREK.types[type];

  return type;
};

/**
 * Get activity
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getActivity = function (dataProduct) {
  var root = dataProduct['properties'];
  var child = null;
  var activity = [];

  if (root) {
    child = root['usages'];
    _.forEach(child, (item) => {
      if (item && item['id']) {
        activity = configImportGEOTREK.activity[item['id']];
      }
    });
  }
  return activity;
};

/**
 * Get ComplementAccueil
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getComplementAccueil = function (dataProduct) {
  var root = dataProduct['properties']['difficulty'];
  var complementAccueil = null;
  if (root) {
    complementAccueil = 'Difficulté = ' + root.label;
  }
  return complementAccueil;
};

/**
 * Get animauxAcceptes
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getAnimauxAcceptes = function (dataProduct) {
  var root = dataProduct['properties'];

  var animauxAcceptes = null;
  if (root['is_park_centered'] && root['is_park_centered'] === true) {
    animauxAcceptes = 'NON_ACCEPTES';
  }

  return animauxAcceptes;
};
/**
 * Get name
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getName = function (dataProduct) {
  var name = dataProduct['properties']['name'];

  return name;
};

/**
 * Get getAmbianceIdSitra
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getAmbianceIdSitra = function (dataProduct) {
  return 5536;
};

/**
 * Get getAmbianceLibelle
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getAmbianceLibelle = function (dataProduct) {
  var ambianceLibelle = null;

  if (dataProduct['properties']['ambiance']) {
    ambianceLibelle = DataString.stripTags(
      DataString.strEncode(dataProduct['properties']['ambiance'])
    );
  }

  return ambianceLibelle;
};

/**
 * Get description
 *
 * @param {Object} dataProduct
 */
ImportGenericGEOTREK.prototype.getDescription = function (dataProduct) {
  var root = dataProduct['properties'];
  var description = '';
  if (root['description']) {
    description = root['description'];
  }

  return DataString.stripTags(DataString.strEncode(description));
};

/**
 * Get short description
 *
 * @param {Object} dataProduct
 */
ImportGenericGEOTREK.prototype.getShortDescription = function (dataProduct) {
  var root = dataProduct['properties'];

  if (root['description_teaser']) {
    var shortDescription = root['description_teaser'];
    shortDescription = DataString.stripTags(
      DataString.strEncode(shortDescription)
    );
    return shortDescription.slice(0, 254);
  }
  return null;
};

/**
 * Get GPX
 *
 * @param {Object} dataProduct
 */
ImportGenericGEOTREK.prototype.getGpx = function (dataProduct) {
  var root = dataProduct['properties'];
  var gpx = [];

  if (root['gpx']) {
    gpx.push(this.addUrlHttp(root['gpx']));
  }

  return gpx;
};

/**
 * Get KML
 *
 * @param {Object} dataProduct
 */
ImportGenericGEOTREK.prototype.getKml = function (dataProduct) {
  var root = dataProduct['properties'];
  var kml = [];

  if (root['kml']) {
    kml.push(this.addUrlHttp(root['kml']));
  }

  return kml;
};

/**
 * Get itineraire
 *
 * @param {Object} dataProduct
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getItinerary = function (dataProduct) {
  var root = dataProduct['properties'];
  var itineraire = {
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
  if (root) {
    if (root['max_elevation']) {
      itineraire.altitudeMaximum = root['max_elevation'];
    }
    if (root['duration']) {
      itineraire.dailyDuration = DataString.convertDuration(root['duration']);
    }
    if (root['length']) {
      itineraire.distance = DataString.convertDistance(root['length']);
    }
    if (root['ascent']) {
      itineraire.positive = root['ascent'];
    }
    if (root['descent']) {
      itineraire.negative = DataString.convertNegative(root['descent']);
    }
    if (root['route'] && root['route']['id']) {
      itineraire.itineraireType =
        configImportGEOTREK.itineraireType[root['route']['id']];
    }
    if (root['slug']) {
      var slugCategory = this.getSlugCategory(dataProduct);
      if (slugCategory) {
        itineraire.referencesTopoguides = this.addUrlHttp(
          '/' + slugCategory + '/' + root['slug'] + '/'
        );
      }
    }
    if (root['networks'] && root['networks'].length) {
      itineraire.itineraireBalise = 'BALISE';
      var sep = '';
      _.forEach(root['networks'], (item) => {
        if (item.name === 'PR') {
          itineraire.precisionsBalisage += sep + 'Balisage Petite Randonée';
        } else if (item.name === 'GR') {
          itineraire.precisionsBalisage = sep + 'Balisage Grande Randonée';
        } else if (item.name === 'GRP') {
          itineraire.precisionsBalisage =
            sep + 'Balisage Grande Randonnée de Pays';
        } else if (item.name === 'VTT') {
          itineraire.precisionsBalisage = sep + 'Balisage VTT';
        } else {
          itineraire.precisionsBalisage = sep + item.name;
        }
        sep = ' - ';
      });
    }
  }
  return itineraire;
};

/**
 * Get slugCategory
 *
 * @param {Object} dataProduct
 * @returns {String|null}
 */
ImportGenericGEOTREK.prototype.getSlugCategory = function (dataProduct) {
  var root = dataProduct['properties']['category'];
  var slugCategorie = null;

  if (root['slug']) {
    slugCategorie = root['slug'];
  }
  return slugCategorie;
};

/**
 * Get itineraire
 *
 * @param {Object} dataProduct
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getPassagesDelicats = function (dataProduct) {
  var root = dataProduct['properties'];
  var passagesDelicats = null;
  if (root['advice']) {
    passagesDelicats = DataString.stripTags(
      DataString.strEncode(root['advice'])
    );
  }
  return passagesDelicats;
};

/**
 * Get complement
 *
 * @param {Object} dataProduct
 * @param {String} langage
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getComplement = function (dataProduct, langage) {
  var root = dataProduct['properties'];
  var complement = '';

  if (root) {
    if (root['departure']) {
      complement +=
        '\n' +
        this.translate('departure', langage) +
        ' : ' +
        root['departure'] +
        '.';
    }
    if (root['arrival']) {
      complement +=
        '\n' +
        this.translate('arrival', langage) +
        ' : ' +
        root['arrival'] +
        '.';
    }
    if (root['access']) {
      complement += '\n' + root['access'];
    }
    if (root['advised_parking']) {
      complement +=
        '\n' +
        this.translate('parking', langage) +
        ' : ' +
        root['advised_parking'] +
        '.';
    }
    if (root['public_transport']) {
      complement += '\n' + root['public_transport'];
    }
    if (complement) {
      complement = DataString.stripTags(DataString.strEncode(complement));
    }
  }
  return complement;
};

/**
 * Get localization
 *
 * @param {Object} dataProduct
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getLocalization = function (dataProduct) {
  var root = dataProduct['properties'];
  var localization = {};

  if (root['parking_location'] && root['parking_location'].length) {
    localization.lat = root['parking_location'][1];
    localization.lon = root['parking_location'][0];
  }

  return localization;
};

/**
 * Get price
 *
 * @param {Object} dataProduct
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getPrice = function (dataProduct) {
  var price = {};
  price.gratuit = true;

  return price;
};
/**
 * Get address
 *
 * @param {Object} dataProduct
 * @param {Object} regionPerZipcode
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getAddress = function (
  dataProduct,
  regionPerZipcode
) {
  var root = dataProduct['properties'];
  var child = null;
  var city = null;

  var address = {
    address1: null,
    address2: null,
    address3: null,
    cedex: null,
    zipcode: null,
    insee: null,
    city: null,
    region: null
  };

  if (root) {
    child = root['information_desks'];
    if (!_.isArray(child)) {
      child = [child];
    }
    _.forEach(
      child,
      function (item) {
        if (item && item['street']) {
          address.address1 = item['street'];
        }
      },
      this
    );
  }

  if (root) {
    child = root['cities'];
    _.forEach(
      child,
      function (item) {
        if (item && item['code']) {
          address.insee = item['code'];
          city = configSitraTownByInsee[item['code']];
          if (city) {
            address.city = city.sitraId;
            if (!address.zipcode) {
              address.zipcode = city.zipcode;
            }
          }
        }
      },
      this
    );
  }

  if (address.zipcode) {
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

/**
 * Get PerimetreGeographique
 *
 * @param {Object} dataProduct
 * @returns {Object|null}
 */
ImportGenericGEOTREK.prototype.getPerimetreGeographique = function (
  dataProduct
) {
  var root = dataProduct['properties'];
  var child = null;
  var perimetreGeo = [];

  if (root) {
    child = root['cities'];
    _.forEach(
      child,
      function (item) {
        if (item && item['code']) {
          var city = configSitraTownByInsee[item['code']];
          if (city) {
            perimetreGeo.push(city.sitraId);
          }
        }
      },
      this
    );
  }
  return perimetreGeo;
};

/**
 * Get email
 *
 * @param {Object} dataProduct
 * @returns {Array}
 */
ImportGenericGEOTREK.prototype.getEmail = function (dataProduct) {
  var root = dataProduct['properties'];
  var emails = [];

  if (root) {
    var child = root['information_desks'];
    if (!_.isArray(child)) {
      child = [child];
    }
    _.forEach(child, (item) => {
      if (item && item['email']) {
        emails.push(item['email']);
      }
    });
  }

  return DataString.cleanEmailArray(emails);
};

/**
 * Get phone
 *
 * @param dataProduct
 * @returns {Array}
 */
ImportGenericGEOTREK.prototype.getPhone = function (dataProduct) {
  var root = dataProduct['properties'];
  var phones = [];

  if (root) {
    var child = root['information_desks'];
    if (!_.isArray(child)) {
      child = [child];
    }
    phones = _.map(child, 'phone');
  }

  return DataString.cleanPhoneArray(phones);
};

/**
 * Get website
 *
 * @param {Object} dataProduct
 * @returns {Array}
 */
ImportGenericGEOTREK.prototype.getWebsite = function (dataProduct) {
  var root = dataProduct['properties'];
  var website = [];

  if (root) {
    var child = root['information_desks'];
    if (!_.isArray(child)) {
      child = [child];
    }
    _.forEach(child, (item) => {
      if (item && item['website']) {
        website.push(this.addUrlHttp(item['website']));
      }
    });
  }

  return website;
};

/**
 * Get image
 *
 * @param {Object} dataProduct
 * @returns {Promise}
 */
ImportGenericGEOTREK.prototype.getImage = function (dataProduct) {
  var root = dataProduct['properties'];
  var listImages = [];

  if (root && root['pictures']) {
    if (!_.isArray(root['pictures'])) {
      root['pictures'] = [root['pictures']];
    }
    _.forEach(root['pictures'], (item) => {
      if (item && item['url']) {
        listImages.push({
          url: this.addUrlHttp(item['url']),
          legend: item['legend'],
          name: item['title'],
          description: item['author']
        });
      }
    });
  }

  return listImages;
};

/**
 * Get video
 *
 * @param {Object} dataProduct
 * @returns {Array}
 */
ImportGenericGEOTREK.prototype.getVideo = function (dataProduct) {
  var root = dataProduct['properties'];
  var listVideos = [];

  if (root) {
    if (root['videos']) {
      if (!_.isArray(root['videos'])) {
        root['videos'] = [root['videos']];
      }
      _.forEach(root['videos'], (item) => {
        if (item && item['url']) {
          listVideos.push({
            url: this.addUrlHttp(item['url']),
            type: 'VIDEO'
          });
        }
      });
    }
  }
  return _.uniq(listVideos, 'url');
};

/**
 * Get pdf
 *
 * @param {Object} dataProduct
 * @returns {Array}
 */
ImportGenericGEOTREK.prototype.getPdf = function (dataProduct) {
  var root = dataProduct['properties'];
  var pdf = [];

  if (root) {
    if (root['printable']) {
      pdf.push({
        url: this.addUrlHttp(root['printable']),
        name: 'Pdf',
        type: 'Pdf'
      });
    }
  }
  return pdf;
};

ImportGenericGEOTREK.prototype.getLegalEntity = function (
  product,
  dataProduct
) {
  var root = dataProduct['properties']['structure'];
  var idStructure = null,
    legalEntity = null;

  var listLegalEntity = [];

  if (root['id']) {
    idStructure = root['id'];

    var conf = configImportGEOTREK.entity[this.idProject][idStructure];
    if (conf) {
      legalEntity = {
        specialId: conf['specialId'],
        importType: product.importType,
        importSubType: product.importSubType,
        type: 'STRUCTURE',
        name: conf['name'],
        address: {
          address1: conf['address1'],
          address2: conf['address2'],
          city: conf['city'],
          insee: conf['insee']
        },
        specialIdSitra: conf['specialIdSitra'],
        statusImport: conf['statusImport']
      };
    }
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

/**
 * Translate
 *
 * @param pField
 * @returns {*}
 */
ImportGenericGEOTREK.prototype.translate = function (key, ln) {
  var trad = {
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
  if (trad[key] && trad[key].hasOwnProperty(ln)) {
    return trad[key][ln];
  } else if (trad[key] && trad[key].hasOwnProperty('en')) {
    return trad[key]['en'];
  } else {
    return key;
  }
};

module.exports = ImportGenericGEOTREK;
