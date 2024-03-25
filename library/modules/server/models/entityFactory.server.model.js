'use strict';

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash'),
    path = require('path'),
    DataString = require(path.resolve('./library/data/manipulate.js')),
    configSitra = require(path.resolve('./config/configSitra.js')),
    configSitraTownAndMember = require(path.resolve('./config/configSitraTownAndMember.js')),
    configSitraReference = require(path.resolve('./config/configSitraReference.js')),
    ExportModel = require(path.resolve('./library/modules/server/models/export.model.js'));
    
/**
 * Class EntityFactory
 * Enable create an entity's mongoose instance, and init generic CRUD methods
 */
class EntityFactory
{
  constructor(name, schema) {
    this.name = name;
    this.schema = schema || {};
    this.model = null;
  }
  
  getModel() {
    return this.model;
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

  setMongooseModel(EntitySchema) {
    this.model = mongoose.model(this.name, EntitySchema);
  }

  getDefaultSchema() {
    return this.schema.defaultSchema;
  }

  getByUrl(url, callback) {
    const Model = mongoose.model(this.name);
    Model.find({ url }).exec((err, datas) => {
      if (err) {
        console.log('Error in ' + this.name + ' getByUrl() : ' + err);
      }

      if (callback) {
        callback(err, datas);
      }
    });
  }

  save(datas, callback) {
    console.log('SAVE3 DATAS',datas.name, this.name);
    let Model = mongoose.model(this.name),
      address = datas.address ? datas.address : null,
      zipcode = address && address.zipcode ? address.zipcode : null,
      data,
      dataL,
      i;

    // Update date last update
    datas.lastUpdate = new Date();

    if (!datas.url) {
      datas.url = this.buildUrl(datas);
    }

    datas.territory = null;

    if (zipcode && configSitraTownAndMember.perZipcode[zipcode]) {
      data = configSitraTownAndMember.perZipcode[zipcode];
      dataL = data.length;
      for (i = 0; i < dataL; i++) {
        if (address.insee && address.insee === data[i].insee) {
          datas.territory = data[i].arrTerritory;
          break;
        }
      }
    }

    // Check url
    __checkUrlHttp(datas);

    if (datas.specialIdSitra) {
      datas.statusImport = 2;
    } else if (
      datas.type !== 'NON DEFINI' &&
      (!datas.alert || !datas.alert.length) &&
      datas.member
    ) {
      datas.statusImport = 1;
    } else if (datas.type === 'STRUCTURE') {
      datas.statusImport = 1;
    } else {
      datas.statusImport = 0;
    }

    // Init alert
    datas.alert = __checkAlert(datas, this.name);

    datas.save((err) => {
      if (err) {
        // Fix problem with unique url
        if (err.code === 11000) {
          datas.url = datas.url + 'A';
          return Model.save(datas, callback);
        }

        console.log('Error in ' + this.name + ' save() : ', err);
      }

      if (callback && !err) {
        callback(err, datas);
      }
    });
  }

  buildUrl(datas) {
    return `${this.name}/Detail/${this.cleanUrl(datas.type)}${
      datas.address && datas.address.city
        ? '/' + this.cleanUrl(datas.address.city)
        : ''
    }/${this.cleanUrl(datas.name)}/${this.cleanUrl(datas.specialId)}`;
  }

  cleanUrl(str) {
    if (typeof str === 'string') {
      str = DataString.removeAccents(str).replace(/[^a-z0-9\-_]/gi, '-');
    }
    return str;
  }

  checkPhone(phone, fieldName) {
    let alert = [];
    const phoneRegExpAlertChar = /([^0-9\ ])/,
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

  checkEmail(email, fieldName) {
    let alert = [];
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

  doUpsert(datas, specialId, importType, callback) {
    console.log('>>>>>>>>>NOT USED, doUpsert FROM entityServer ', this.name);
    const Model = mongoose.model(this.name);
//    const LegalEntity = mongoose.model('LegalEntity');
    
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

    Model.find(params, (err, docs) => {
      if (err) {
        console.log('Error in ' + this.name + ' doUpsert() : ' + err);
        if (callback) {
          callback(err);
        }
      } else {
        if (datas.legalEntity && datas.legalEntity.length) {
          _.forEach(datas.legalEntity, function (legalEntity, ind) {
            if (legalEntity.product && !legalEntity.product._id) {
              /*datas.legalEntity[ind].product = new LegalEntity(
                legalEntity.product
              );*/
              console.log('New LegalEntitty >>>>> ', legalEntity.product);
            }
          });
        }
        const data =
          docs.length > 0 ? _.extend(docs[0], datas) : new Model(datas);
        Model.save(data, callback);
      }
    });
  }

  exportSitra(datas, options, callback) {
    let optionsExportSitra = options || {};
    
    optionsExportSitra.typeExport = this.name;
    new ExportModel(this.model).__exportSitra(datas, optionsExportSitra, callback);
  }

  exportSitraAuto(type, options, callback) {
    options.typeExport = this.name;
    new ExportModel(this.model).__exportSitraAuto(type, options, callback);
  }

  getSitraSubType(data) {
    let objSubType = {},
      typeLabel,
      configSitraReferenceL,
      i;

    switch (data.type) {
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
        console.log(
          'Missing type "' + data.type + '" for sub type in getSitraSubType()'
        );
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

  getSitraKeys(data) {
    let arrKeys = [],
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

  getSitraReference(data) {
    let reference = {},
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

  getSitraPersonTypeReference(data) {
    let reference = {};

    [4196, 458, 464, 459, 467].forEach(function (id) {
      reference[id] = configSitra.reference[id].labelFr;
    });

    return reference;
  }

  getStatusImportReference(data) {
    return {
      0: 'non importable',
      1: 'importable',
      2: 'importé',
      3: 'supprimé',
      4: 'passerelle arrêtée'
    };
  }

  getSitraMemberReference(data) {
    let reference = {},
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

  getSitraCivilityReference(data) {
    let reference = {};

    if (configSitraReference.ContactCivilite) {
      _.forEach(configSitraReference.ContactCivilite, function (dataCivility) {
        reference[dataCivility.id] = dataCivility.labelFr;
      });
    }

    return reference;
  }

  getSITRAInternalCriteriaReference() {
    let reference = {};

    if (configSitraReference.internalCriteria) {
      _.forEach(configSitraReference.internalCriteria, function (dataInternalCriteria) {
        reference[dataInternalCriteria.id] = dataInternalCriteria.labelFr;
      });
    }

    return reference;
  }
}

module.exports = EntityFactory;


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

function __checkUrlHttp(data) {
  if (data.image) {
    _.forEach(data.image, function (image, i) {
      data.image[i].url = __cleanUrlHttp(image.url);
    });
  }
  if (data.pdf) {
    _.forEach(data.pdf, function (pdf, i) {
      data.pdf[i].url = __cleanUrlHttp(pdf.url);
    });
  }
  if (data.video) {
    _.forEach(data.video, function (video, i) {
      data.video[i].url = __cleanUrlHttp(video.url);
    });
  }
  if (data.socialNetwork) {
    _.forEach(data.socialNetwork, function (socialNetwork, i) {
      data.socialNetwork[i].url = __cleanUrlHttp(socialNetwork.url);
    });
  }
  if (data.website) {
    _.forEach(data.website, function (website, i) {
      data.website[i] = __cleanUrlHttp(website);
    });
  }

  if (data.reservation && data.reservation.website) {
    _.forEach(data.reservation, function (reservation, i) {
        _.forEach(reservation.website, function (website, j) {
          data.reservation[i].website[j] = __cleanUrlHttp(website);
        });
    });
  }
  if (data.contact) {
    _.forEach(data.contact, function (contact, i) {
      if (contact.website) {
        _.forEach(contact.website, function (website, j) {
          data.contact[i].website[j] = __cleanUrlHttp(website);
        });
      }
    });
  }
}

function __cleanUrlHttp(url) {
  if (url && _.isString(url) && !url.match('^https?://|^//')) {
    url = 'http://' + url;
  }

  return url;
}

function __checkAlert(data, moduleName) {
  let alert = [];
  const Model = mongoose.model(moduleName);

  if (data.statusImport === 4) {
    alert.push('passerelle arrêtée');
  }

  // Type
  if (!data.type || data.type === 'NON DEFINI') {
    alert.push("Nos scripts n'ont pas réussi à déterminer le type");
  }
  // Type code
  // Filtrage suivant le type
  /*if (event.typeCode) {
    nameClean = DataString.removeAccents(event.name);
    if (event.typeCode !== 'HPA' && nameClean.match(/Camping/i)) {
      alert.push('Le titre contient "Camping" mais le type n\'est pas un HPA');
    }
    if (event.typeCode !== 'HOT' && nameClean.match(/Hotel/i)) {
      alert.push('Le titre contient "Hotel" mais le type n\'est pas un HPA');
    }
  }*/
  
  // Address
  if (data.address) {
    if (data.address.zipcode && !data.address.zipcode.match(/^[0-9][AB0-9][0-9]{3}$/)) {
      alert.push("Le champ code postal n'a pas un format standard");
    } else {
      alert.push("Le champ code postal n'est pas renseigné");
    }
    if (data.address.city === 0) {
      data.address.city = null;
      alert.push("La commune n'existe pas");
    } else if (!data.address.city) {
      alert.push("Le champ commune n'est pas renseigné");
    }
  } else {
    alert.push("Le champ adresse n'est pas renseigné");
  }

  // Altitude
  if (data.altitude && data.altitude > 3000) {
    alert.push('Le champ altitude est supérieur à 3000m');
  }

  if (data.type && data.subType) {
    switch (data.type) {
      case 'COMMERCE_ET_SERVICE':
        // subType authorized
        if (![1874, 1875, 4012, 4013, 4014, 4015].includes(data.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'EQUIPEMENT':
        // subType authorized
        if (![2988, 2991, 2993].includes(data.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HEBERGEMENT_COLLECTIF':
      case 'HEBERGEMENT_LOCATIF':
        break;
      case 'HOTELLERIE':
        // subType authorized
        if (![2734, 2736].includes(data.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HOTELLERIE_PLEIN_AIR':
        // subType authorized
        if (![2409, 2410, 2413, 2416, 2418, 3722].includes(data.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'PATRIMOINE_CULTUREL':
        // subType authorized
        if (
          ![3200, 3201, 3202, 3203, 3204, 3205, 3851].includes(data)
        ) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'RESTAURATION':
        // subType authorized
        if (![2859, 2861, 2865, 2866, 4528].includes(data.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'FETE_ET_MANIFESTATION':
        // subType authorized
        if (
          ![1958, 1959, 1962, 1966, 1971, 1973, 1974].includes(data.subType)
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
  // 		alert = alert.concat(Model.checkPhone(phone, 'téléphone'));
  // 	});
  // }
  // Fax
  // if (product.fax) {
  // 	_.forEach(product.fax, function (fax) {
  // 		alert = alert.concat(Model.checkPhone(fax, 'fax'));
  // 	});
  // }
  // Email
  if (data.email && data.email.length) {
    _.forEach(data.email, function (email) {
      alert = alert.concat(Model.checkEmail(email, 'email'));
    });
  }

  // short description
  if (data.shortDescription && data.shortDescription.length > 255) {
    alert.push('la description court dépasse la longueur de 255 caractères!');
  }

  return alert.length ? alert : null;
}
