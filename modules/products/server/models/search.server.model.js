'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  configSearch = require(__dirname + '/../../../../config/configSearch.js'),
  _ = require('lodash'),
  Elasticsearch = require(__dirname +
    '/../../../../library/elasticsearch/elasticsearch.js'),
  config = require(__dirname + '/../../../../config/config.js'),
  configSitra = require(__dirname + '/../../../../config/configSitra.js'),
  configSitraTown = require(__dirname +
    '/../../../../config/configSitraTown.js'),
  configSitraTownAndMember = require(__dirname +
    '/../../../../config/configSitraTownAndMember.js'),
  esIndex = config.elasticsearch.index,
  esType = 'product';

/**
 * Index product
 *
 * @param {Object} product
 * @param {function} callback
 */
exports.index = function (product, callback) {
  // Index product in search engine

  var search = product.name;
  if (product.shortDescription) {
    search += ' ' + product.shortDescription;
  }
  if (product.description) {
    search += ' ' + product.description;
  }

  Elasticsearch.index(
    esIndex,
    esType,
    product.id,
    {
      specialId: product.specialId,
      specialIdSitra: product.specialIdSitra,
      importType: product.importType,
      importSubType: product.importSubType,
      typeCode: product.typeCode,
      type: product.type,
      subType: product.subType
        ? __retrieveConfigSitraReference(product.subType, 'labelFr')
        : 'NON DEFINI',
      search: search,
      name: product.name,
      address: product.address ? __retrieveAddress(product.address) : null,
      shortDescription: product.shortDescription,
      website: product.website,
      email: product.email,
      phone: product.phone,
      fax: product.fax,
      image:
        product.image && product.image[0] && product.image[0].url.length > 0
          ? product.image[0]
          : null,
      hasImage:
        product.image && product.image[0] && product.image[0].url.length > 0,
      // Specific
      territory: product.territory
        ? __retrieveConfigSitraTerritory(product.territory, 'labelFr')
        : null,
      member: product.member
        ? __retrieveConfigSitraMember(product.member, 'labelFr')
        : null,
      adherent: product.adherent ? product.adherent : null,
      ranking: product.ranking
        ? __retrieveConfigSitraReference(product.ranking, 'labelFr')
        : null,
      label: product.label
        ? __retrieveConfigSitraReference(product.label, 'labelFr')
        : null,
      labelType: product.labelType
        ? __retrieveConfigSitraReference(product.labelType, 'labelFr')
        : null,
      labelTourismHandicap: product.labelTourismHandicap
        ? __retrieveConfigSitraReference(
            product.labelTourismHandicap,
            'labelFr'
          )
        : null,
      labelChartQuality: product.labelChartQuality
        ? __retrieveConfigSitraReference(product.labelChartQuality, 'labelFr')
        : null,
      chain: product.chain
        ? __retrieveConfigSitraReference(product.chain, 'labelFr')
        : null,
      chainLabel: product.chainLabel
        ? __retrieveConfigSitraReference(product.chainLabel, 'labelFr')
        : null,
      guide: product.guide
        ? __retrieveConfigSitraReference(product.guide, 'labelFr')
        : null,
      language: product.language
        ? __retrieveConfigSitraReference(product.language, 'labelFr')
        : null,
      capacity:
        product.capacity && product.capacity.value
          ? product.capacity.value
          : null,
      scope: product.scope
        ? __retrieveConfigSitraReference(product.scope, 'labelFr')
        : null,
      category: product.category
        ? __retrieveConfigSitraReference(product.category, 'labelFr')
        : null,
      theme: product.theme
        ? __retrieveConfigSitraReference(product.theme, 'labelFr')
        : null,
      activity: product.activity
        ? __retrieveConfigSitraReference(product.activity, 'labelFr')
        : null,
      prestation: product.prestation
        ? __retrieveConfigSitraReference(product.prestation, 'labelFr')
        : null,
      service: product.service
        ? __retrieveConfigSitraReference(product.service, 'labelFr')
        : null,
      equipment: product.equipment
        ? __retrieveConfigSitraReference(product.equipment, 'labelFr')
        : null,
      comfort: product.comfort
        ? __retrieveConfigSitraReference(product.comfort, 'labelFr')
        : null,
      typeDetail: product.typeDetail
        ? __retrieveConfigSitraReference(product.typeDetail, 'labelFr')
        : null,
      criteriaFamily: product.criteriaFamily
        ? __retrieveConfigSitraReference(product.criteriaFamily, 'labelFr')
        : null,
      visitGroup: product.visitGroup
        ? __retrieveConfigSitraReference(product.visitGroup, 'labelFr')
        : null,
      visitIndividual: product.visitIndividual
        ? __retrieveConfigSitraReference(product.visitIndividual, 'labelFr')
        : null,
      typeClient: product.typeClient
        ? __retrieveConfigSitraReference(product.typeClient, 'labelFr')
        : null,
      typePromoSitra: product.typePromoSitra
        ? __retrieveConfigSitraReference(product.typePromoSitra, 'labelFr')
        : null,
      typeAccommodation: product.typeAccommodation
        ? __retrieveConfigSitraReference(product.typeAccommodation, 'labelFr')
        : null,
      typeHousing: product.typeHousing
        ? __retrieveConfigSitraReference(product.typeHousing, 'labelFr')
        : null,
      typeSpecialty: product.typeSpecialty
        ? __retrieveConfigSitraReference(product.typeSpecialty, 'labelFr')
        : null,
      typeProduct: product.typeProduct
        ? __retrieveConfigSitraReference(product.typeProduct, 'labelFr')
        : null,
      aopAocIgp: product.aopAocIgp
        ? __retrieveConfigSitraReference(product.aopAocIgp, 'labelFr')
        : null,
      meanPayment: product.meanPayment
        ? __retrieveConfigSitraReference(product.meanPayment, 'labelFr')
        : null,
      transport: product.transport
        ? __retrieveConfigSitraReference(product.transport, 'labelFr')
        : null,
      // Commom
      environment: product.environment
        ? __retrieveConfigSitraReference(product.environment, 'labelFr')
        : null,
      localization:
        product.localization &&
        product.localization.lat &&
        product.localization.lon
          ? product.localization
          : null,
      latitude:
        product.localization && product.localization.lat
          ? product.localization.lat
          : null,
      longitude:
        product.localization && product.localization.lon
          ? product.localization.lon
          : null,
      alert: product.alert,
      rateCompletion: product.rateCompletion,
      statusImport: __retrieveStatusImport(product.statusImport),
      url: product.url,
      sorting: Math.floor(Math.random() * 10000),
      created: product.created,
      createdFromClient: product.createdFromClient,
      lastUpdate: product.lastUpdate,
      lastUpdateFromClient: product.lastUpdateFromClient,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      displayForUser: product.displayForUser
    },
    callback
  );
};

/**
 * Delete from index
 *
 * @param {Object} product
 * @param {function} callback
 */
exports.indexDelete = function (product, callback) {
  // Delete product from index in search engine
  Elasticsearch.delete(esIndex, esType, product.id, callback);
};

/**
 * Build search sort config data
 *
 * @param {Object} data
 * @returns {Array}
 * @private
 */
exports.buildSearchSort = function (data) {
  var arrSort = [],
    arrSortData;

  var arrAllowFields = {
    specialId: 'specialId.not_analyzed',
    specialIdSitra: 'specialIdSitra',
    importType: 'importType.not_analyzed',
    importSubType: 'importSubType.not_analyzed',
    typeCode: 'typeCode.not_analyzed',
    type: 'type.not_analyzed',
    subType: 'subType.not_analyzed',
    name: 'name.not_analyzed',
    insee: 'address.insee',
    zipcode: 'address.zipcode',
    postalCode: 'address.zipcode',
    city: 'address.city.not_analyzed',
    shortDescription: 'shortDescription',
    website: 'website',
    email: 'email',
    phone: 'phone',
    fax: 'fax',
    image: 'image.url',
    hasImage: 'hasImage',
    member: 'member.not_analyzed',
    adherent: 'adherent',
    territory: 'territory',
    ranking: 'ranking',
    label: 'label',
    labelType: 'labelType',
    labelTourismHandicap: 'labelTourismHandicap',
    labelChartQuality: 'labelChartQuality',
    chain: 'chain',
    chainLabel: 'chainLabel',
    guide: 'guide',
    language: 'language',
    capacity: 'capacity',
    scope: 'scope',
    category: 'category',
    theme: 'theme',
    activity: 'activity',
    prestation: 'prestation',
    service: 'service',
    equipment: 'equipment',
    comfort: 'comfort',
    typeDetail: 'typeDetail',
    criteriaFamily: 'criteriaFamily',
    visitGroup: 'visitGroup',
    visitIndividual: 'visitIndividual',
    typeClient: 'typeClient',
    typePromoSitra: 'typePromoSitra',
    typeAccommodation: 'typeAccommodation',
    typeHousing: 'typeHousing',
    typeSpecialty: 'typeSpecialty',
    typeProduct: 'typeProduct',
    aopAocIgp: 'aopAocIgp',
    meanPayment: 'meanPayment',
    transport: 'transport',
    environment: 'environment',
    latitude: 'latitude',
    longitude: 'longitude',
    alert: 'alert',
    rateCompletion: 'rateCompletion',
    statusImport: 'statusImport',
    url: 'url',
    sorting: 'sorting'
  };

  if (data && data.sort) {
    arrSortData = data.sort.split(';');
    if (arrSortData) {
      _.forEach(arrSortData, function (sortStr) {
        var arrSortDataElt = sortStr.split('|'),
          fieldName = arrSortDataElt.length ? arrSortDataElt.shift() : null,
          order = arrSortDataElt.length
            ? arrSortDataElt.shift().toLowerCase()
            : 'asc',
          sort;

        if (fieldName && arrAllowFields[fieldName]) {
          sort = {};
          sort[arrAllowFields[fieldName]] = {
            order: order === 'desc' || order === '-1' ? 'desc' : 'asc'
          };
          arrSort.push(sort);
        }
      });
    }
  }

  return arrSort;
};

/**
 * Do search
 *
 * @param {Object} data
 * @param {function} callback
 * @param {Object} options
 * @private
 */
exports.search = function (data, callback, options) {
  const params = {};
  const query = [];
  const arrSort = this.buildSearchSort(data);

  var arrAllowFields = {
    specialId: 'specialId',
    specialIdSitra: 'specialIdSitra',
    importType: 'importType',
    importSubType: 'importSubType',
    typeCode: 'typeCode.not_analyzed',
    type: 'type.not_analyzed',
    subType: 'subType.not_analyzed',
    name: 'name',
    insee: 'address.insee',
    zipcode: 'address.zipcode',
    postalCode: 'address.zipcode',
    city: 'address.city',
    shortDescription: 'shortDescription',
    website: 'website',
    email: 'email',
    phone: 'phone',
    fax: 'fax',
    hasImage: 'hasImage',
    member: 'member.not_analyzed',
    adherent: 'adherent',
    territory: 'territory',
    ranking: 'ranking',
    label: 'label',
    labelType: 'labelType',
    labelTourismHandicap: 'labelTourismHandicap',
    labelChartQuality: 'labelChartQuality',
    chain: 'chain',
    chainLabel: 'chainLabel',
    guide: 'guide',
    language: 'language',
    capacity: 'capacity',
    scope: 'scope',
    category: 'category',
    theme: 'theme',
    activity: 'activity',
    prestation: 'prestation',
    service: 'service',
    equipment: 'equipment',
    comfort: 'comfort',
    typeDetail: 'typeDetail',
    criteriaFamily: 'criteriaFamily',
    visitGroup: 'visitGroup',
    visitIndividual: 'visitIndividual',
    typeClient: 'typeClient',
    typePromoSitra: 'typePromoSitra',
    typeAccommodation: 'typeAccommodation',
    typeHousing: 'typeHousing',
    typeSpecialty: 'typeSpecialty',
    typeProduct: 'typeProduct',
    aopAocIgp: 'aopAocIgp',
    meanPayment: 'meanPayment',
    transport: 'transport',
    environment: 'environment',
    alert: 'alert',
    statusImport: 'statusImport',
    url: 'url',
    search: 'search',
    lastUpdateFromClientLower: 'lastUpdateFromClientLower',
    lastUpdateFromClientGreather: 'lastUpdateFromClientGreather',
    supplierId: 'supplierId',
    supplierName: 'supplierName',
    displayForUser: 'displayForUser'
  };

  // set query part for importType and importSubType params
  queryLinkedToRights = [];

  var queryRange = {
    range: {
      lastUpdateFromClient: {}
    }
  };

  for (var pName in arrAllowFields) {
    // Prepare query
    if (arrAllowFields.hasOwnProperty(pName) && data[pName]) {
      var queryLinkedToRights,
        queryType,
        queryTmp,
        arrQueryTmp,
        arrKeyword,
        arrKeywordLength,
        iTmp;

      if (!_.isArray(data[pName])) {
        // Retrieve OR query
        if (data[pName].match(/;/)) {
          data[pName] = data[pName].split(';');
        }
      }

      switch (pName) {
        case 'statusImport':
        case 'type':
        case 'subType':
        case 'alert':
        case 'territory':
        case 'member':
          arrKeyword = _.isArray(data[pName])
            ? data[pName]
            : data[pName].match(/([^;|]+)/gi);
          queryType = 'match';
          break;

        case 'lastUpdateFromClientLower': // date
        case 'lastUpdateFromClientGreather':
          queryType = 'range';
          break;

        default:
          //@todo : Fix this !
          arrKeyword = _.isArray(data[pName])
            ? data[pName]
            : data[pName].replace('-', ' ').match(/([^;\| -'"]+)/gi);
          queryType = 'queryString';
          break;
      }

      if (!arrKeyword) {
        arrKeyword = data[pName].trim() !== '"' ? [data[pName]] : [];
      }

      arrKeywordLength = arrKeyword.length;
      // OR query
      if (_.isArray(data[pName])) {
        arrQueryTmp = [];
        for (iTmp = 0; iTmp < arrKeywordLength; iTmp++) {
          if (arrKeyword[iTmp] === '') {
            continue;
          }

          switch (queryType) {
            case 'match':
              queryTmp = {
                match: {}
              };
              queryTmp.match[arrAllowFields[pName]] = {
                query: arrKeyword[iTmp]
              };
              break;

            default:
              queryTmp = {
                query_string: {
                  query: '*' + arrKeyword[iTmp] + '*',
                  fields: [arrAllowFields[pName]]
                }
              };
              break;
          }
          if (
            arrAllowFields[pName] === 'importType' ||
            arrAllowFields[pName] === 'importSubType'
          ) {
            queryLinkedToRights.push(queryTmp);
          } else {
            arrQueryTmp.push(queryTmp);
          }
        }

        if (arrQueryTmp.length) {
          query.push({
            bool: {
              should: arrQueryTmp
            }
          });
        }
      }
      // AND query
      else {
        for (iTmp = 0; iTmp < arrKeywordLength; iTmp++) {
          switch (queryType) {
            case 'match':
              queryTmp = {
                match: {}
              };
              queryTmp.match[arrAllowFields[pName]] = {
                query: arrKeyword[iTmp]
              };
              break;

            case 'range':
              if (arrAllowFields[pName] === 'lastUpdateFromClientGreather') {
                queryRange.range.lastUpdateFromClient.gte =
                  data.lastUpdateFromClientGreather;
              }
              if (arrAllowFields[pName] === 'lastUpdateFromClientLower') {
                queryRange.range.lastUpdateFromClient.lte =
                  data.lastUpdateFromClientLower;
              }
              break;

            default:
              queryTmp = {
                query_string: {
                  query: '*' + arrKeyword[iTmp] + '*',
                  fields: [arrAllowFields[pName]]
                }
              };
              break;
          }

          if (queryTmp) {
            if (
              arrAllowFields[pName] === 'importType' ||
              arrAllowFields[pName] === 'importSubType'
            ) {
              queryLinkedToRights.push(queryTmp);
            } else {
              query.push(queryTmp);
            }
          }
        }
      }
    }
  }
  // Search around city at 20km around
  if (data.latitude && data.longitude) {
    query.push({
      filtered: {
        filter: {
          geo_distance: {
            distance: data.geoDistance ? data.geoDistance : '30km',
            localization: {
              lat: data.latitude,
              lon: data.longitude
            }
          }
        }
      }
    });
  }
  if (data.localization && data.localization.lat && data.localization.lon) {
    query.push({
      filtered: {
        filter: {
          geo_distance: {
            distance: data.geoDistance ? data.geoDistance : '30km',
            localization: {
              lat: data.localization.lat,
              lon: data.localization.lon
            }
          }
        }
      }
    });
  }

  if (_.size(queryRange.range.lastUpdateFromClient) > 0) {
    query.push(queryRange);
  }

  // Built query
  // Search matches for importType OR importSubType
  // because importSubType is used only for VAR83 data
  if (query.length || queryLinkedToRights.length) {
    params.query = {
      bool: {
        must: [
          {
            bool: {
              should: queryLinkedToRights
            }
          },
          {
            bool: {
              must: query
            }
          }
        ]
      }
    };
  }

  // Size
  params.size = data.size ? data.size : 20;
  params.from = data.from ? data.from : 0;

  // Sort
  // Add default
  arrSort.push({ sorting: { order: 'asc' } });
  params.sort = arrSort;

  // Built aggregations
  if (options && options.aggregations) {
    params.aggregations = options.aggregations;
  } else {
    params.aggregations = {
      importType: {
        terms: {
          field: 'importType.not_analyzed',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      importSubType: {
        terms: {
          field: 'importSubType.not_analyzed',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      typeCode: {
        terms: {
          field: 'typeCode.not_analyzed',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      type: {
        terms: { field: 'type.not_analyzed', size: 0, order: { _term: 'asc' } }
      },
      subType: {
        terms: {
          field: 'subType.not_analyzed',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      member: {
        terms: {
          field: 'member.not_analyzed',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      adherent: {
        terms: { field: 'adherent', size: 0, order: { _term: 'asc' } }
      },
      territory: {
        terms: { field: 'territory', size: 0, order: { _term: 'asc' } }
      },
      ranking: {
        terms: { field: 'ranking', size: 0, order: { _term: 'asc' } }
      },
      label: {
        terms: { field: 'label', size: 0, order: { _term: 'asc' } }
      },
      labelType: {
        terms: { field: 'labelType', size: 0, order: { _term: 'asc' } }
      },
      labelTourismHandicap: {
        terms: {
          field: 'labelTourismHandicap',
          size: 0,
          order: { _term: 'asc' }
        }
      },
      labelChartQuality: {
        terms: { field: 'labelChartQuality', size: 0, order: { _term: 'asc' } }
      },
      chain: {
        terms: { field: 'chain', size: 0, order: { _term: 'asc' } }
      },
      chainLabel: {
        terms: { field: 'chainLabel', size: 0, order: { _term: 'asc' } }
      },
      guide: {
        terms: { field: 'guide', size: 0, order: { _term: 'asc' } }
      },
      language: {
        terms: { field: 'language', size: 0, order: { _term: 'asc' } }
      },
      scope: {
        terms: { field: 'scope', size: 0, order: { _term: 'asc' } }
      },
      category: {
        terms: { field: 'category', size: 0, order: { _term: 'asc' } }
      },
      theme: {
        terms: { field: 'theme', size: 0, order: { _term: 'asc' } }
      },
      activity: {
        terms: { field: 'activity', size: 0, order: { _term: 'asc' } }
      },
      prestation: {
        terms: { field: 'prestation', size: 0, order: { _term: 'asc' } }
      },
      service: {
        terms: { field: 'service', size: 0, order: { _term: 'asc' } }
      },
      equipment: {
        terms: { field: 'equipment', size: 0, order: { _term: 'asc' } }
      },
      comfort: {
        terms: { field: 'comfort', size: 0, order: { _term: 'asc' } }
      },
      typeDetail: {
        terms: { field: 'typeDetail', size: 0, order: { _term: 'asc' } }
      },
      criteriaFamily: {
        terms: { field: 'criteriaFamily', size: 0, order: { _term: 'asc' } }
      },
      visitGroup: {
        terms: { field: 'visitGroup', size: 0, order: { _term: 'asc' } }
      },
      visitIndividual: {
        terms: { field: 'visitIndividual', size: 0, order: { _term: 'asc' } }
      },
      typeClient: {
        terms: { field: 'typeClient', size: 0, order: { _term: 'asc' } }
      },
      typePromoSitra: {
        terms: { field: 'typePromoSitra', size: 0, order: { _term: 'asc' } }
      },
      typeAccommodation: {
        terms: { field: 'typeAccommodation', size: 0, order: { _term: 'asc' } }
      },
      typeHousing: {
        terms: { field: 'typeHousing', size: 0, order: { _term: 'asc' } }
      },
      typeSpecialty: {
        terms: { field: 'typeSpecialty', size: 0, order: { _term: 'asc' } }
      },
      typeProduct: {
        terms: { field: 'typeProduct', size: 0, order: { _term: 'asc' } }
      },
      aopAocIgp: {
        terms: { field: 'aopAocIgp', size: 0, order: { _term: 'asc' } }
      },
      meanPayment: {
        terms: { field: 'meanPayment', size: 0, order: { _term: 'asc' } }
      },
      transport: {
        terms: { field: 'transport', size: 0, order: { _term: 'asc' } }
      },
      environment: {
        terms: { field: 'environment', size: 0, order: { _term: 'asc' } }
      },
      alert: {
        terms: { field: 'alert', size: 0, order: { _term: 'asc' } }
      },
      statusImport: {
        terms: { field: 'statusImport', size: 0, order: { _term: 'asc' } }
      }
    };
  }

  Elasticsearch.search(esIndex, esType, params, callback);
};

/**
 * Init elasticsearch analyser and mapping
 *
 * @param {function} callback
 */
exports.initElasticsearch = function (callback) {
  var analyser = {
      settings: {
        analysis: {
          analyzer: {
            analyzer_keyword: {
              tokenizer: 'keyword',
              filter: 'lowercase'
            }
          }
        }
      }
    },
    mapping = {
      properties: {
        specialId: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        specialIdSitra: {
          type: 'string',
          index: 'not_analyzed'
        },
        importType: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        importSubType: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        typeCode: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        type: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        subType: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        search: {
          type: 'string',
          analyzer: 'standard',
          boost: 5
        },
        name: {
          type: 'string',
          analyzer: 'standard',
          boost: 10,
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        address: {
          properties: {
            zipcode: {
              type: 'string',
              index: 'not_analyzed'
            },
            city: {
              type: 'string',
              analyzer: 'standard',
              boost: 8,
              fields: {
                not_analyzed: {
                  type: 'string',
                  index: 'not_analyzed'
                }
              }
            }
          }
        },
        shortDescription: {
          type: 'string',
          index: 'not_analyzed'
        },
        website: {
          type: 'string',
          index: 'not_analyzed'
        },
        email: {
          type: 'string',
          index: 'not_analyzed'
        },
        phone: {
          type: 'string',
          index: 'not_analyzed'
        },
        fax: {
          type: 'string',
          index: 'not_analyzed'
        },
        image: {
          properties: {
            url: {
              type: 'string',
              index: 'not_analyzed'
            },
            description: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        hasImage: {
          type: 'boolean'
        },
        member: {
          type: 'string',
          analyzer: 'standard',
          fields: {
            not_analyzed: {
              type: 'string',
              index: 'not_analyzed'
            }
          }
        },
        adherent: {
          type: 'string',
          index: 'not_analyzed'
        },
        territory: {
          type: 'string',
          index: 'not_analyzed'
        },
        ranking: {
          type: 'string',
          index: 'not_analyzed'
        },
        label: {
          type: 'string',
          index: 'not_analyzed'
        },
        labelType: {
          type: 'string',
          index: 'not_analyzed'
        },
        labelTourismHandicap: {
          type: 'string',
          index: 'not_analyzed'
        },
        labelChartQuality: {
          type: 'string',
          index: 'not_analyzed'
        },
        chain: {
          type: 'string',
          index: 'not_analyzed'
        },
        chainLabel: {
          type: 'string',
          index: 'not_analyzed'
        },
        guide: {
          type: 'string',
          index: 'not_analyzed'
        },
        language: {
          type: 'string',
          index: 'not_analyzed'
        },
        capacity: {
          type: 'integer',
          index: 'not_analyzed'
        },
        scope: {
          type: 'string',
          index: 'not_analyzed'
        },
        category: {
          type: 'string',
          index: 'not_analyzed'
        },
        theme: {
          type: 'string',
          index: 'not_analyzed'
        },
        activity: {
          type: 'string',
          index: 'not_analyzed'
        },
        prestation: {
          type: 'string',
          index: 'not_analyzed'
        },
        service: {
          type: 'string',
          index: 'not_analyzed'
        },
        equipment: {
          type: 'string',
          index: 'not_analyzed'
        },
        comfort: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeDetail: {
          type: 'string',
          index: 'not_analyzed'
        },
        criteriaFamily: {
          type: 'string',
          index: 'not_analyzed'
        },
        visitGroup: {
          type: 'string',
          index: 'not_analyzed'
        },
        visitIndividual: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeClient: {
          type: 'string',
          index: 'not_analyzed'
        },
        typePromoSitra: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeAccommodation: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeHousing: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeSpecialty: {
          type: 'string',
          index: 'not_analyzed'
        },
        typeProduct: {
          type: 'string',
          index: 'not_analyzed'
        },
        aopAocIgp: {
          type: 'string',
          index: 'not_analyzed'
        },
        meanPayment: {
          type: 'string',
          index: 'not_analyzed'
        },
        transport: {
          type: 'string',
          index: 'not_analyzed'
        },
        environment: {
          type: 'string',
          index: 'not_analyzed'
        },
        localization: {
          type: 'geo_point'
        },
        latitude: {
          type: 'float'
        },
        longitude: {
          type: 'float'
        },
        alert: {
          type: 'string',
          index: 'not_analyzed'
        },
        filename: {
          type: 'string',
          index: 'not_analyzed'
        },
        rateCompletion: {
          type: 'integer'
        },
        statusImport: {
          type: 'string',
          index: 'not_analyzed'
        },
        url: {
          type: 'string',
          index: 'not_analyzed'
        },
        sorting: {
          type: 'integer'
        }
      }
    };

  Elasticsearch.initAnalyser(esIndex, analyser, function (err) {
    if (err) {
      console.log('Error in elasticsearch initAnalyser() : ' + err);
    }

    Elasticsearch.initMapping(esIndex, esType, mapping, function (err, resp) {
      if (err) {
        console.log('Error in elasticsearch initMapping() : ' + err);
      }

      if (callback) {
        callback(err, resp);
      }
    });
  });
};

/**
 * Build query
 *
 * @param {String} queryString
 */
exports.queryBuild = function (queryString) {
  if (typeof queryString !== 'number') {
    queryString = '' + queryString;
  } else if (typeof queryString !== 'string') {
    queryString = '';
  }

  var arrCriterias = queryString.split('/'),
    i,
    criteria,
    query = {};

  if (arrCriterias) {
    // First param is search
    query.search = arrCriterias.shift();

    // Other fields
    for (i in arrCriterias) {
      if (arrCriterias.hasOwnProperty(i)) {
        criteria = arrCriterias[i];
        if (configSearch[criteria]) {
          if (query[configSearch[criteria].field]) {
            query[configSearch[criteria].field] +=
              '|' + configSearch[criteria].search;
          } else {
            query[configSearch[criteria].field] = configSearch[criteria].search;
          }
        }
      }
    }
  }

  return query;
};

/**
 * Query add criteria
 *
 * @param {String} queryString
 * @param {String} criteriaLabel
 * @param {String} criteriaType
 * @returns {String}
 */
exports.queryAdd = function (queryString, criteriaLabel, criteriaType) {
  // Retrieve param key
  if (!queryString) {
    queryString = '';
  }

  var Product = mongoose.model('Product'),
    criteria = __queryRetrieve(criteriaLabel, criteriaType),
    criteriaTmp,
    arrQuery = queryString.split('/'),
    lastIndex = 1;
  if (arrQuery.indexOf(criteria) < 0) {
    if (criteria) {
      if (queryString.length) {
        for (criteriaTmp in configSearch) {
          if (configSearch.hasOwnProperty(criteriaTmp)) {
            if (criteriaTmp === criteria) {
              arrQuery.splice(lastIndex, 0, criteria);
              break;
            } else if (arrQuery.indexOf(criteriaTmp) >= 0) {
              lastIndex++;
            }
          }
        }
      } else {
        arrQuery[1] = criteria;
      }
    } else {
      arrQuery[0] = criteriaLabel;
    }
  }

  return arrQuery.join('/');
};

/**
 * Retrieve query criteria
 *
 * @param criteriaLabel
 * @param criteriaType
 * @returns {String|null}
 */
function __queryRetrieve(criteriaLabel, criteriaType) {
  var criteria, label, type;

  if (!criteriaType) {
    criteriaType = null;
  } else {
    criteriaType = criteriaType.toLowerCase();
  }

  // Retrieve param key
  for (criteria in configSearch) {
    if (configSearch.hasOwnProperty(criteria)) {
      label = configSearch[criteria].label.toLowerCase();
      type = configSearch[criteria].field.toLowerCase();

      if (
        label === criteriaLabel.toLowerCase() &&
        (criteriaType === null || type === criteriaType)
      ) {
        return criteria;
      }
    }
  }

  return null;
}

/**
 * Format date
 *
 * @param {Date} date
 * @returns {String}
 * @private
 */
function __formatDateToString(date) {
  var dd = (date.getDate() < 10 ? '0' : '') + date.getDate(),
    MM = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1),
    yyyy = date.getFullYear();

  return yyyy + '-' + MM + '-' + dd;
}

/**
 * Retrieve config sitra - X
 *
 * @param {Object} data
 * @param {String} key
 * @returns {String|Array|null}
 * @private
 */
function __retrieveConfigSitraX(arrData, data, key) {
  if (_.isArray(data)) {
    var arrFinal = [];

    _.forEach(data, function (val) {
      if (arrData[val] && arrData[val][key]) {
        arrFinal.push(arrData[val][key]);
      }
    });

    return arrFinal;
  } else if (data) {
    if (arrData[data] && arrData[data][key]) {
      return arrData[data][key];
    }
  }

  return null;
}

/**
 * Retrieve config sitra - Reference
 *
 * @param {String} zipcode
 * @param {Integer} sitraId
 * @param {String} key
 * @returns {String|null}
 * @private
 */
function __retrieveConfigSitraTown(zipcode, sitraId, key) {
  var cityLabel = null,
    l,
    i;

  if (configSitraTown[zipcode]) {
    l = configSitraTown[zipcode].length;
    for (i = 0; i < l; i++) {
      if (configSitraTown[zipcode][i].sitraId === sitraId) {
        cityLabel = configSitraTown[zipcode][i][key];
        break;
      } else {
        cityLabel = configSitraTown[zipcode][i][key];
      }
    }
  }

  return cityLabel;
}

/**
 * Retrieve config sitra - Reference
 *
 * @param {Object} data
 * @param {String} key
 * @returns {String|Array|null}
 * @private
 */
function __retrieveConfigSitraReference(data, key) {
  return __retrieveConfigSitraX(configSitra.reference, data, key);
}

/**
 * Retrieve config sitra - Territory
 *
 * @param {Object} data
 * @param {String} key
 * @returns {String|Array|null}
 * @private
 */
function __retrieveConfigSitraTerritory(data, key) {
  return __retrieveConfigSitraX(configSitra.territory, data, key);
}

/**
 * Retrieve config sitra town and member - Member
 *
 * @param {Object} data
 * @param {String} key
 * @returns {String|Array|null}
 * @private
 */
function __retrieveConfigSitraMember(data, key) {
  return __retrieveConfigSitraX(
    configSitraTownAndMember.perMemberId,
    data,
    key
  );
}

/**
 * Retrieve status import
 *
 * @param {Integer} statusImport
 * @returns {String}
 * @private
 */
function __retrieveStatusImport(statusImportId) {
  var Product = mongoose.model('Product'),
    data = Product.getStatusImportReference();

  return data[statusImportId] ? data[statusImportId] : null;
}

/**
 * Retrieve address
 *
 * @param {Object} address
 * @returns {Object}
 * @private
 */
function __retrieveAddress(address) {
  var objAddress = address.toObject();
  if (objAddress && objAddress.city) {
    objAddress.city = __retrieveConfigSitraTown(
      objAddress.zipcode,
      objAddress.city,
      'name'
    );
  }
  if (objAddress && !objAddress.city) {
    objAddress.city = '';
  }

  return objAddress;
}
