'use strict';

/**
 * Module dependencies.
 */
const path = require('path');
const http = require('http');
const https = require('https');
const _ = require('lodash');
const mongoose = require('mongoose');
const request = require('request');
const axios = require('axios');
const moment = require('moment');
const Promise = require('bluebird');
const Url = require('url');
const config = require(path.resolve('config/config.js'));
const configSitraReference = require(path.resolve(
  'config/configSitraReference.js'
));
const configSitraReferencePerId = __initSitraReferencePerId(
  require(path.resolve('config/configSitraReference.js'))
);
const DataString = require(path.resolve('library/data/manipulate.js'));
let productImage = null;
let productMultimedia = null;

let tokenPerMemberId = {};
const csvStringify = require('csv-stringify');
const sleep = require('util').promisify(setTimeout);

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

/**
 * Export SITRA
 *
 * @param {Array} products
 * @param {function} callback
 */
exports.exportSitra = __exportSitra;

/**
 * call APIDAE API in order to update product
 * specified by date last update
 */
exports.exportSitraAuto = __exportSitraAuto;
/**
 * call APIDAE API in order to delete items
 * specified by there specialIdSitra in resquest
 */
exports.removeProductInSitra = __removeProductInSitra;

/**
 * Export SITRA
 *
 * @param {Array} products
 * @param {function} callback
 * @private
 */
function __exportSitra(products, options, callback, finalData) {
  if (products.length) {
    console.log(`${products.length} produits restant à exporter!`);
    var product = products.shift(),
      legalEntities =
        product.legalEntity && product.legalEntity.length
          ? product.legalEntity
          : null,
      optionsEntities = _.clone(options);

    //console.log('Legal entities, = ', legalEntities);

    /*if (product.specialId != "919184") {
      console.log('Product = ', product.specialId);
      __exportSitra(products, options, callback, finalData);
    }*/

    /*if (product.statusImport === 0) {
      console.log('statutImport = 0');
      // product not importable then we skip it and report it
      var msg = 'Objet non importable';

      if (!finalData) {
        finalData = [];
      }

      finalData[product._id] = {
        err: `Erreur : ${msg}`,
        errMessage: msg
      };

      __exportDoReport(products, product, options, callback, finalData);
    } else {*/
    // First of all, export legal entities if needed
    //console.log('-> Export vers APIDAE id : ' + product.specialId, product);
    console.log('-> Export vers APIDAE id : ' + product.specialId);
    __exportEntities(
      product,
      legalEntities,
      optionsEntities,
      function (err, finalDataEntity) {
        if (err) {
          if (!finalData && !finalDataEntity) {
            finalData = [];
            finalData[product._id] = {
              err: 'Error occured...',
              errMessage: err.message
            };
          }

          __exportDoReport(
            products,
            product,
            options,
            callback,
            finalData || finalDataEntity
          );
        } else {
          if (finalDataEntity) {
            product.legalEntity = finalDataEntity;
          }
          // Then get sitra token
          __getSitraToken(
            product,
            null,
            function (err, accessToken, dataSitraToken) {
              // Export product
              __doExport(
                product,
                accessToken,
                options,
                async function (err, finalDataNew) {
                  if (finalDataNew) {
                    if (finalData) {
                      _.merge(finalData, finalDataNew);
                    } else {
                      finalData = finalDataNew;
                    }
                  }

                  if (!err) {
                    // console.log('====== Metadata ======');
                    // metadata for regionDo
                    /* if (
                        /regiondo/i.test(product.importType) &&
                        product.specialIdSitra &&
                        product.metadata
                      ) {
                        let memberMetadata = 3454;
                        let nameMetadata = 'regiondo-idfr';
                        if (process.env.NODE_ENV === 'production') {
                          memberMetadata = 5029;
                          nameMetadata = 'regiondo-paca';
                        }
                        //console.log('export for',nameMetadata,product.metadata);
                        __getSitraToken(
                          product,
                          memberMetadata, // id member for regiondo metadata
                          (err, accessTokenForMetadata, dataSitraToken) => {
                            axios
                              .put(
                                `http://${config.sitra.apiMetaData.host}${config.sitra.apiMetaData.path}${product.specialIdSitra}/${nameMetadata}`,
                                `general=${product.metadata}`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${accessTokenForMetadata}`
                                  }
                                }
                              )
                              .then((data, message) =>
                                // console.log('Done send metadata', data, message)
                                console.log('Done send metadata')
                              )
                              .catch((err) =>
                                console.error('Error metadata', err)
                              );
                          }
                        );
                      }*/
                    // Criteria internal
                    __exportCriteriaInternal(
                      product,
                      accessToken,
                      finalData,
                      function (errCriteriaInternal, finalData) {
                        if (errCriteriaInternal) {
                          console.error(
                            'errCriteriaInternal',
                            errCriteriaInternal
                          );
                        }
                        __exportDoReport(
                          products,
                          product,
                          options,
                          callback,
                          finalData
                        );
                      }
                    );
                  } else {
                    __exportDoReport(
                      products,
                      product,
                      options,
                      callback,
                      finalData
                    );
                  }
                }
              );
            }
          );
        }
      }
    );
    // }
  } else {
    console.log("fin de l'envoi a apidae!");
    if (callback) {
      callback(finalData);
    }
  }
}

function __removeProductInSitra(product, callback) {
  if (product.specialIdSitra) {
    __deleteProductFromSitra(product, function (err, response) {
      if (err) {
        console.log(
          "Error Suppression de l'id APIDAE : " + product.specialIdSitra,
          err
        );
      } else {
        console.log(
          " -> Suppression de l'id APIDAE : " + product.specialIdSitra
        );
      }
      if (callback) {
        callback(err, response);
      }
    });
  } else {
    __deleteProductInMongo(product);
    if (callback) {
      callback('pas dans apidae', null);
    }
  }
}

function __deleteProductInMongo(product) {
  var Product = mongoose.model('Product');

  Product.update(
    {
      importType: product.importType,
      specialId: product.specialId
    },
    {
      $set: { statusImport: 3 },
      $rename: { specialIdSitra: 'oldSpecialIdSitra' }
    }
  ).exec(function (err) {
    if (err) {
      console.log('rename specialIdSitra in oldSpecialIdSitra : ' + err);
    } else {
      console.log(' -> Mongo : update statusImport ' + product.specialId);
    }
  });
}

function __deleteProductFromSitra(product, callback) {
  __getSitraToken(product, null, function (err, accessToken, dataSitraToken) {
    request(
      {
        url: 'http://' + config.sitra.api.host + config.sitra.api.path,
        method: 'PUT',
        formData: {
          mode: 'DEMANDE_SUPPRESSION',
          id: product.specialIdSitra
        },
        json: true,
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      },
      function (error, httpResponse, body) {
        var err = body && body.errorType ? body.errorType : null;
        if (error || err) {
          console.log(
            "Error Suppression APIDAE de l'id : " + product.specialIdSitra,
            err
          );
          callback({ info: err, errMessage: { ...body, ...error } });
        } else {
          __deleteProductInMongo(product);
          callback(null, 'SUPPRESSION_VALIDATION_SKIPPED');
        }
      }
    );
  });
}

/**
 * Export auto
 *
 * @param {String} type
 * @param {function} callback
 */
function __exportSitraAuto(type, options, callback) {
  var today = moment().startOf('day'); // today at midnight
  var Product = mongoose.model('Product');
  var importType = type.toUpperCase();

  // on exporte les pères d'abord
  // HACK
  Product.find({
    importType: importType,
    lastUpdate: { $gte: today.toDate() },
    statusImport: { $in: [1, 2] }
  })
    .sort({ 'linkedObject.isFather': -1 }) // on exporte les pères d'abord
    .exec(function (err, products) {
      if (config.debug && config.debug.logs) {
        console.log('Import type = ', importType);
        console.log('Import lastdate = ', today.toDate());
        console.log('Import products = ', products.length);
      }

      if (err) {
        console.error('Error in exportSitraAuto : ' + err);
      } else {
        const total = products.length;
        console.log(`${total} produit à exporter vers APIDAE`);
        if (total > 0) {
          Product.exportSitra(products, options, function (err2) {
            if (err2 && err2.error400) {
              console.log(`Error in exportSitraAuto : ' ${err2}`);
            }
          });
        }
      }
    });
  if (callback) {
    callback();
  }
}

/**
 * Export entities
 *
 * @param {Array} product
 * @param {Array} legalEntities
 * @param {Object} options
 * @param {function} callback
 * @param {Array} finalData
 * @private
 */
function __exportEntities(
  product,
  legalEntities,
  options,
  callback,
  finalData
) {
  var LegalEntity = mongoose.model('LegalEntity');

  // if legalEntities exists then
  if (legalEntities && legalEntities.length) {
    console.log('exportEntities');
    let legalEntity = legalEntities.shift();
    let productId =
      legalEntity && legalEntity.product ? legalEntity.product : null;
    let legalEntityId =
      _.isObject(productId) && productId._id ? productId._id : productId;

    if (legalEntity.name === undefined || legalEntity.name === 'undefined') {
      legalEntity.name = product.name;
    }

    if (legalEntity.website) {
      legalEntity.website = DataString.cleanArray(legalEntity.website);
    }
    if (legalEntity.email) {
      legalEntity.email = DataString.cleanEmailArray(legalEntity.email);
    }
    if (legalEntity.phone) {
      legalEntity.phone = DataString.cleanPhoneArray(legalEntity.phone);
    }
    if (legalEntity.fax) {
      legalEntity.fax = DataString.cleanPhoneArray(legalEntity.fax);
    }

    if (legalEntityId) {
      LegalEntity.findOne(
        { _id: legalEntityId },
        function (err, legalEntityObj) {
          if (err) {
            console.error('Error find LegalEntity _id : ' + legalEntityId, err);
            __exportEntities(
              product,
              legalEntities,
              options,
              callback,
              finalData
            );
          } else if (!legalEntityObj) {
            if (callback) {
              callback(
                {
                  err: true,
                  message:
                    'Error occured: legalEntity _id=' +
                    legalEntityId +
                    ' not found in SITourisme Database'
                },
                null
              );
            } else {
              __exportEntities(
                product,
                legalEntities,
                options,
                callback,
                finalData
              );
            }
          } else {
            if (
              callback &&
              legalEntityObj.alert &&
              legalEntityObj.alert.length > 0 &&
              !legalEntityObj.alert[0].includes('postal')
            ) {
              return callback(
                {
                  err: true,
                  message:
                    'Non importable pour _id=' +
                    legalEntityId +
                    ', voir les alertes'
                },
                null
              );
            }
            legalEntity.product = legalEntityObj;
            if (finalData) {
              finalData.push(legalEntity);
            } else {
              finalData = [legalEntity];
            }

            // Legal entity already exported
            if (
              legalEntityObj &&
              legalEntityObj.specialIdSitra &&
              legalEntityObj.specialIdSitra.length
            ) {
              __exportEntities(
                product,
                legalEntities,
                options,
                callback,
                finalData
              );
            } else {
              // Create legal entity into sitra with same member as product one
              legalEntityObj.member = legalEntity.member = product.member;

              // Export legal entity
              LegalEntity.exportSitra(
                [legalEntityObj],
                options,
                function (finalDataExport) {
                  if (!finalDataExport || finalDataExport.err) {
                    if (callback && finalDataExport) {
                      callback(
                        {
                          err: true,
                          message: 'Error occured: ' + finalDataExport.err
                        },
                        null
                      );
                    } else {
                      callback(
                        { err: true, message: 'Error occured: unknown' },
                        null
                      );
                    }
                  } else if (!legalEntityObj.specialIdSitra) {
                    if (callback) {
                      callback(null, legalEntityObj);
                    }
                  } else {
                    __exportEntities(
                      product,
                      legalEntities,
                      options,
                      callback,
                      finalData
                    );
                  }
                }
              );
            }
          }
        }
      );
    } else {
      __exportEntities(product, legalEntities, options, callback, finalData);
    }
  } else {
    if (callback) {
      callback(null, finalData);
    }
  }
}

function __exportDoReport(products, product, options, callback, finalData) {
  if (options && options.report) {
    if (finalData && finalData[product.id]) {
      var entityType = '',
        nolink = '';

      const data = finalData[product.id];

      if (options.typeExport === 'LegalEntity') {
        entityType = ' (Entité légale liée à l\'objet "' + product.name + '")';
        nolink = 1;
      }

      let status = data.data && data.data.status ? data.data.status : '';

      let statusImport = 'CREATION';
      switch (product.statusImport) {
        case 1:
          statusImport = 'CREATION';
          break;
        case 2:
          statusImport = 'MODIFICATION';
          break;
        case 3:
          statusImport = 'SUPPRESSION';
          break;
        default:
          statusImport = 'CREATION/MODIFICATION';
          break;
      }

      csvStringify(
        [
          [
            new Date(),
            product.id,
            product.name + entityType,
            status,
            data.specialIdSitra ? data.specialIdSitra : '',
            data.err ? data.err : '',
            data.errMessage ? data.errMessage : '',
            data.errCriteriaInternal ? data.errCriteriaInternal : '',
            data.errCriteriaInternalMessage
              ? data.errCriteriaInternalMessage
              : '',
            nolink,
            product.member,
            options.exportType ? options.exportType : 'MANUEL',
            statusImport
          ]
        ],
        (err, str) => {
          if (err) {
            console.error(err);
          } else if (str) {
            options.report.writeReport(str);
          }
        }
      );
    }
  }

  __exportSitra(products, options, callback, finalData);
}

function __exportCriteriaInternal(product, accessToken, finalData, callback) {
  if (
    product &&
    product.specialIdSitra &&
    product.criteriaInternal &&
    product.criteriaInternal.length &&
    finalData &&
    finalData[product.id]
  ) {
    product = product.toObject();
    // on reset les critères internes
    var criteriaForDelete = {
      id: [product.specialIdSitra],
      criteresInternesASupprimer: _.map(
        configSitraReference.internalCriteria,
        'id'
      )
    };
    request(
      {
        url:
          'http://' +
          config.sitra.apiCriteriaInternal.host +
          config.sitra.apiCriteriaInternal.path,
        method: 'DELETE',
        formData: {
          criteres: JSON.stringify(criteriaForDelete)
        },
        json: true,
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      },
      async () => {
        await sleep(1000);
        // on envoie les critètes internes de la fiche
        var criteriaForAdd = {
          id: [product.specialIdSitra],
          criteresInternesAAjouter: product.criteriaInternal
        };
        request(
          {
            url:
              'http://' +
              config.sitra.apiCriteriaInternal.host +
              config.sitra.apiCriteriaInternal.path,
            method: 'PUT',
            formData: {
              criteres: JSON.stringify(criteriaForAdd)
            },
            json: true,
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          },
          (err, httpResponse, body) => {
            if (err) {
              console.error('Error: ', err);

              _.merge(finalData[product.id], {
                errCriteriaInternal: err,
                errMessageCriteriaInternal: err.message ? err.message : null
              });
              if (callback) {
                callback(err, finalData);
              }
            } else {
              _.merge(finalData[product.id], {
                errCriteriaInternal:
                  body && body.errorType ? body.errorType : null,
                errCriteriaInternalMessage:
                  body && body.message ? body.message : body
              });
              if (callback) {
                callback(null, finalData);
              }
            }
          }
        );
      }
    );
  } else {
    if (callback) {
      callback(null, finalData);
    }
  }
}

function __doExport(product, accessToken, options, callback) {
  var optionsDoExport = options || {},
    Product = optionsDoExport.typeExport
      ? mongoose.model(optionsDoExport.typeExport)
      : mongoose.model('Product'),
    doUpdate =
      product.specialIdSitra && product.specialIdSitra.length > 0
        ? true
        : false,
    unwantedTypes = optionsDoExport.unwantedTypes || null,
    root,
    rootFieldList = [],
    dataTmp,
    finalData = {};

  if (product.specialIdSitra * 1 != product.specialIdSitra) {
    product.specialIdSitra = '';
    doUpdate = false;
  }

  if (config.debug && config.debug.logs) {
    console.log('DoUpdate = ', doUpdate);
    console.log(
      'product Sitra = ',
      product.specialIdSitra,
      product.specialIdSitra.length
    );
  }

  if (product.gatewayStatus === false) {
    csvStringify(
      [
        [
          new Date(),
          product.id,
          product.name,
          '',
          product.specialIdSitra,
          'PASSERELLE_ARRETE',
          'La passerelle a été arrété pour ce contributeur',
          '',
          '',
          '',
          product.member,
          options.exportType ? options.exportType : 'MANUEL',
          product.statusImport
        ]
      ],
      (err, str) => {
        if (err) {
          console.error(err);
        } else if (str) {
          options.report.writeReport(str);
        }
      }
    );
    return callback(null, finalData);
  }

  var PromiseRequestImage = Promise.method(() => {
    return new Promise((resolve, reject) => {
      productImage = [];

      if (product.image && product.image.length) {
        __buildImageDetail(product.image.toObject(), 0, (err, newImage) => {
          if (err) {
            console.error(err);
          }
          productImage = newImage;
          resolve(product);
        });
      } else {
        resolve(product);
      }
    });
  });

  var PromiseRequestFather = Promise.method(() => {
    return new Promise((resolve, reject) => {
      if (product.linkedObject.specialIdFather) {
        Product.findOne(
          {
            specialId: product.linkedObject.specialIdFather,
            importType: product.importType
          },
          (err, docs) => {
            if (err) {
              console.error(err);
            }
            if (docs && docs.specialIdSitra) {
              product.linkedObject.idFatherSitra = docs.specialIdSitra;
              product.linkedObject.idFatherType = docs.type;
              product.linkedObject.idFatherName = docs.name;
            }
            resolve(product);
          }
        );
      } else {
        resolve(product);
      }
    });
  });

  PromiseRequestImage()
    .then(function () {
      return PromiseRequestFather();
    })
    .then(async (product) => {
      // Built root
      root = {
        type: product.type
      };

      console.time('Build');

      // Status (published, hidden...)
      /*dataTmp = __buildState(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }*/

      // Built sub type
      dataTmp = __buildSubType(product, root, rootFieldList, unwantedTypes);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Built name
      dataTmp = __buildName(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Built root - informations
      // Informations - moyensCommunication
      dataTmp = __buildMeanCommunication(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Built root - presentation
      // Short description
      dataTmp = __buildShortDescription(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Description
      dataTmp = __buildDescription(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Descriptifs thématisés
      dataTmp = __buildDescriptifsThematises(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // TypePromoSitra
      dataTmp = __buildTypePromoSitra(
        product,
        root,
        rootFieldList,
        unwantedTypes
      );
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Address
      dataTmp = __buildAddress(product, root, rootFieldList, unwantedTypes);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Business tourism
      dataTmp = __buildBusinessTourism(
        product,
        root,
        rootFieldList,
        unwantedTypes
      );
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Reservation (block is already in process for reservation ent)
      if (product.importType === 'REGIONDO') {
        dataTmp = __buildReservation(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
      }

      // Contact
      dataTmp = __buildContact(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Opening date
      dataTmp = __buildOpeningDate(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Price
      dataTmp = __buildPrice(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Prestation
      dataTmp = __buildPrestation(product, root, rootFieldList, unwantedTypes);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Visit
      //pas de visite en FMA
      if (product.type != 'FETE_ET_MANIFESTATION') {
        dataTmp = __buildVisit(product, root, rootFieldList, unwantedTypes);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
      }

      // Legal entities
      dataTmp = __buildLegalEntity(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Image
      dataTmp = __buildImage(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Multimedia
      dataTmp = __buildMultimedia(product, root, rootFieldList);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      //Objets liés
      dataTmp = __buildLinkedObject(
        product,
        root,
        rootFieldList,
        unwantedTypes
      );
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      // Ski
      dataTmp = __buildSki(product, root, rootFieldList, unwantedTypes);
      if (dataTmp) {
        rootFieldList = dataTmp.rootFieldList;
      }

      rootFieldList = _.uniq(rootFieldList);

      // Aspect (Ne se gère pas comme root et rootFieldList)
      const aspectGroupes = __buildAspectGroupes(product);
      const aspectBusiness = __buildAspectBusiness(product);

      const listFields = ['root'];
      if (aspectGroupes && aspectGroupes.root) {
        listFields.push('aspect.GROUPES.root');
      }
      if (aspectBusiness && aspectBusiness.root) {
        listFields.push('aspect.TOURISME_AFFAIRES.root');
      }

      console.timeEnd('Build');

      // Build sent object
      var formData = {
        fields: JSON.stringify(listFields),
        root: JSON.stringify(root),
        'root.fieldList': JSON.stringify(rootFieldList),
        ...(aspectGroupes && aspectGroupes.root
          ? {
              'aspect.GROUPES.root': JSON.stringify(aspectGroupes.root),
              'aspect.GROUPES.root.fieldList': JSON.stringify(
                aspectGroupes.rootFieldList
              )
            }
          : {}),
        ...(aspectBusiness && aspectBusiness.root
          ? {
              'aspect.TOURISME_AFFAIRES.root': JSON.stringify(
                aspectBusiness.root
              ),
              'aspect.TOURISME_AFFAIRES.root.fieldList': JSON.stringify(
                aspectBusiness.rootFieldList
              )
            }
          : {})
      };

      // Update sitra product
      if (doUpdate) {
        formData.mode = 'MODIFICATION';
        formData.id = product.specialIdSitra;
      }
      // Insert product to sitra
      else {
        formData.mode = 'CREATION';
        formData.type = product.type;
      }
      formData.proprietaireId = product.proprietaireId;

      if (config.debug && config.debug.logs)
        console.log('FormData = ', formData.mode, formData.id);

      // Skip validation GEOTREK, all products
      if (product.importType == 'GEOTREK-API') {
        if (product.type === 'STRUCTURE') {
          formData.skipValidation = 'false';
        } else {
          formData.skipValidation = 'true';
        }
      } else if (product.importType.includes('REGION')) {
        formData.skipValidation = 'false';
      } else {
        formData.skipValidation = 'true';
      }

      var attachmentData;
      if (productImage && productImage.length) {
        var nImage;
        for (nImage = 0; nImage < productImage.length; nImage++) {
          attachmentData = productImage[nImage].data
            ? productImage[nImage].data
            : null;
          if (attachmentData && attachmentData.content) {
            formData['multimedia.illustration-' + (nImage + 1)] = {
              value: attachmentData.content,
              options: {
                filename: attachmentData.filename,
                contentType: attachmentData.contentType
              }
            };
          }
        }
      }

      if (productMultimedia && productMultimedia.length) {
        var nMultimedia;
        for (
          nMultimedia = 0;
          nMultimedia < productMultimedia.length;
          nMultimedia++
        ) {
          attachmentData = productMultimedia[nMultimedia].data
            ? productMultimedia[nMultimedia].data
            : null;
          if (attachmentData && attachmentData.content) {
            formData['multimedia.multimedia-' + (nMultimedia + 1)] = {
              value: attachmentData.content,
              options: {
                filename: attachmentData.filename,
                contentType: attachmentData.contentType
              }
            };
          }
        }
      }

      console.time('Send data apidae');
      console.log('Api PUT = ', config.sitra.api.host, config.sitra.api.path);
      if (config.debug && config.debug.seeData) console.log('PromiseRequestImage > datas = ', formData);
      request(
        {
          url: `https://${config.sitra.api.host}${config.sitra.api.path}`,
          method: 'PUT',
          formData: formData,
          json: true,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        },
        function (err, httpResponse, body) {
          console.timeEnd('Send data apidae');
          //console.log('FormData= ',formData);
          // si erreur http (pas pour une erreur apidae)
          if (err) {
            /*console.error('Error begin', err);
            if (!err) {
              err = body.errorType;
            }*/
            console.error('Error: ', err);

            finalData[product.id] = {
              name: product.name,
              data: null,
              err,
              errMessage: err.message ? err.message : null,
              specialIdSitra: product.specialIdSitra
            };
            if (callback) {
              return callback(err, finalData);
            }
          }

          options.iteration = options.iteration || 0;

          if (config.debug && config.debug.logs)
            console.log('Sending request Do Update = ', doUpdate, body.id);
          // si creation on ajoute et callback
          if (!doUpdate && body && body.id) {
            product.specialIdSitra = body.id;

            finalData[product.id] = {
              name: product.name,
              data: body,
              err: body && body.errorType ? body.errorType : null,
              errMessage: body && body.message ? body.message : body,
              specialIdSitra: product.specialIdSitra
            };

            return Product.update(
              {
                _id: product.id
              },
              {
                $set: {
                  statusImport: 2,
                  specialIdSitra: product.specialIdSitra
                }
              }
            ).exec(async (err) => {
              console.log(
                `change statusImport and add specialIdSitra for ${product.name}`
              );
              return callback(null, finalData);
            });
          } else if (!doUpdate) {
            finalData[product.id] = {
              name: product.name,
              data: null,
              err: 'no message Apidae',
              errMessage: body.message,
              specialIdSitra: 0
            };
            return Product.update(
              {
                _id: product.id
              },
              {
                $set: {
                  statusImport: 4,
                  specialIdSitra: body.message
                }
              }
            ).exec(async (err) => {
              if (config.debug && config.debug.logs)
                console.log('body = ', body);
              console.log(
                `Error on creation - ${body} ${body.message} from Apidae > change statusImport = 3 for ${product.name}`
              );
              return callback(null, finalData);
            });
          } else if (
            doUpdate &&
            body.errorType == 'OBJET_TOURISTIQUE_NOT_FOUND'
          ) {
            // obj supprimé d'APIDAE
            finalData[product.id] = {
              name: product.name,
              data: null,
              err: 'not found on Apidae',
              errMessage: body.message,
              specialIdSitra: 0
            };
            return Product.update(
              {
                _id: product.id
              },
              {
                $set: {
                  statusImport: 4,
                  specialIdSitra: body.message
                }
              }
            ).exec(async (err) => {
              console.log(
                `Error on creation - ${body.message} from Apidae > change statusImport = 4 for ${product.name}`
              );
              return callback(null, finalData);
            });
          }

          // sinon update
          finalData[product.id] = {
            name: product.name,
            data: body,
            specialIdSitra: product.specialIdSitra
          };

          if (config.debug && config.debug.logs)
            console.log(
              'body [.errorType] body = ',
              body,
              `https://${config.sitra.api.host}${config.sitra.api.path} ${accessToken}`
            );

          /*if (body) {
            if (body.errorType) {
              finalData[product.id].err = body.errorType;
            } else if (body.error) {
              finalData[product.id].err = body.error;
            } else if (typeof body === 'string') {
              if (body.toLowerCase().includes('service unavailable')) {
                finalData[product.id].err = 'ERREUR 503';
              } else {
                finalData[product.id].err = 'ECRITURE_BAD_REQUEST';
              }
            } else {
              finalData[product.id].err = 'UNKNOWN ERROR';
            }

            if (body.message) {
              finalData[product.id].errMessage = body.message;
            } else if (body['error_description']) {
              finalData[product.id].errMessage = body['error_description'];
            } else if (typeof body === 'string') {
              finalData[product.id].errMessage = body;
            } else {
              finalData[product.id].errMessage = 'No description';
            }
          }

          // si pas d'erreur ou si on a itérer + d'1 fois on callback
          if (
            product.alert ||
            options.iteration >= 1 ||
            ![
              'ECRITURE_INVALID_JSON_DATA',
              // 'ECRITURE_INVALID_OBJET_TOURISTIQUE_DATA',
              'ERREUR 503',
              'invalid_token',
              'ECRITURE_BAD_REQUEST'
            ].includes(finalData[product.id].err)
          ) {
            options.iteration = 0;
            return callback(null, finalData);
          }

          options.iteration++;

          if (finalData[product.id].err && finalData[product.id].errMessage) {
            var errMsg = finalData[product.id].errMessage;

            console.log('ERR = ', finalData[product.id].err);

            switch (finalData[product.id].err) {
              case 'ECRITURE_INVALID_JSON_DATA':
                if (
                  errMsg.match('not subtype of') 
                  // && process.env.NODE_ENV === 'production'
                ) {
                  console.error('retry because error');
                  var errMsgArr = errMsg.split(' not subtype of '),
                    subtype = errMsgArr[0]
                      ? errMsgArr[0].split('.').reverse()[0]
                      : null;
                  finalData[
                    product.id
                  ].errMessage = `${subtype} not authorized subtype`;
                  console.error(
                    `${finalData[product.id].errMessage} for ${product.name}`
                  );
                  options.unwantedTypes = options.unwantedTypes || [];
                  options.unwantedTypes.push(subtype);
                  return __doExport(product, accessToken, options, callback);
                }
                return callback(null, finalData);
              case 'ERREUR 503':
              case 'invalid_token':
                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                Product.update(
                  {
                    _id: product.id
                  },
                  {
                    $set: {
                      lastUpdate: tomorrow
                    }
                  }
                ).exec(async (err) => {
                  if (err) {
                    console.log("Erreur lors de l'update d'erreur!");
                    return callback(err, finalData);
                  } else {
                    return __doExport(product, accessToken, options, callback);
                  }
                });
                break;
              case 'ECRITURE_BAD_REQUEST':
                // on supprimer les images si poids > 10Mo
                if (errMsg.includes('taille maximum')) {
                  console.log(
                    'on supprime les images trop grosse',
                    product.image.length
                  );
                  product.image = [];
                  return __doExport(product, accessToken, options, callback);
                }
                return callback(err, finalData);
              default:
                return callback(null, finalData);
            }
          } else {
            return callback(null, finalData);
          }*/
          return callback(null, finalData);
        }
      );
    })
    .catch(function (error) {
      console.error(error);
    });
}

function __buildSubType(product, root, rootFieldList, unwantedTypes) {
  var blockCategory,
    blockData = {},
    blockField,
    fieldList = [],
    capacityData,
    capacityDetail,
    err = false;

  switch (product.type) {
    case 'ACTIVITE':
      blockCategory = 'informationsActivite';

      // Sub type
      if (product.subType) {
        blockField = 'activiteType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Category
      if (product.category && product.category.length) {
        blockField = 'categories';

        blockData[blockField] = __buildTypeKeyArray(
          product.category,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.categories');
      // ActivityProvider
      if (product.activityProvider && /regiondo/i.test(product.importType)) {
        blockField = 'prestataireActivites';

        blockData[blockField] = {
          type: product.activityProviderType || 'COMMERCE_ET_SERVICE',
          id: product.activityProvider,
          nom: {
            libelleFr: 'Presta test RegionDO'
          }
        };
        console.log('===================');
        console.log(blockData[blockField]);
        console.log('===================');
      }
      fieldList.push(blockCategory + '.prestataireActivites');
      // Prestation
      if (product.prestation && product.prestation.length) {
        blockField = 'activitesSportives';

        blockData[blockField] = __buildTypeKeyArray(
          product.prestation,
          ['ActiviteSportivePrestation'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.activitesSportives');
      // Prestation
      if (product.prestation && product.prestation.length) {
        blockField = 'activitesCulturelles';

        blockData[blockField] = __buildTypeKeyArray(
          product.prestation,
          ['ActiviteCulturellePrestation'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.activitesCulturelles');
      break;

    case 'COMMERCE_ET_SERVICE':
      blockCategory = 'informationsCommerceEtService';

      // Sub type
      if (product.subType) {
        blockField = 'commerceEtServiceType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Type detail
      if (product.typeDetail && product.typeDetail.length) {
        blockField = 'typesDetailles';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeDetail,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typesDetailles');
      // Provider accreditation
      if (
        product.providerAccreditation &&
        product.providerAccreditation.length
      ) {
        blockField = 'habilitationsPrestataires';

        blockData[blockField] = __buildTypeKeyArray(
          product.providerAccreditation,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      break;

    case 'DEGUSTATION':
      // No sub type
      blockCategory = 'informationsDegustation';

      // typeProduct (correspond au sous-type)
      if (product.typeProduct && product.typeProduct.length) {
        blockField = 'typesProduit';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeProduct,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typesProduit');
      // aopAocIgp
      if (product.aopAocIgp && product.aopAocIgp.length) {
        blockField = 'aopAocIgps';

        blockData['aoc'] = true;
        blockData[blockField] = __buildTypeKeyArray(
          product.aopAocIgp,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.aoc');
      }
      fieldList.push(blockCategory + '.aopAocIgps');
      // Label chart quality
      if (product.labelChartQuality && product.labelChartQuality.length) {
        blockField = 'labelsChartesQualite';

        blockData[blockField] = __buildTypeKeyArray(
          product.labelChartQuality,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.labelsChartesQualite');
      // statusExploitant
      if (product.statusExploitant) {
        blockField = 'statutsExploitant';

        blockData[blockField] = [
          {
            elementReferenceType: 'DegustationStatutExploitant',
            id: product.statusExploitant
          }
        ];
      }
      fieldList.push(blockCategory + '.statutsExploitant');
      break;

    case 'DOMAINE_SKIABLE':
      // No datas imported
      break;

    case 'EQUIPEMENT':
      blockCategory = 'informationsEquipement';

      // Sub type
      if (product.subType) {
        blockField = 'rubrique';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          ['EquipementRubrique'],
          null
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Activity
      if (product.activity && product.activity.length) {
        blockField = 'activites';

        blockData[blockField] = __buildTypeKeyArray(
          _.take(product.activity, 3), // only 3 categories because apidae is shit
          ['EquipementActivite'],
          null
        );
      }
      fieldList.push(blockCategory + '.activites');
      // Itinerary
      if (product.itinerary) {
        blockField = 'itineraire';

        var itinerary = product.itinerary,
          blockItinerary = {};

        if (typeof itinerary.positive === 'number') {
          blockItinerary.denivellationPositive = product.itinerary.positive;
          fieldList.push(
            blockCategory + '.' + blockField + '.denivellationPositive'
          );
        }
        if (typeof itinerary.negative === 'number') {
          blockItinerary.denivellationNegative = product.itinerary.negative;
          fieldList.push(
            blockCategory + '.' + blockField + '.denivellationNegative'
          );
        }
        if (typeof itinerary.distance === 'number') {
          blockItinerary.distance = product.itinerary.distance;
          fieldList.push(blockCategory + '.' + blockField + '.distance');
        }
        if (typeof itinerary.dailyDuration === 'number') {
          blockItinerary.dureeJournaliere = product.itinerary.dailyDuration;
          fieldList.push(
            blockCategory + '.' + blockField + '.dureeJournaliere'
          );
        }
        if (typeof itinerary.altitudeMaximum === 'number') {
          blockItinerary.altitudeMaximum = product.itinerary.altitudeMaximum;
          fieldList.push(blockCategory + '.' + blockField + '.altitudeMaximum');
        }
        if (typeof itinerary.altitudeMoyenne === 'number') {
          blockItinerary.altitudeMoyenne = product.itinerary.altitudeMoyenne;
          fieldList.push(blockCategory + '.' + blockField + '.altitudeMoyenne');
        }
        if (product.passagesDelicats) {
          blockItinerary.passagesDelicats = {
            libelleFr: product.passagesDelicats,
            libelleEn: product.passagesDelicatsEn,
            libelleEs: product.passagesDelicatsEs,
            libelleIt: product.passagesDelicatsIt,
            libelleDe: product.passagesDelicatsDe,
            libelleNl: product.passagesDelicatsNl
          };
        }
        fieldList.push(blockCategory + '.' + blockField + '.passagesDelicats');
        if (itinerary.itineraireType && itinerary.itineraireType.length) {
          blockItinerary.itineraireType = product.itinerary.itineraireType;
          fieldList.push(blockCategory + '.' + blockField + '.itineraireType');
        }
        if (itinerary.itineraireBalise && itinerary.itineraireBalise.length) {
          blockItinerary.itineraireBalise = product.itinerary.itineraireBalise;
          fieldList.push(
            blockCategory + '.' + blockField + '.itineraireBalise'
          );
          if (itinerary.precisionsBalisage) {
            blockItinerary.precisionsBalisage = {
              libelleFr: product.itinerary.precisionsBalisage
            };
            fieldList.push(
              blockCategory + '.' + blockField + '.precisionsBalisage'
            );
          }
        }
        if (itinerary.referencesTopoguides) {
          blockItinerary.referencesTopoguides = {
            libelleFr: product.itinerary.referencesTopoguides,
            libelleEn: product.itinerary.referencesTopoguides,
            libelleEs: product.itinerary.referencesTopoguides,
            libelleIt: product.itinerary.referencesTopoguides,
            libelleDe: product.itinerary.referencesTopoguides,
            libelleNl: product.itinerary.referencesTopoguides
          };
          fieldList.push(
            blockCategory + '.' + blockField + '.referencesTopoguides'
          );
        }
        if (itinerary.referencesCartographiques) {
          blockItinerary.referencesCartographiques = {
            libelleFr: product.itinerary.referencesCartographiques,
            libelleEn: product.itinerary.referencesCartographiques,
            libelleEs: product.itinerary.referencesCartographiques,
            libelleIt: product.itinerary.referencesCartographiques,
            libelleDe: product.itinerary.referencesCartographiques,
            libelleNl: product.itinerary.referencesCartographiques
          };
          fieldList.push(
            blockCategory + '.' + blockField + '.referencesCartographiques'
          );
        }
        if (Object.keys(blockItinerary).length) {
          blockData[blockField] = blockItinerary;
        }
      }
      break;

    case 'FETE_ET_MANIFESTATION':
      blockCategory = 'informationsFeteEtManifestation';

      // Sub type
      if (product.subType) {
        blockField = 'typesManifestation';

        blockData[blockField] = __buildTypeKeyArray(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Category
      if (product.category && product.category.length) {
        blockField = 'categories';

        blockData[blockField] = __buildTypeKeyArray(
          _.take(product.category), // only 3 categories
          null,
          null
          // unwantedTypes // unwantedTypes
        );
        fieldList.push(blockCategory + '.categories');
      }
      // Theme
      if (product.theme && product.theme.length) {
        blockField = 'themes';

        blockData[blockField] = __buildTypeKeyArray(
          product.theme,
          null,
          null
          // unwantedTypes
        );
        fieldList.push(blockCategory + '.themes');
      }
      // Scope
      if (product.scope) {
        blockField = 'portee';

        blockData[blockField] = __buildTypeKey(
          product.scope,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.portee');
      }
      // Generic event
      if (product.genericEvent) {
        blockField = 'evenementGenerique';

        blockData[blockField] = __buildTypeKey(
          _.without(product.genericEvent, 6017),
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.evenementGenerique');
      }
      //nom lieu
      if (product.nomLieu) {
        blockField = 'nomLieu';
        blockData[blockField] = product.nomLieu;
        fieldList.push(blockCategory + '.nomLieu');
      }
      break;

    case 'HEBERGEMENT_COLLECTIF':
      blockCategory = 'informationsHebergementCollectif';

      // Sub type
      if (product.subType) {
        blockField = 'hebergementCollectifType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }

      // Accommodation type
      if (product.typeAccommodation && product.typeAccommodation.length) {
        blockField = 'typesHebergement';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeAccommodation,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typesHebergement');

      // Housing type
      if (product.typeHousing && product.typeHousing.length) {
        blockField = 'typesHabitation';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeHousing,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typesHabitation');

      // Date ranking
      if (product.dateRanking) {
        blockField = 'dateClassement';

        blockData[blockField] = __getDate(product.dateRanking);
      }
      fieldList.push(blockCategory + '.dateClassement');

      // Num ranking
      if (product.numRanking) {
        blockField = 'numeroClassement';

        blockData[blockField] = product.numRanking;
      }
      fieldList.push(blockCategory + '.numeroClassement');

      // Ranking prefectural
      if (product.rankingPrefectural) {
        blockField = 'classementPrefectoral';
        blockData[blockField] = __buildTypeKey(
          product.rankingPrefectural,
          ['HebergementCollectifClassementPrefectoral'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classementPrefectoral');

      // Label
      if (product.label && product.label.length) {
        blockField = 'labels';

        blockData[blockField] = __buildTypeKeyArray(
          product.label,
          ['HebergementCollectifLabel'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.labels');

      // Chain Label
      if (product.chainLabel && product.chainLabel.length) {
        blockField = 'chaineEtLabel';
        blockData[blockField] = __buildTypeKey(
          product.chainLabel,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.chaineEtLabel');

      // Approval
      if (product.approval) {
        blockField = 'agrements';

        blockData[blockField] = __buildTypeKey(
          product.approval,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.agrements');

      // Capacity
      capacityData = {
        capaciteTotale: 0,
        nombreDortoirsGrands: 0,
        nombreDortoirsMoyens: 0,
        nombreAppartements: 0,
        nombreHebergementsMobiliteReduite: 0
      };
      blockField = 'capacite';
      if (product.capacity && product.capacity.detail) {
        capacityDetail = product.capacity.detail;

        if (Number.isInteger(capacityDetail.person)) {
          capacityData.capaciteTotale = capacityDetail.person;
        }
        if (Number.isInteger(capacityDetail.dormitory)) {
          capacityData.nombreDortoirsGrands = capacityDetail.dormitory;
        }
        if (Number.isInteger(capacityDetail.dormitory)) {
          capacityData.nombreDortoirsMoyens = capacityDetail.dormitory;
        }
        if (Number.isInteger(capacityDetail.accomodation)) {
          capacityData.nombreAppartements = capacityDetail.accomodation;
        }
        if (Number.isInteger(capacityDetail.accomodationDisabledAccess)) {
          capacityData.nombreHebergementsMobiliteReduite =
            capacityDetail.accomodationDisabledAccess;
        }
      }
      blockData[blockField] = capacityData;
      _.forEach(capacityData, function (value, key) {
        fieldList.push(blockCategory + '.' + blockField + '.' + key);
      });
      break;

    case 'HEBERGEMENT_LOCATIF':
      blockCategory = 'informationsHebergementLocatif';

      // Sub type
      if (product.subType) {
        blockField = 'hebergementLocatifType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Housing type
      if (product.typeHousing && product.typeHousing.length) {
        blockField = 'typesHabitation';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeHousing,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typesHabitation');
      // Date ranking
      if (product.dateRanking) {
        blockField = 'dateClassement';

        blockData[blockField] = __getDate(product.dateRanking);
      }
      fieldList.push(blockCategory + '.dateClassement');
      // Num ranking
      if (product.numRanking) {
        blockField = 'numeroClassement';

        blockData[blockField] = product.numRanking;
      }
      fieldList.push(blockCategory + '.numeroClassement');
      // Label
      if (product.label && product.label.length) {
        blockField = 'labels';

        blockData[blockField] = __buildTypeKeyArray(
          product.label,
          ['HebergementLocatifLabel'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.labels');
      // Label type
      if (product.labelType) {
        blockField = 'typeLabel';

        blockData[blockField] = __buildTypeKey(
          product.labelType,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.typeLabel');
      // Ranking prefectural
      if (product.rankingPrefectural) {
        blockField = 'classementPrefectoral';

        blockData[blockField] = __buildTypeKey(
          product.rankingPrefectural,
          ['HebergementLocatifClassementPrefectoral'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classementPrefectoral');

      if (
        product.legalInformation &&
        product.legalInformation.numeroRegistration
      ) {
        blockField = 'agrements';
        blockData[blockField] = [
          {
            type: {
              elementReferenceType: 'HebergementLocatifAgrementType',
              id: 5560
            },
            numero: product.legalInformation.numeroRegistration
          }
        ];
      }
      fieldList.push(blockCategory + '.agrements');

      // Capacity
      capacityData = {
        nombrePieces: 0,
        nombreChambres: 0,
        nombreLitsSimples: 0,
        surface: 0,
        capaciteMaximumPossible: 0,
        capaciteHebergement: 0
      };
      blockField = 'capacite';
      if (product.capacity && product.capacity.detail) {
        capacityDetail = product.capacity.detail;
        if (Number.isInteger(capacityDetail.room)) {
          capacityData.nombrePieces = capacityDetail.room;
        }
        if (Number.isInteger(capacityDetail.bedroom)) {
          capacityData.nombreChambres = capacityDetail.bedroom;
        }
        if (Number.isInteger(capacityDetail.bed)) {
          capacityData.nombreLitsSimples = capacityDetail.bed;
        }
        if (Number.isInteger(capacityDetail.surface)) {
          capacityData.surface = capacityDetail.surface;
        }
        if (Number.isInteger(capacityDetail.person)) {
          capacityData.capaciteHebergement = capacityDetail.person;
          capacityData.capaciteMaximumPossible = capacityDetail.person;
        }
      }
      blockData[blockField] = capacityData;
      _.forEach(capacityData, function (value, key) {
        fieldList.push(blockCategory + '.' + blockField + '.' + key);
      });
      break;

    case 'HOTELLERIE':
      blockCategory = 'informationsHotellerie';

      // Sub type
      if (product.subType) {
        blockField = 'hotellerieType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Ranking
      if (product.ranking) {
        blockField = 'classement';

        blockData[blockField] = __buildTypeKey(
          product.ranking,
          ['HotellerieClassement'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classement');
      // Date ranking
      if (product.dateRanking) {
        blockField = 'dateClassement';

        blockData[blockField] = __getDate(product.dateRanking);
      }
      fieldList.push(blockCategory + '.dateClassement');
      // Num ranking
      if (product.numRanking) {
        blockField = 'numeroClassement';

        blockData[blockField] = product.numRanking;
      }
      fieldList.push(blockCategory + '.numeroClassement');
      // Label
      if (product.label && product.label.length) {
        blockField = 'labels';

        blockData[blockField] = __buildTypeKeyArray(
          product.label,
          ['HotellerieLabel'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.labels');
      // Chain
      if (product.chain && product.chain.length) {
        blockField = 'chaines';

        blockData[blockField] = __buildTypeKeyArray(
          product.chain,
          ['HotellerieChaine'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.chaines');
      // Capacity
      capacityData = {
        nombreChambresClassees: 0,
        nombreChambresDeclareesHotelier: 0,
        nombreTotalPersonnes: 0,
        nombreChambresSimples: 0,
        nombreChambresDoubles: 0,
        nombreChambresTwin: 0,
        nombreChambresTriples: 0,
        nombreChambresQuadruples: 0,
        nombreSuites: 0,
        nombreChambresMobiliteReduite: 0
      };
      blockField = 'capacite';
      if (product.capacity && product.capacity.detail) {
        capacityDetail = product.capacity.detail;
        if (Number.isInteger(capacityDetail.classifiedLocation)) {
          capacityData.nombreChambresClassees =
            capacityDetail.classifiedLocation;
        }
        if (Number.isInteger(capacityDetail.bedroom)) {
          capacityData.nombreChambresDeclareesHotelier = capacityDetail.bedroom;
        }
        if (Number.isInteger(capacityDetail.person)) {
          capacityData.nombreTotalPersonnes = capacityDetail.person;
        }
        if (Number.isInteger(capacityDetail.simpleRoom)) {
          capacityData.nombreChambresSimples = capacityDetail.simpleRoom;
        }
        if (Number.isInteger(capacityDetail.doubleRoom)) {
          capacityData.nombreChambresDoubles = capacityDetail.doubleRoom;
        }
        if (Number.isInteger(capacityDetail.twinRoom)) {
          capacityData.nombreChambresTwin = capacityDetail.twinRoom;
        }
        if (Number.isInteger(capacityDetail.tripleRoom)) {
          capacityData.nombreChambresTriples = capacityDetail.tripleRoom;
        }
        if (Number.isInteger(capacityDetail.quadrupleRoom)) {
          capacityData.nombreChambresQuadruples = capacityDetail.quadrupleRoom;
        }
        if (Number.isInteger(capacityDetail.suite)) {
          capacityData.nombreSuites = capacityDetail.suite;
        }
        if (Number.isInteger(capacityDetail.accomodationDisabledAccess)) {
          capacityData.nombreChambresMobiliteReduite =
            capacityDetail.accomodationDisabledAccess;
        }
      }
      blockData[blockField] = capacityData;
      _.forEach(capacityData, function (value, key) {
        fieldList.push(blockCategory + '.' + blockField + '.' + key);
      });
      break;

    case 'HOTELLERIE_PLEIN_AIR':
      blockCategory = 'informationsHotelleriePleinAir';

      // Sub type
      if (product.subType) {
        blockField = 'hotelleriePleinAirType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Ranking
      if (product.ranking) {
        blockField = 'classement';

        blockData[blockField] = __buildTypeKey(
          product.ranking,
          ['HotelleriePleinAirClassement'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classement');
      // Date ranking
      if (product.dateRanking) {
        blockField = 'dateClassement';

        blockData[blockField] = __getDate(product.dateRanking);
      }
      fieldList.push(blockCategory + '.dateClassement');
      // Num ranking
      if (product.numRanking) {
        blockField = 'numeroClassement';

        blockData[blockField] = product.numRanking;
      }
      fieldList.push(blockCategory + '.numeroClassement');
      // Chain
      if (product.chain && product.chain.length) {
        blockField = 'chaines';

        blockData[blockField] = __buildTypeKeyArray(
          product.chain,
          ['HotelleriePleinAirChaine'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.chaines');
      // Label
      if (product.label && product.label.length) {
        blockField = 'labels';

        blockData[blockField] = __buildTypeKeyArray(
          product.label,
          ['HotelleriePleinAirLabel'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.labels');
      // Capacity
      capacityData = {
        nombreEmplacementsClasses: 0,
        nombreEmplacementsDeclares: 0,
        nombreEmplacementsCaravanes: 0,
        nombreEmplacementsCampingCars: 0,
        nombreLocationMobilhomes: 0,
        nombreLocationBungalows: 0,
        nombreEmplacementsResidentiels: 0,
        nombreEmplacementsPassages: 0,
        superficie: 0
      };
      blockField = 'capacite';
      if (product.capacity && product.capacity.detail) {
        capacityDetail = product.capacity.detail;

        /* if (Number.isInteger(capacityDetail.classifiedLocation)) {
					capacityData.nombreEmplacementsClasses =
						capacityDetail.classifiedLocation;
				} */
        if (Number.isInteger(capacityDetail.reportedLocation)) {
          capacityData.nombreEmplacementsDeclares = _.add(
            capacityDetail.location,
            capacityDetail.reportedLocation
          );
        }
        if (Number.isInteger(capacityDetail.caravan)) {
          capacityData.nombreEmplacementsCaravanes = capacityDetail.caravan;
        }
        if (Number.isInteger(capacityDetail.campingCar)) {
          capacityData.nombreEmplacementsCampingCars =
            capacityDetail.campingCar;
        }
        if (Number.isInteger(capacityDetail.mobilHome)) {
          capacityData.nombreLocationMobilhomes = capacityDetail.mobilHome;
        }
        if (Number.isInteger(capacityDetail.bungalow)) {
          capacityData.nombreLocationBungalows = capacityDetail.bungalow;
        }
        /* if (Number.isInteger(capacityDetail.location)) {
					capacityData.nombreEmplacementsResidentiels = capacityDetail.location;
				} */
        if (Number.isInteger(capacityDetail.reportedLocation)) {
          capacityData.nombreEmplacementsPassages =
            capacityDetail.reportedLocation;
        }
        if (Number.isInteger(capacityDetail.surface)) {
          capacityData.superficie = capacityDetail.surface;
        }
      }
      blockData[blockField] = capacityData;
      _.forEach(capacityData, function (value, key) {
        fieldList.push(blockCategory + '.' + blockField + '.' + key);
      });
      break;

    case 'PATRIMOINE_CULTUREL':
      blockCategory = 'informationsPatrimoineCulturel';

      // Sub type
      if (product.subType) {
        blockField = 'patrimoineCulturelType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Category
      if (product.category && product.category.length) {
        blockField = 'categories';

        blockData[blockField] = __buildTypeKeyArray(
          product.category,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Theme
      if (product.theme && product.theme.length) {
        blockField = 'themes';

        blockData[blockField] = __buildTypeKeyArray(
          product.theme,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      break;

    case 'PATRIMOINE_NATUREL':
      blockCategory = 'informationsPatrimoineNaturel';

      // Category (correspond au sous-type pour eux)
      if (product.category && product.category.length) {
        blockField = 'categories';

        blockData[blockField] = __buildTypeKeyArray(
          product.category,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.categories');
      // Ranking
      if (product.ranking) {
        blockField = 'classements';

        blockData[blockField] = __buildTypeKeyArray(
          [product.ranking],
          ['PatrimoineNaturelClassement'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classements');
      break;

    case 'RESTAURATION':
      blockCategory = 'informationsRestauration';

      // label
      if (product.labelRestauration) {
        blockField = 'label';

        blockData[blockField] = __buildTypeKey(
          product.labelRestauration,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.label');

      // speciality
      if (
        product.specialityRestauration &&
        product.specialityRestauration.length
      ) {
        blockField = 'specialites';

        blockData[blockField] = __buildTypeKeyArray(
          product.specialityRestauration,
          ['RestaurationSpecialite'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.specialites');

      // Sub type
      if (product.subType) {
        blockField = 'restaurationType';

        blockData[blockField] = __buildTypeKey(
          product.subType,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Specialty
      if (product.typeSpecialty && product.typeSpecialty.length) {
        blockField = 'specialites';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeSpecialty,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.specialites');
      // Category
      if (product.category && product.category.length) {
        blockField = 'categories';

        blockData[blockField] = __buildTypeKeyArray(
          product.category,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.categories');
      // Chain
      if (product.chain && product.chain.length) {
        blockField = 'chaines';

        blockData[blockField] = __buildTypeKeyArray(
          product.chain,
          ['RestaurationChaine'],
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.chaines');
      // Guide
      if (product.guide && product.guide.length) {
        blockField = 'classementsGuides';

        blockData[blockField] = __buildTypeKeyArray(
          product.guide,
          null,
          unwantedTypes
        );
      }
      fieldList.push(blockCategory + '.classementsGuides');

      // Capacity
      capacityData = {
        nombreSalles: 0,
        nombreSallesClimatisees: 0,
        nombreMaximumCouverts: 0,
        nombreCouvertsTerrasse: 0
      };
      blockField = 'capacite';
      if (product.capacity && product.capacity.detail) {
        capacityDetail = product.capacity.detail;

        if (Number.isInteger(capacityDetail.room)) {
          capacityData.nombreSalles = capacityDetail.room;
        }
        if (Number.isInteger(capacityDetail.airconditionedRoom)) {
          capacityData.nombreSallesClimatisees =
            capacityDetail.airconditionedRoom;
        }
        if (Number.isInteger(capacityDetail.flatware)) {
          capacityData.nombreMaximumCouverts = capacityDetail.flatware;
        }
        if (Number.isInteger(capacityDetail.flatwareTerrace)) {
          capacityData.nombreCouvertsTerrasse = capacityDetail.flatwareTerrace;
        }
      }
      blockData[blockField] = capacityData;
      _.forEach(capacityData, function (value, key) {
        fieldList.push(blockCategory + '.' + blockField + '.' + key);
      });
      break;

    /*case 'SEJOUR_PACKAGE':
      blockCategory = 'informationsSejourPackage';

      // accommodation formule
      if (product.formuleAccommodation) {
        blockField = 'formuleHebergement';

        blockData[blockField] = __buildTypeKeyArray(
          product.formuleAccommodation,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // informationAccommodation
      if (product.informationAccommodation) {
        // nombreJours
        blockField = 'nombreJours';
        blockData[blockField] = __buildTypeKeyArray(
          product.informationAccommodation.numberDays,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);

        // nombreNuits
        blockField = 'nombreNuits';
        blockData[blockField] = __buildTypeKeyArray(
          product.informationAccommodation.numberNights,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      // Accommodation type
      if (product.typeAccommodation && product.typeAccommodation.length) {
        blockField = 'typesHebergement';

        blockData[blockField] = __buildTypeKeyArray(
          product.typeAccommodation,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }

      // Category
      if (product.category && product.category.length) {
        blockField = 'activiteCategories';

        blockData[blockField] = __buildTypeKeyArray(
          product.category,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }

      // Transport
      if (product.transport && product.transport.length) {
        blockField = 'transports';

        blockData[blockField] = __buildTypeKeyArray(
          product.transport,
          null,
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }

      // Prestation activitesSportives
      if (product.prestation && product.prestation.length) {
        blockField = 'activitesSportives';

        blockData[blockField] = __buildTypeKeyArray(
          product.prestation,
          ['ActiviteSportivePrestation'],
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }

      // Prestation activitesCulturelles
      if (product.prestation && product.prestation.length) {
        blockField = 'activitesCulturelles';

        blockData[blockField] = __buildTypeKeyArray(
          product.prestation,
          ['ActiviteCulturellePrestation'],
          unwantedTypes
        );
        fieldList.push(blockCategory + '.' + blockField);
      }
      break;*/

    case 'STRUCTURE':
      // No datas imported
      break;

    default:
      console.error('Undefined type !' + product.type);
      err = true;
      break;
  }

  // Built type
  if (blockCategory && Object.keys(blockData).length && fieldList.length) {
    root[blockCategory] = blockData;
    rootFieldList = rootFieldList.concat(fieldList);
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildName(product, root, rootFieldList) {
  var name = {},
    err = false;

  if (product.name) {
    name.libelleFr = product.name;
  }
  if (product.nameEn) {
    name.libelleEn = product.nameEn;
  }
  if (product.nameEs) {
    name.libelleEs = product.nameEs;
  }
  if (product.nameIt) {
    name.libelleIt = product.nameIt;
  }
  if (product.nameDe) {
    name.libelleDe = product.nameDe;
  }
  if (product.nameNl) {
    name.libelleNl = product.nameNl;
  }

  if (Object.keys(name).length) {
    root.nom = name;
    rootFieldList.push('nom');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildMeanCommunication(product, root, rootFieldList) {
  var moyensCommunication = [],
    legalInformation = {},
    typeSocialNetwork,
    err = true;

  if (product.phone) {
    _.forEach(product.phone, function (phone) {
      moyensCommunication.push({
        type: {
          elementReferenceType: 'MoyenCommunicationType',
          id: 201
        },
        coordonnees: {
          fr: phone
        }
      });
    });
  }

  if (product.fax) {
    _.forEach(product.fax, function (fax) {
      moyensCommunication.push({
        type: {
          elementReferenceType: 'MoyenCommunicationType',
          id: 202
        },
        coordonnees: {
          fr: fax
        }
      });
    });
  }

  if (product.email) {
    _.forEach(product.email, function (email) {
      moyensCommunication.push({
        type: {
          elementReferenceType: 'MoyenCommunicationType',
          id: 204
        },
        coordonnees: {
          fr: email
        }
      });
    });
  }

  if (product.website) {
    _.forEach(_.compact(product.website), function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      moyensCommunication.push({
        type: {
          elementReferenceType: 'MoyenCommunicationType',
          id: 205
        },
        coordonnees: {
          fr: website
        }
      });
    });
  }

  if (product.websiteEn) {
    _.forEach(_.compact(product.websiteEn), function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      var existWebsite = _.find(moyensCommunication, { type: { id: 205 } });
      if (existWebsite) {
        existWebsite.coordonnees.en = website;
      }
    });
  }

  if (product.websiteEs) {
    _.forEach(_.compact(product.websiteEs), function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      var existWebsite = _.find(moyensCommunication, { type: { id: 205 } });
      if (existWebsite) {
        existWebsite.coordonnees.es = website;
      }
    });
  }

  if (product.websiteIt) {
    _.forEach(product.websiteIt, function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      var existWebsite = _.find(moyensCommunication, { type: { id: 205 } });
      if (existWebsite) {
        existWebsite.coordonnees.it = website;
      }
    });
  }

  if (product.websiteDe) {
    _.forEach(_.compact(product.websiteDe), function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      var existWebsite = _.find(moyensCommunication, { type: { id: 205 } });
      if (existWebsite) {
        existWebsite.coordonnees.de = website;
      }
    });
  }

  if (product.websiteNl) {
    _.forEach(_.compact(product.websiteNl), function (website) {
      if (!website.match('^https?://|^//')) {
        website = 'http://' + website;
      }
      var existWebsite = _.find(moyensCommunication, { type: { id: 205 } });
      if (existWebsite) {
        existWebsite.coordonnees.nl = website;
      }
    });
  }

  if (product.socialNetwork) {
    _.forEach(product.socialNetwork, function (socialNetworkData) {
      var socialNetwork = socialNetworkData.url;

      if (!socialNetwork.match('^https?://|^//')) {
        socialNetwork = 'http://' + socialNetwork;
      }

      if (socialNetwork.match(/facebook/i)) {
        typeSocialNetwork = 207;
      } else if (socialNetwork.match(/tripadvisor/i)) {
        typeSocialNetwork = 4000;
      } else if (socialNetwork.match(/twitter/i)) {
        typeSocialNetwork = 3755;
      } else if (socialNetwork.match(/yelp/i)) {
        typeSocialNetwork = 4007;
      } else if (socialNetwork.match(/google/i)) {
        typeSocialNetwork = 3789;
      } else {
        typeSocialNetwork = 205;
      }

      if (typeSocialNetwork) {
        moyensCommunication.push({
          type: {
            elementReferenceType: 'MoyenCommunicationType',
            id: typeSocialNetwork
          },
          coordonnees: {
            fr: socialNetwork
          }
        });
      }
    });
  }

  if (product.legalInformation) {
    if (product.legalInformation.siret) {
      legalInformation.siret = product.legalInformation.siret;
    }
    if (product.legalInformation.apeNafCode) {
      legalInformation.codeApeNaf = product.legalInformation.apeNafCode;
    }
    if (product.legalInformation.modeGestion) {
      legalInformation.modeGestion = __buildTypeKey(
        product.legalInformation.modeGestion
      );
    }
    if (product.legalInformation.rcs) {
      legalInformation.rcs = product.legalInformation.rcs;
    }
    if (product.legalInformation.numeroAgrementLicense) {
      legalInformation.numeroAgrementLicence =
        product.legalInformation.numeroAgrementLicense;
    }
  }
  rootFieldList.push('informations.informationsLegales.siret');
  rootFieldList.push('informations.informationsLegales.codeApeNaf');
  rootFieldList.push('informations.informationsLegales.modeGestion');
  rootFieldList.push('informations.informationsLegales.rcs');
  rootFieldList.push('informations.informationsLegales.numeroAgrementLicence');

  if (moyensCommunication.length) {
    root.informations = {
      moyensCommunication: moyensCommunication
    };
    err = false;
  }
  rootFieldList.push('informations.moyensCommunication');

  if (Object.keys(legalInformation).length) {
    if (!root.informations) {
      root.informations = {};
    }
    root.informations.informationsLegales = legalInformation;

    err = false;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildShortDescription(product, root, rootFieldList) {
  var shortDescription = {},
    err = false;

  if (product.shortDescription) {
    shortDescription.libelleFr = product.shortDescription;
  }
  if (product.shortDescriptionEn) {
    shortDescription.libelleEn = product.shortDescriptionEn;
  }
  if (product.shortDescriptionEs) {
    shortDescription.libelleEs = product.shortDescriptionEs;
  }
  if (product.shortDescriptionIt) {
    shortDescription.libelleIt = product.shortDescriptionIt;
  }
  if (product.shortDescriptionDe) {
    shortDescription.libelleDe = product.shortDescriptionDe;
  }
  if (product.shortDescriptionNl) {
    shortDescription.libelleNl = product.shortDescriptionNl;
  }

  if (Object.keys(shortDescription).length) {
    if (!root.presentation) {
      root.presentation = {};
    }
    root.presentation.descriptifCourt = shortDescription;
  } else {
    err = true;
  }
  rootFieldList.push('presentation.descriptifCourt');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildDescription(product, root, rootFieldList) {
  var description = {},
    err = false;

  if (product.description) {
    description.libelleFr = product.description;
  }
  if (product.descriptionEn) {
    description.libelleEn = product.descriptionEn;
  }
  if (product.descriptionEs) {
    description.libelleEs = product.descriptionEs;
  }
  if (product.descriptionIt) {
    description.libelleIt = product.descriptionIt;
  }
  if (product.descriptionDe) {
    description.libelleDe = product.descriptionDe;
  }
  if (product.descriptionNl) {
    description.libelleNl = product.descriptionNl;
  }

  if (Object.keys(description).length) {
    if (!root.presentation) {
      root.presentation = {};
    }
    root.presentation.descriptifDetaille = description;
  } else {
    err = true;
  }
  rootFieldList.push('presentation.descriptifDetaille');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildDescriptifsThematises(product, root, rootFieldList) {
  var descriptifsThematises = [],
    err = false;

  if (product.ambianceIdSitra) {
    var theme = {
      elementReferenceType: 'DescriptifTheme',
      id: product.ambianceIdSitra
    };
    var description = {};
    description.libelleFr = product.ambianceLibelle;
    if (product.ambianceLibelleEn) {
      description.libelleEn = product.ambianceLibelleEn;
    }
    if (product.ambianceLibelleEs) {
      description.libelleEs = product.ambianceLibelleEs;
    }
    if (product.ambianceLibelleIt) {
      description.libelleIt = product.ambianceLibelleIt;
    }
    if (product.ambianceLibelleDe) {
      description.libelleDe = product.ambianceLibelleDe;
    }
    if (product.ambianceLibelleNl) {
      description.libelleNl = product.ambianceLibelleNl;
    }

    descriptifsThematises.push({
      theme: theme,
      description: description
    });
  }

  if (descriptifsThematises.length) {
    if (!root.presentation) {
      root.presentation = {};
    }
    root.presentation.descriptifsThematises = descriptifsThematises;
    rootFieldList.push('presentation.descriptifsThematises');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildAspectGroupes(product) {
  let descriptionAspectGroupe = {};
  let err = false;
  let root = {};
  const rootFieldList = [];

  // groupe
  if (product.aspectGroupe) {
    descriptionAspectGroupe.libelleFr = product.aspectGroupe;
  }
  if (product.aspectGroupeEn) {
    descriptionAspectGroupe.libelleEn = product.aspectGroupeEn;
  }
  if (product.aspectGroupeEs) {
    descriptionAspectGroupe.libelleEs = product.aspectGroupeEs;
  }
  if (product.aspectGroupeIt) {
    descriptionAspectGroupe.libelleIt = product.aspectGroupeIt;
  }
  if (product.aspectGroupeDe) {
    descriptionAspectGroupe.libelleDe = product.aspectGroupeDe;
  }
  if (product.aspectGroupeNl) {
    descriptionAspectGroupe.libelleNl = product.aspectGroupeNl;
  }

  if (Object.keys(descriptionAspectGroupe).length) {
    root.presentation = {
      descriptifDetaille: descriptionAspectGroupe
    };
  } else {
    err = true;
  }

  rootFieldList.push('presentation.descriptifDetaille');

  return !err ? { root, rootFieldList } : false;
}

function __buildAspectBusiness(product) {
  let descriptifAspectBusiness = {};
  let err = false;
  let root = {};
  const rootFieldList = [];

  // business
  if (product.aspectBusiness) {
    descriptifAspectBusiness.libelleFr = product.aspectBusiness;
  }
  if (product.aspectBusinessEn) {
    descriptifAspectBusiness.libelleEn = product.aspectBusinessEn;
  }
  if (product.aspectBusinessEs) {
    descriptifAspectBusiness.libelleEs = product.aspectBusinessEs;
  }
  if (product.aspectBusinessIt) {
    descriptifAspectBusiness.libelleIt = product.aspectBusinessIt;
  }
  if (product.aspectBusinessDe) {
    descriptifAspectBusiness.libelleDe = product.aspectBusinessDe;
  }
  if (product.aspectBusinessNl) {
    descriptifAspectBusiness.libelleNl = product.aspectBusinessNl;
  }

  if (Object.keys(descriptifAspectBusiness).length) {
    root.presentation = {
      descriptifDetaille: descriptifAspectBusiness
    };
  } else {
    err = true;
  }

  rootFieldList.push('presentation.descriptifDetaille');

  return !err ? { root, rootFieldList } : false;
}

function __buildTypePromoSitra(product, root, rootFieldList, unwantedTypes) {
  var err = false;

  if (product.typePromoSitra && product.typePromoSitra.length) {
    if (!root.presentation) {
      root.presentation = {};
    }
    root.presentation.typologiesPromoSitra = __buildTypeKeyArray(
      product.typePromoSitra,
      null,
      unwantedTypes
    );
  } else {
    err = true;
  }
  rootFieldList.push('presentation.typologiesPromoSitra');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildAddress(product, root, rootFieldList, unwantedTypes) {
  var localization = {},
    address = {},
    geoLocalization = {},
    environment = null,
    err = false;

  if (product.address) {
    if (product.nomLieu) {
      address.nomDuLieu = product.nomLieu;
      rootFieldList.push('localisation.adresse.nomDuLieu');
    }
    if (product.address.address1) {
      address['adresse1'] = product.address.address1.substring(0, 255);
      rootFieldList.push('localisation.adresse.adresse1');
    }
    if (product.address.address2) {
      address['adresse2'] = product.address.address2;
      rootFieldList.push('localisation.adresse.adresse2');
    }
    if (product.address.address3) {
      address['adresse3'] = product.address.address3;
      rootFieldList.push('localisation.adresse.adresse3');
    }
    if (product.address.address4) {
      address['adresse4'] = product.address.adresse4;
      rootFieldList.push('localisation.adresse.adresse4');
    }
    if (product.address.zipcode) {
      address.codePostal = product.address.zipcode;
      rootFieldList.push('localisation.adresse.codePostal');
    }
    if (product.address.cedex) {
      address.cedex = product.address.cedex;
      rootFieldList.push('localisation.adresse.cedex');
    }
    if (product.address.city) {
      address.commune = {
        id: product.address.city
      };
      rootFieldList.push('localisation.adresse.commune');
    }
    if (product.address.bureauDistributeur) {
      address.bureauDistribution = product.address.bureauDistributeur;
      rootFieldList.push('localisation.adresse.bureauDistribution');
    }
  }

  if (product.localization) {
    if (
      product.localization.lat !== null &&
      product.localization.lon !== null
    ) {
      geoLocalization.geoJson = {
        type: 'Point',
        coordinates: [product.localization.lon, product.localization.lat]
      };
      rootFieldList.push('localisation.geolocalisation.geoJson');

      geoLocalization.valide = 'true';
      rootFieldList.push('localisation.geolocalisation.valide');
    }
  }
  if (product.altitude || product.altitude === 0) {
    geoLocalization.altitude = product.altitude;
    rootFieldList.push('localisation.geolocalisation.altitude');
  }
  if (product.landmark || product.landmark === 0) {
    geoLocalization.reperePlan = product.landmark;
    rootFieldList.push('localisation.geolocalisation.reperePlan');
  }
  if (product.geolocalisation) {
    if (product.geolocalisation.altitudeMaximum) {
      geoLocalization.altitudeMaxi = product.geolocalisation.altitudeMaximum;
      rootFieldList.push('localisation.geolocalisation.altitudeMaxi');
    }
    if (product.geolocalisation.altitudeMoyenne) {
      geoLocalization.altitudeMini = product.geolocalisation.altitudeMoyenne;
      rootFieldList.push('localisation.geolocalisation.altitudeMini');
    }
  }
  if (product.complement) {
    geoLocalization.complement = {};
    geoLocalization.complement.libelleFr = product.complement;
    if (product.complementEn) {
      geoLocalization.complement.libelleEn = product.complementEn;
    }
    if (product.complementEn) {
      geoLocalization.complement.libelleEn = product.complementEn;
    }
    if (product.complementEs) {
      geoLocalization.complement.libelleEs = product.complementEs;
    }
    if (product.complementIt) {
      geoLocalization.complement.libelleIt = product.complementIt;
    }
    if (product.complementDe) {
      geoLocalization.complement.libelleDe = product.complementDe;
    }
    if (product.complementNl) {
      geoLocalization.complement.libelleNl = product.complementNl;
    }

    rootFieldList.push('localisation.geolocalisation.complement');
  }
  if (product.perimetreGeographique && product.perimetreGeographique.length) {
    localization.perimetreGeographique = [];
    _.forEach(product.perimetreGeographique, function (item) {
      localization.perimetreGeographique.push({
        id: item
      });
    });
    rootFieldList.push('localisation.perimetreGeographique');
  }

  if (product.environment && product.environment.length) {
    environment = __buildTypeKeyArray(product.environment, null, unwantedTypes);
  }
  rootFieldList.push('localisation.environnements');

  if (Object.keys(address).length) {
    localization.adresse = address;
  }
  if (Object.keys(geoLocalization).length) {
    localization.geolocalisation = geoLocalization;
  }
  if (environment && environment.length) {
    localization.environnements = environment;
  }

  if (Object.keys(localization).length) {
    if (!root.localisation) {
      root.localisation = {};
    }
    root.localisation = localization;
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildBusinessTourism(product, root, rootFieldList) {
  var businessTourism = {},
    arrMeetingRoom = [],
    meetingRoom = {},
    err = false;

  if (
    product.businessTourism &&
    product.businessTourism.tourismeAffairesEnabled === true
  ) {
    businessTourism.tourismeAffairesEnabled = true;
    rootFieldList.push('tourismeAffaires.tourismeAffairesEnabled');

    if (product.businessTourism.nombreSallesReunionEquipees != undefined) {
      businessTourism.nombreSallesReunionEquipees =
        product.businessTourism.nombreSallesReunionEquipees;
    }
    rootFieldList.push('tourismeAffaires.nombreSallesReunionEquipees');

    if (product.businessTourism.capaciteMaxAccueil != undefined) {
      businessTourism.capaciteMaxAccueil =
        product.businessTourism.capaciteMaxAccueil;
    }
    rootFieldList.push('tourismeAffaires.capaciteMaxAccueil');

    if (product.businessTourism.nombreSallesModulables != undefined) {
      businessTourism.nombreSallesModulables =
        product.businessTourism.nombreSallesModulables;
    }
    rootFieldList.push('tourismeAffaires.nombreSallesModulables');

    if (product.businessTourism.sallesHebergement.length) {
      businessTourism.sallesHebergement = [];
      _.forEach(product.businessTourism.sallesHebergement, (item) => {
        businessTourism.sallesHebergement.push({
          elementReferenceType: 'SalleHebergement',
          id: item
        });
      });
    }
    rootFieldList.push('tourismeAffaires.sallesHebergement');

    if (product.businessTourism.sallesRestauration.length) {
      businessTourism.sallesRestauration = [];
      _.forEach(product.businessTourism.sallesRestauration, (item) => {
        businessTourism.sallesRestauration.push({
          elementReferenceType: 'SalleRestauration',
          id: item
        });
      });
    }
    rootFieldList.push('tourismeAffaires.sallesRestauration');

    if (product.businessTourism.sallesEquipement.length) {
      businessTourism.sallesEquipement = [];
      _.forEach(product.businessTourism.sallesEquipement, (item) => {
        businessTourism.sallesEquipement.push({
          elementReferenceType: 'SalleEquipement',
          id: item
        });
      });
    }
    rootFieldList.push('tourismeAffaires.sallesEquipement');

    if (product.businessTourism.sallesEquipeesPour.length) {
      businessTourism.sallesEquipeesPour = [];
      _.forEach(product.businessTourism.sallesEquipeesPour, (item) => {
        businessTourism.sallesEquipeesPour.push({
          elementReferenceType: 'SalleEquipeePour',
          id: item
        });
      });
    }
    rootFieldList.push('tourismeAffaires.sallesEquipeesPour');

    if (product.businessTourism.sallesReunion.length) {
      _.forEach(product.businessTourism.sallesReunion, function (item) {
        if (item.nom) {
          meetingRoom = {};
          meetingRoom.nom = item.nom;
          meetingRoom.description = {};
          meetingRoom.dispositions = [];
          var dimension = item.dimensions ? item.dimensions + ' - ' : '';
          if (item.description) {
            meetingRoom.description.libelleFr = dimension + item.description;
          }
          if (item.descriptionEn) {
            meetingRoom.description.libelleEn = dimension + item.descriptionEn;
          }
          if (item.descriptionEs) {
            meetingRoom.description.libelleEs = dimension + item.descriptionEs;
          }
          if (item.descriptionIt) {
            meetingRoom.description.libelleIt = dimension + item.descriptionIt;
          }
          if (item.descriptionDe) {
            meetingRoom.description.libelleDe = dimension + item.descriptionDe;
          }
          if (item.descriptionNl) {
            meetingRoom.description.libelleNl = dimension + item.descriptionNl;
          }
          if (item.superficie) {
            meetingRoom.superficie = item.superficie;
          }
          if (item.hauteur) {
            meetingRoom.hauteur = item.hauteur;
          }
          if (item.capaciteMax) {
            meetingRoom.capaciteMax = item.capaciteMax;
          }
          if (item.dispositions && item.dispositions.length) {
            _.forEach(item.dispositions, function (disposition) {
              meetingRoom.dispositions.push({
                capacite: disposition.capacite,
                disposition: {
                  elementReferenceType: 'SalleDisposition',
                  id: disposition.disposition
                }
              });
            });
          }
          if (item.lumiereNaturelle) {
            meetingRoom.lumiereNaturelle = item.lumiereNaturelle;
          }

          arrMeetingRoom.push(meetingRoom);
        }
      });

      if (arrMeetingRoom.length) {
        businessTourism.sallesReunion = arrMeetingRoom;
      }
    }
    rootFieldList.push('tourismeAffaires.sallesReunion');
  }

  if (Object.keys(businessTourism).length) {
    if (!root.tourismeAffaires) {
      root.tourismeAffaires = {};
    }
    root.tourismeAffaires = businessTourism;
    rootFieldList.push('tourismeAffaires');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildReservation(product, root, rootFieldList) {
  var arrOrganism = [],
    err = false;

  if (product.reservation) {
    _.forEach(product.reservation, (reservation) => {
      var organism = {
        structureReference: {}
      };
      var organismObservation = {},
        moyensCommunication = [];

      if (reservation.name) {
        organism.structureReference.nom = {
          libelleFr: reservation.name
        };
      }

      // Observation
      if (reservation.description) {
        organismObservation.libelleFr = reservation.description;
      }
      if (reservation.descriptionEn) {
        organismObservation.libelleEn = reservation.descriptionEn;
      }
      if (reservation.descriptionEs) {
        organismObservation.libelleEs = reservation.descriptionEs;
      }
      if (reservation.descriptionIt) {
        organismObservation.libelleIt = reservation.descriptionIt;
      }
      if (reservation.descriptionDe) {
        organismObservation.libelleDe = reservation.descriptionDe;
      }
      if (reservation.descriptionNl) {
        organismObservation.libelleNl = reservation.descriptionNl;
      }
      // If not empty, buitd it
      if (Object.keys(organismObservation).length) {
        organism.observation = organismObservation;
      }
      // Type
      if (reservation.type) {
        organism.type = __buildTypeKey(reservation.type);
      }

      if (reservation.phone) {
        _.forEach(reservation.phone, (phone) => {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 201
            },
            coordonnees: {
              fr: phone
            }
          });
        });
      }
      if (reservation.fax) {
        _.forEach(reservation.fax, (fax) => {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 202
            },
            coordonnees: {
              fr: fax
            }
          });
        });
      }
      if (reservation.email) {
        _.forEach(reservation.email, (email) => {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 204
            },
            coordonnees: {
              fr: email
            }
          });
        });
      }
      if (reservation.website) {
        _.forEach(reservation.website, (website) => {
          if (!website.match('^https?://|^//')) {
            website = `http://${website}`;
          }
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 205
            },
            coordonnees: {
              fr: website
            }
          });
        });
      }

      if (moyensCommunication.length) {
        organism.moyensCommunication = moyensCommunication;
      }

      // Build final arrOrganism object
      if (Object.keys(organism).length) {
        arrOrganism.push(organism);
      }
    });
  }

  if (arrOrganism.length) {
    root.reservation = {
      organismes: arrOrganism
    };
    rootFieldList.push('reservation.organismes');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildContact(product, root, rootFieldList) {
  var arrContact = [],
    err = false;

  _.forEach(product.contact, function (contactData) {
    var contact = {},
      moyensCommunication = [];

    if (contactData) {
      if (contactData.civility) {
        contact.civilite = __buildTypeKey(contactData.civility);
      }
      if (contactData.firstname) {
        contact.prenom = contactData.firstname;
      }
      if (contactData.lastname) {
        contact.nom = contactData.lastname;
      }
      if (contactData.primaryFunction) {
        contact.fonction = __buildTypeKey(contactData.primaryFunction);
      }
      if (contactData.phone) {
        _.forEach(contactData.phone, function (phone) {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 201
            },
            coordonnees: {
              fr: phone
            }
          });
        });
      }
      if (contactData.fax) {
        _.forEach(contactData.fax, function (fax) {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 202
            },
            coordonnees: {
              fr: fax
            }
          });
        });
      }
      if (contactData.email) {
        _.forEach(contactData.email, function (email) {
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 204
            },
            coordonnees: {
              fr: email
            }
          });
        });
      }
      if (contactData.website) {
        _.forEach(contactData.website, function (website) {
          if (!website.match('^https?://|^//')) {
            website = 'http://' + website;
          }
          moyensCommunication.push({
            type: {
              elementReferenceType: 'MoyenCommunicationType',
              id: 205
            },
            coordonnees: {
              fr: website
            }
          });
        });
      }
    }

    if (moyensCommunication.length) {
      contact.moyensCommunication = moyensCommunication;
    }

    if (Object.keys(contact).length) {
      contact.referent = 'false';

      arrContact.push(contact);
    }
  });

  if (arrContact.length) {
    arrContact[0].referent = 'true';
    root.contacts = arrContact;
  } else {
    err = true;
  }
  rootFieldList.push('contacts');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildOpeningDate(product, root, rootFieldList) {
  var openingDate = {},
    openingDateLabel = {},
    arrPeriod = [],
    period = {},
    periodLabel,
    identifiantTemporaire = 100,
    err = false;

  if (product && product.openingDate) {
    // Build opening date label
    if (product.openingDate.description) {
      openingDateLabel.libelleFr = product.openingDate.description;
    }
    if (product.openingDate.descriptionEn) {
      openingDateLabel.libelleEn = product.openingDate.descriptionEn;
    }
    if (product.openingDate.descriptionEs) {
      openingDateLabel.libelleEs = product.openingDate.descriptionEs;
    }
    if (product.openingDate.descriptionIt) {
      openingDateLabel.libelleIt = product.openingDate.descriptionIt;
    }
    if (product.openingDate.descriptionDe) {
      openingDateLabel.libelleDe = product.openingDate.descriptionDe;
    }
    if (product.openingDate.descriptionNl) {
      openingDateLabel.libelleNl = product.openingDate.descriptionNl;
    }

    if (Object.keys(openingDateLabel).length) {
      openingDate.periodeEnClair = openingDateLabel;
      openingDate.periodeEnClairGenerationMode = 'MANUEL';
    }

    if (
      product.openingDate.complementaryOpenings &&
      product.openingDate.complementaryOpenings.length > 0
    ) {
      openingDate.ouverturesComplementaires =
        product.openingDate.complementaryOpenings.map((openingId) => ({
          elementReferenceType: 'OuvertureComplementaire',
          id: openingId
        }));
    }

    // Build periodesOuvertures
    if (
      product.openingDate.periodesOuvertures &&
      product.openingDate.periodesOuvertures.length
    ) {
      //traitement des périodesOuvertures : gestion des doublons, des chevauchements.
      var arrPeriodesOuvertures = __traitePeriode(
        product.openingDate.periodesOuvertures
      );
      _.forEach(arrPeriodesOuvertures, function (periodData) {
        period = {};

        //recurrent
        if (product.openingDate.recurrent) {
          period.tousLesAns = product.openingDate.recurrent;
        }

        if (periodData.dateStart) {
          period.dateDebut = __getDate(periodData.dateStart);
        }
        if (periodData.dateEnd) {
          period.dateFin = __getDate(periodData.dateEnd);
        }

        //jours de la semaine
        if (
          periodData.ouverturesJourDuMois &&
          periodData.ouverturesJourDuMois.length
        ) {
          var horaireOuvertureArr = [],
            horaireFermetureArr = [],
            ouverturesJourDuMois = [];

          _.forEach(periodData.ouverturesJourDuMois, function (jourData) {
            var ouvertureJourDuMois = {};
            ouvertureJourDuMois.jour = jourData.jour;
            ouverturesJourDuMois.push(ouvertureJourDuMois);
            if (jourData.horaireOuverture) {
              horaireOuvertureArr.push(`"${jourData.horaireOuverture}"`);
            }
            if (jourData.horaireFermeture) {
              horaireFermetureArr.push(`"${jourData.horaireFermeture}"`);
            }
          });

          //compare les horaires
          const allEqualhoraireOuverture = horaireOuvertureArr.every(
            (val, i, arr) => val === arr[0]
          );
          const allEqualhoraireFermeture = horaireFermetureArr.every(
            (val, i, arr) => val === arr[0]
          );

          if (allEqualhoraireOuverture && horaireOuvertureArr.length) {
            period.horaireOuverture = __getHoraire(
              periodData.ouverturesJourDuMois[0].horaireOuverture
            );
          }
          if (allEqualhoraireFermeture && horaireFermetureArr.length) {
            period.horaireFermeture = __getHoraire(
              periodData.ouverturesJourDuMois[0].horaireFermeture
            );
          }

          period.ouverturesJournalieres = [];
          period.ouverturesJournalieres = ouverturesJourDuMois;
        }

        if (periodData.horaireOuverture) {
          period.horaireOuverture = __getHoraire(periodData.horaireOuverture);
        }
        if (periodData.horaireFermeture) {
          period.horaireFermeture = __getHoraire(periodData.horaireFermeture);
        }
        if (periodData.type) {
          period.type = periodData.type;
        }

        // Build opening date periodesOuvertures label
        periodLabel = {};
        if (periodData.description) {
          periodLabel.libelleFr = periodData.description;
        }
        if (periodData.descriptionEn) {
          periodLabel.libelleEn = periodData.descriptionEn;
        }
        if (periodData.descriptionEs) {
          periodLabel.libelleEs = periodData.descriptionEs;
        }
        if (periodData.descriptionIt) {
          periodLabel.libelleIt = periodData.descriptionIt;
        }
        if (periodData.descriptionDe) {
          periodLabel.libelleDe = periodData.descriptionDe;
        }
        if (periodData.descriptionNl) {
          periodLabel.libelleNl = periodData.descriptionNl;
        }

        if (Object.keys(periodLabel).length) {
          period.complementHoraire = periodLabel;
        }

        // Build final period object
        if (Object.keys(period).length) {
          period.identifiantTemporaire = identifiantTemporaire++;
          arrPeriod.push(period);
        }
      });

      if (arrPeriod.length) {
        openingDate.periodesOuvertures = arrPeriod;
      }
    }

    if (
      product.openingDate.fermeturesExceptionnelles &&
      product.openingDate.fermeturesExceptionnelles.length
    ) {
      openingDate.fermeturesExceptionnelles = _.map(
        product.openingDate.fermeturesExceptionnelles,
        'dateSpeciale'
      );
    }
  }

  // ouvert toute l'année
  if (product.openingEveryDay) {
    openingDate.ouvertTouteLAnnee = 'OUVERT_TOUTE_L_ANNEE';
    rootFieldList.push('ouverture.ouvertTouteLAnnee');
  }

  if (Object.keys(openingDate).length) {
    root.ouverture = openingDate;
    // on pousse tout les champs pour réinitialiser
    rootFieldList.push('ouverture.periodeEnClair');
    rootFieldList.push('ouverture.periodeEnClairGenerationMode');
    rootFieldList.push('ouverture.ouverturesComplementaires');
    rootFieldList.push('ouverture.periodesOuvertures');
    rootFieldList.push('ouverture.fermeturesExceptionnelles');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildPrice(product, root, rootFieldList) {
  var price = {},
    priceLabel = {},
    meansPayment = [],
    err = false;

  if (product.price) {
    // Build price label
    if (product.price.description) {
      priceLabel.libelleFr = product.price.description;
    }
    if (product.price.descriptionEn) {
      priceLabel.libelleEn = product.price.descriptionEn;
    }
    if (product.price.descriptionEs) {
      priceLabel.libelleEs = product.price.descriptionEs;
    }
    if (product.price.descriptionIt) {
      priceLabel.libelleIt = product.price.descriptionIt;
    }
    if (product.price.descriptionDe) {
      priceLabel.libelleDe = product.price.descriptionDe;
    }
    if (product.price.descriptionNl) {
      priceLabel.libelleNl = product.price.descriptionNl;
    }

    if (typeof product.price.gratuit !== 'undefined') {
      if (product.price.gratuit === true) {
        price.indicationTarif = 'GRATUIT';
        price.gratuit = 'true';
      } else {
        price.indicationTarif = 'PAYANT';
        price.gratuit = 'false';
      }
      rootFieldList.push('descriptionTarif.indicationTarif');
      rootFieldList.push('descriptionTarif.gratuit');
    }

    if (Object.keys(priceLabel).length) {
      price.tarifsEnClair = priceLabel;
      price.tarifsEnClairGenerationMode = 'MANUEL';
      price.complement = priceLabel;
      rootFieldList.push('descriptionTarif.tarifsEnClair');
      rootFieldList.push('descriptionTarif.tarifsEnClairGenerationMode');
      rootFieldList.push('descriptionTarif.complement');
    }

    /*if (price.periodes && price.periodes.length > 0) {
			rootFieldList.push('descriptionTarif.periodes');
		}*/
  }

  if (product.meanPayment && product.meanPayment.length) {
    meansPayment = _.compact(
      product.meanPayment.map((id) => {
        var obj = _.find(configSitraReference.ModePaiement, { id });
        if (obj && obj.labelFr) {
          return {
            id,
            libelleFr: obj.labelFr,
            elementReferenceType: 'ModePaiement'
          };
        }
        return null;
      })
    );
    price.modesPaiement = meansPayment;
    rootFieldList.push('descriptionTarif.modesPaiement');
  }

  if (Object.keys(price).length) {
    root.descriptionTarif = price;
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildPrestation(product, root, rootFieldList, unwantedTypes) {
  var prestation = {},
    err = false;

  if (product.equipment && product.equipment.length) {
    prestation.equipements = __buildTypeKeyArray(
      product.equipment,
      null,
      unwantedTypes
    );
  }

  rootFieldList.push('prestations.equipements');

  if (product.comfort && product.comfort.length) {
    prestation.conforts = __buildTypeKeyArray(
      product.comfort,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.conforts');

  if (product.service && product.service.length) {
    prestation.services = __buildTypeKeyArray(
      product.service,
      null,
      unwantedTypes
    );

    // Accept animal
    if (product.service.includes(687)) {
      prestation.animauxAcceptes = 'ACCEPTES';
    } else {
      prestation.animauxAcceptes = 'NON_ACCEPTES';
    }
  }
  rootFieldList.push('prestations.services');

  if (product.animauxAcceptes && product.animauxAcceptes === 'NON_ACCEPTES') {
    prestation.animauxAcceptes = product.animauxAcceptes;
  }
  rootFieldList.push('prestations.animauxAcceptes');

  if (product.complementAccueil && product.complementAccueil.length) {
    prestation.complementAccueil = {};
    prestation.complementAccueil.libelleFr = product.complementAccueil;
    if (product.complementAccueilEn && product.complementAccueilEn.length) {
      prestation.complementAccueil.libelleEn = product.complementAccueilEn;
    }
    if (product.complementAccueilDe && product.complementAccueilDe.length) {
      prestation.complementAccueil.libelleDe = product.complementAccueilDe;
    }
    if (product.complementAccueilNl && product.complementAccueilNl.length) {
      prestation.complementAccueil.libelleNl = product.complementAccueilNl;
    }
    if (product.complementAccueilIt && product.complementAccueilIt.length) {
      prestation.complementAccueil.libelleIt = product.complementAccueilIt;
    }
    rootFieldList.push('prestations.complementAccueil');
  }

  if (product.adaptedTourism && product.adaptedTourism.length) {
    prestation.tourismesAdaptes = __buildTypeKeyArray(
      product.adaptedTourism,
      null,
      unwantedTypes
    );
    rootFieldList.push('prestations.tourismesAdaptes');
  }

  // ALERTE ! SPECIAL CASE !
  if (product.activity && product.activity.length) {
    var tmp = __buildTypeKeyArray(product.activity, null, unwantedTypes);
    root.informationsPrestataireActivites = {};

    // ActiviteSportivePrestation
    if (_.find(tmp, { elementReferenceType: 'ActiviteSportivePrestation' })) {
      rootFieldList.push('informationsPrestataireActivites.activitesSportives');
      root.informationsPrestataireActivites.activitesSportives = _.filter(tmp, {
        elementReferenceType: 'ActiviteSportivePrestation'
      });
      root.informationsPrestataireActivites.prestataireActivites = true;
    }
    // PrestationActivite
    if (_.find(tmp, { elementReferenceType: 'PrestationActivite' })) {
      rootFieldList.push('prestations.activites');
      prestation.activites = _.filter(tmp, {
        elementReferenceType: 'PrestationActivite'
      });
      root.informationsPrestataireActivites.prestataireActivites = true;
    }
    // ActiviteCulturellePrestation
    if (_.find(tmp, { elementReferenceType: 'ActiviteCulturellePrestation' })) {
      rootFieldList.push(
        'informationsPrestataireActivites.activitesCulturelles'
      );
      root.informationsPrestataireActivites.activitesCulturelles = _.filter(
        tmp,
        { elementReferenceType: 'ActiviteCulturellePrestation' }
      );
      root.informationsPrestataireActivites.prestataireActivites = true;
    }
  }

  if (product.language && product.language.length) {
    prestation.languesParlees = __buildTypeKeyArray(
      product.language,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.languesParlees');

  if (product.languesDocumentation && product.languesDocumentation.length) {
    prestation.languesDocumentation = __buildTypeKeyArray(
      product.languesDocumentation,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.languesDocumentation');

  if (product.typeClient && product.typeClient.length) {
    prestation.typesClientele = __buildTypeKeyArray(
      product.typeClient,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.typesClientele');

  if (product.labelTourismHandicap && product.labelTourismHandicap.length) {
    prestation.labelsTourismeHandicap = __buildTypeKeyArray(
      product.labelTourismHandicap,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.labelsTourismeHandicap');

  if (product.tailleGroupe) {
    prestation.tailleGroupeMin = product.tailleGroupe.min;
    rootFieldList.push('prestations.tailleGroupeMin');
    prestation.tailleGroupeMax = product.tailleGroupe.max;
    rootFieldList.push('prestations.tailleGroupeMax');
  }

  if (
    root.informationsPrestataireActivites &&
    root.informationsPrestataireActivites.prestataireActivites
  ) {
    if (!root.informationsPrestataireActivites) {
      root.informationsPrestataireActivites = {};
    }
    root.informationsPrestataireActivites.prestataireActivites = true;
    rootFieldList.push('informationsPrestataireActivites.prestataireActivites');
  }

  if (product.isActivityProvider) {
    root.informationsPrestataireActivites = {};
    root.informationsPrestataireActivites.prestataireActivites = true;
    rootFieldList.push('informationsPrestataireActivites.prestataireActivites');
    // Prestation
    if (product.prestation && product.prestation.length) {
      root.informationsPrestataireActivites.activitesSportives =
        __buildTypeKeyArray(
          product.prestation,
          ['ActiviteSportivePrestation'],
          unwantedTypes
        );
    }
    rootFieldList.push('informationsPrestataireActivites.activitesSportives');
    // Prestation
    if (product.prestation && product.prestation.length) {
      root.informationsPrestataireActivites.activitesCulturelles =
        __buildTypeKeyArray(
          product.prestation,
          ['ActiviteCulturellePrestation'],
          unwantedTypes
        );
    }
    rootFieldList.push('informationsPrestataireActivites.activitesCulturelles');
  }

  if (Object.keys(prestation).length) {
    root.prestations = prestation;
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildVisit(product, root, rootFieldList, unwantedTypes) {
  var visit = {
      complementVisite: {}
    },
    err = false;

  if (product.visites && product.visites.visitable === true) {
    visit.visitable = true;
    rootFieldList.push('visites.visitable');
  }

  if (product.visitGroup && product.visitGroup.length) {
    visit.prestationsVisitesGroupees = __buildTypeKeyArray(
      product.visitGroup,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.prestationsVisitesGroupees');
  }
  if (product.visitIndividual && product.visitIndividual.length) {
    visit.prestationsVisitesIndividuelles = __buildTypeKeyArray(
      product.visitIndividual,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.prestationsVisitesIndividuelles');
  }
  if (product.visites && product.visites.dureeMoyenneVisiteIndividuelle) {
    visit.dureeMoyenneVisiteIndividuelle =
      product.visites.dureeMoyenneVisiteIndividuelle;
    rootFieldList.push('visites.dureeMoyenneVisiteIndividuelle');
  }
  if (product.visites && product.visites.dureeMoyenneVisiteGroupe) {
    visit.dureeMoyenneVisiteGroupe = product.visites.dureeMoyenneVisiteGroupe;
    rootFieldList.push('visites.dureeMoyenneVisiteGroupe');
  }
  if (product.visitLabel && product.filename[0] !== 'cdt_VisiteGuidee.xml') {
    visit.complementVisite.libelleFr = __buildTypeKeyArray(
      product.visitLabel,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.complementVisite.libelleFr');
  }
  if (
    product.visites &&
    product.visites.languesVisite &&
    product.visites.languesVisite.length
  ) {
    visit.languesVisite = __buildTypeKeyArray(
      product.visites.languesVisite,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.languesVisite');
  }
  if (
    product.visites &&
    product.visites.languesPanneauInformation &&
    product.visites.languesPanneauInformation.length
  ) {
    visit.languesPanneauInformation = __buildTypeKeyArray(
      product.visites.languesPanneauInformation,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.languesPanneauInformation');
  }
  if (
    product.visites &&
    product.visites.languesAudioGuide &&
    product.visites.languesAudioGuide.length
  ) {
    visit.languesAudioGuide = __buildTypeKeyArray(
      product.visites.languesAudioGuide,
      null,
      unwantedTypes
    );
    rootFieldList.push('visites.languesAudioGuide');
  }

  if (Object.keys(visit).length) {
    root.visites = visit;
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildLegalEntity(product, root, rootFieldList) {
  var finalLegalEntity = {},
    err = false;

  if (product.importSubType === 'DRACENIE') {
    finalLegalEntity.informations = {};
    finalLegalEntity.informations.structureGestion = {
      type: 'STRUCTURE',
      id: product.idSitraCity
    };

    rootFieldList.push('informations.structureGestion');
  }

  if (product.legalEntity && product.legalEntity.length) {
    _.forEach(product.legalEntity, function (legalEntityObj) {
      switch (legalEntityObj.type) {
        case 'management':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }

          finalLegalEntity.informations.structureGestion = {
            type: legalEntityObj.product.type,
            id: legalEntityObj.product.specialIdSitra
          };

          rootFieldList.push('informations.structureGestion');
          break;

        case 'gestion':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }

          finalLegalEntity.informations.structureGestion = {
            type: legalEntityObj.product.type,
            id: legalEntityObj.product.specialIdSitra
          };
          rootFieldList.push('informations.structureGestion');
          break;

        case 'information':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }

          finalLegalEntity.informations.structureInformation = {
            type: legalEntityObj.product.type,
            id: legalEntityObj.product.specialIdSitra
          };
          break;

        case 'reservation':
          var resa = product.reservation[0];
          if (!resa) {
            return;
          }
          if (!finalLegalEntity.reservation) {
            finalLegalEntity.reservation = {};
          }
          if (!finalLegalEntity.reservation.organismes) {
            finalLegalEntity.reservation.organismes = [];
          }

          var organismObservation = {};
          var moyensCommunication = [];

          // Observation
          if (resa.description) {
            organismObservation.libelleFr = resa.description;
          }
          if (resa.descriptionEn) {
            organismObservation.libelleEn = resa.descriptionEn;
          }
          if (resa.descriptionEs) {
            organismObservation.libelleEs = resa.descriptionEs;
          }
          if (resa.descriptionIt) {
            organismObservation.libelleIt = resa.descriptionIt;
          }
          if (resa.descriptionDe) {
            organismObservation.libelleDe = resa.descriptionDe;
          }
          if (resa.descriptionNl) {
            organismObservation.libelleNl = resa.descriptionNl;
          }

          if (resa.phone) {
            _.forEach(resa.phone, (phone) => {
              moyensCommunication.push({
                type: {
                  elementReferenceType: 'MoyenCommunicationType',
                  id: 201
                },
                coordonnees: {
                  fr: phone
                }
              });
            });
          }
          if (resa.fax) {
            _.forEach(resa.fax, (fax) => {
              moyensCommunication.push({
                type: {
                  elementReferenceType: 'MoyenCommunicationType',
                  id: 202
                },
                coordonnees: {
                  fr: fax
                }
              });
            });
          }
          if (resa.email) {
            _.forEach(resa.email, (email) => {
              moyensCommunication.push({
                type: {
                  elementReferenceType: 'MoyenCommunicationType',
                  id: 204
                },
                coordonnees: {
                  fr: email
                }
              });
            });
          }
          if (resa.website) {
            _.forEach(resa.website, (website) => {
              if (!website.match('^https?://|^//')) {
                website = `http://${website}`;
              }
              moyensCommunication.push({
                type: {
                  elementReferenceType: 'MoyenCommunicationType',
                  id: 205
                },
                coordonnees: {
                  fr: website
                }
              });
            });
          }

          finalLegalEntity.reservation.organismes.push({
            type: __buildTypeKey(resa.type),
            observation: organismObservation,
            moyensCommunication: moyensCommunication,
            structureReference: {
              type: legalEntityObj.product.type,
              id: legalEntityObj.product.specialIdSitra,
              nom: {
                libelleFr: resa.name
              }
            }
          });
          rootFieldList.push('reservation.organismes');
          break;
        default:
          console.log('Undefined legalEntity type !' + legalEntityObj.type);
          break;
      }
      rootFieldList.push('informations.structureInformation');
    });
  }

  if (Object.keys(finalLegalEntity).length) {
    _.merge(root, finalLegalEntity);
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildImage(product, root, rootFieldList) {
  var arrImage = [],
    err = false;

  if (productImage && productImage.length) {
    _.forEach(productImage, function (imageData, nImage) {
      var image = {},
        name = {},
        legend = {},
        copyright = {},
        arrImageData = [];

      if (imageData.url) {
        arrImageData.push({
          locale: 'fr',
          url: 'MULTIMEDIA#illustration-' + (nImage + 1)
        });
      }
      if (arrImageData.length) {
        image.link = 'false';
        image.type = 'IMAGE';
        image.traductionFichiers = arrImageData;
      }

      // Name
      if (imageData.name) {
        name.libelleFr = imageData.name;
      }
      if (imageData.nameEn) {
        name.libelleEn = imageData.nameEn;
      }
      if (imageData.nameEs) {
        name.libelleEs = imageData.nameEs;
      }
      if (imageData.nameIt) {
        name.libelleIt = imageData.nameIt;
      }
      if (imageData.nameDe) {
        name.libelleDe = imageData.nameDe;
      }
      if (imageData.nameNl) {
        name.libelleNl = imageData.nameNl;
      }

      if (Object.keys(name).length) {
        image.nom = name;
      }

      // Legend
      if (imageData.legend) {
        legend.libelleFr = imageData.legend;
      }
      if (imageData.legendEn) {
        legend.libelleEn = imageData.legendEn;
      }
      if (imageData.legendEs) {
        legend.libelleEs = imageData.legendEs;
      }
      if (imageData.legendIt) {
        legend.libelleIt = imageData.legendIt;
      }
      if (imageData.legendDe) {
        legend.libelleDe = imageData.legendDe;
      }
      if (imageData.legendNl) {
        legend.libelleNl = imageData.legendNl;
      }

      if (Object.keys(legend).length) {
        image.legende = legend;
      }

      // Copyright
      if (imageData.description) {
        copyright.libelleFr = imageData.description;
      }
      if (imageData.descriptionEn) {
        copyright.libelleEn = imageData.descriptionEn;
      }
      if (imageData.descriptionEs) {
        copyright.libelleEs = imageData.descriptionEs;
      }
      if (imageData.descriptionIt) {
        copyright.libelleIt = imageData.descriptionIt;
      }
      if (imageData.descriptionDe) {
        copyright.libelleDe = imageData.descriptionDe;
      }
      if (imageData.descriptionNl) {
        copyright.libelleNl = imageData.descriptionNl;
      }

      if (Object.keys(copyright).length) {
        image.copyright = copyright;
      }

      if (Object.keys(image).length) {
        arrImage.push(image);
      }
    });
  }

  if (arrImage.length) {
    root.illustrations = arrImage;
  } else {
    err = true;
  }
  rootFieldList.push('illustrations');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildMultimedia(product, root, rootFieldList) {
  var arrMultimedia = [],
    err = false;

  if (productMultimedia && productMultimedia.length) {
    _.forEach(productMultimedia, function (multimediaData, nMultimedia) {
      var multimedia = {},
        name = {},
        legend = {},
        copyright = {},
        arrMultimediaData = [],
        sitraType = multimediaData.sitraType || 'DOCUMENT';

      if (multimediaData.url && multimediaData.data) {
        arrMultimediaData.push({
          locale: 'fr',
          url: 'MULTIMEDIA#multimedia-' + (nMultimedia + 1)
        });
      }
      if (arrMultimediaData.length) {
        multimedia.link = 'false';
        multimedia.type = sitraType;
        multimedia.traductionFichiers = arrMultimediaData;
      }

      // Name
      if (multimediaData.name) {
        name.libelleFr = multimediaData.name;
      }
      if (multimediaData.nameEn) {
        name.libelleEn = multimediaData.nameEn;
      }
      if (multimediaData.nameEs) {
        name.libelleEs = multimediaData.nameEs;
      }
      if (multimediaData.nameIt) {
        name.libelleIt = multimediaData.nameIt;
      }
      if (multimediaData.nameDe) {
        name.libelleDe = multimediaData.nameDe;
      }
      if (multimediaData.nameNl) {
        name.libelleNl = multimediaData.nameNl;
      }

      if (Object.keys(name).length) {
        multimedia.nom = name;
      }

      // Legend
      if (multimediaData.legend) {
        legend.libelleFr = multimediaData.legend;
      }
      if (multimediaData.legendEn) {
        legend.libelleEn = multimediaData.legendEn;
      }
      if (multimediaData.legendEs) {
        legend.libelleEs = multimediaData.legendEs;
      }
      if (multimediaData.legendIt) {
        legend.libelleIt = multimediaData.legendIt;
      }
      if (multimediaData.legendDe) {
        legend.libelleDe = multimediaData.legendDe;
      }
      if (multimediaData.legendNl) {
        legend.libelleNl = multimediaData.legendNl;
      }

      if (Object.keys(legend).length) {
        multimedia.legende = legend;
      }

      // Copyright
      if (multimediaData.description) {
        copyright.libelleFr = multimediaData.description;
      }
      if (multimediaData.descriptionEn) {
        copyright.libelleEn = multimediaData.descriptionEn;
      }
      if (multimediaData.descriptionEs) {
        copyright.libelleEs = multimediaData.descriptionEs;
      }
      if (multimediaData.descriptionIt) {
        copyright.libelleIt = multimediaData.descriptionIt;
      }
      if (multimediaData.descriptionDe) {
        copyright.libelleDe = multimediaData.descriptionDe;
      }
      if (multimediaData.descriptionNl) {
        copyright.libelleNl = multimediaData.descriptionNl;
      }

      if (Object.keys(copyright).length) {
        multimedia.copyright = copyright;
      }

      if (Object.keys(multimedia).length) {
        arrMultimedia.push(multimedia);
        rootFieldList.push('multimedias');
      }
    });
  }

  // Add video
  if (product.video && product.video.length) {
    _.forEach(product.video, function (multimediaData, nMultimedia) {
      var multimedia = {},
        name = {},
        legend = {},
        copyright = {},
        arrMultimediaData = [],
        sitraType = 'VIDEO';

      if (multimediaData.url) {
        arrMultimediaData.push({
          locale: 'fr',
          url: multimediaData.url
        });
      }
      if (arrMultimediaData.length) {
        multimedia.link = 'true';
        multimedia.type = sitraType;
        multimedia.traductionFichiers = arrMultimediaData;
      }

      // Name
      if (multimediaData.name) {
        name.libelleFr = multimediaData.name;
      }
      if (multimediaData.nameEn) {
        name.libelleEn = multimediaData.nameEn;
      }
      if (multimediaData.nameEs) {
        name.libelleEs = multimediaData.nameEs;
      }
      if (multimediaData.nameIt) {
        name.libelleIt = multimediaData.nameIt;
      }
      if (multimediaData.nameDe) {
        name.libelleDe = multimediaData.nameDe;
      }
      if (multimediaData.nameNl) {
        name.libelleNl = multimediaData.nameNl;
      }

      if (Object.keys(name).length) {
        multimedia.nom = name;
      }

      // Legend
      if (multimediaData.legend) {
        legend.libelleFr = multimediaData.legend;
      }
      if (multimediaData.legendEn) {
        legend.libelleEn = multimediaData.legendEn;
      }
      if (multimediaData.legendEs) {
        legend.libelleEs = multimediaData.legendEs;
      }
      if (multimediaData.legendIt) {
        legend.libelleIt = multimediaData.legendIt;
      }
      if (multimediaData.legendDe) {
        legend.libelleDe = multimediaData.legendDe;
      }
      if (multimediaData.legendNl) {
        legend.libelleNl = multimediaData.legendNl;
      }

      if (Object.keys(legend).length) {
        multimedia.legende = legend;
      }

      // Copyright
      if (multimediaData.description) {
        copyright.libelleFr = multimediaData.description;
      }
      if (multimediaData.descriptionEn) {
        copyright.libelleEn = multimediaData.descriptionEn;
      }
      if (multimediaData.descriptionEs) {
        copyright.libelleEs = multimediaData.descriptionEs;
      }
      if (multimediaData.descriptionIt) {
        copyright.libelleIt = multimediaData.descriptionIt;
      }
      if (multimediaData.descriptionDe) {
        copyright.libelleDe = multimediaData.descriptionDe;
      }
      if (multimediaData.descriptionNl) {
        copyright.libelleNl = multimediaData.descriptionNl;
      }

      if (Object.keys(copyright).length) {
        multimedia.copyright = copyright;
      }

      if (Object.keys(multimedia).length) {
        arrMultimedia.push(multimedia);
        rootFieldList.push('multimedias');
      }
    });
  }

  // Add KML
  var arrMultimediaDataKml = [];
  if (product.kml && product.kml.length) {
    _.forEach(product.kml, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'fr',
          url: url
        });
      }
    });
  }
  if (product.kmlEn && product.kmlEn.length) {
    _.forEach(product.kmlEn, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'en',
          url: url
        });
      }
    });
  }
  if (product.kmlEs && product.kmlEs.length) {
    _.forEach(product.kmlEs, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'es',
          url: url
        });
      }
    });
  }
  if (product.kmlIt && product.kmlIt.length) {
    _.forEach(product.kmlIt, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'it',
          url: url
        });
      }
    });
  }
  if (product.kmlDe && product.kmlDe.length) {
    _.forEach(product.kmlDe, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'de',
          url: url
        });
      }
    });
  }
  if (product.kmlNl && product.kmlNl.length) {
    _.forEach(product.kmlNl, function (url) {
      if (url) {
        arrMultimediaDataKml.push({
          locale: 'nl',
          url: url
        });
      }
    });
  }
  if (arrMultimediaDataKml && arrMultimediaDataKml.length) {
    var multimediaKml = {
      link: 'true',
      type: 'PLAN',
      nom: {
        libelleFr: 'KML',
        libelleEn: 'KML',
        libelleIt: 'KML'
      },
      traductionFichiers: arrMultimediaDataKml
    };
    arrMultimedia.push(multimediaKml);
  }

  // Add GPX
  var arrMultimediaDataGpx = [];
  if (product.gpx && product.gpx.length) {
    _.forEach(product.gpx, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'fr',
          url: url
        });
      }
    });
  }
  if (product.gpxEn && product.gpxEn.length) {
    _.forEach(product.gpxEn, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'en',
          url: url
        });
      }
    });
  }
  if (product.gpxEs && product.gpxEs.length) {
    _.forEach(product.gpxEs, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'es',
          url: url
        });
      }
    });
  }
  if (product.gpxIt && product.gpxIt.length) {
    _.forEach(product.gpxIt, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'it',
          url: url
        });
      }
    });
  }
  if (product.gpxDe && product.gpxDe.length) {
    _.forEach(product.gpxDe, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'de',
          url: url
        });
      }
    });
  }
  if (product.gpxNl && product.gpxNl.length) {
    _.forEach(product.gpxDe, function (url) {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'nl',
          url: url
        });
      }
    });
  }
  if (arrMultimediaDataGpx && arrMultimediaDataGpx.length) {
    var multimediaGpx = {};
    multimediaGpx.nom = {};
    multimediaGpx.link = 'true';
    multimediaGpx.type = 'PLAN';
    multimediaGpx.traductionFichiers = arrMultimediaDataGpx;
    multimediaGpx.nom.libelleFr = 'GPX';
    arrMultimedia.push(multimediaGpx);
  }

  // Add PDF
  var arrMultimediaDataPdf = [];
  if (product.pdf && product.pdf.length) {
    _.forEach(product.pdf, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'fr',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (product.pdfEn && product.pdfEn.length) {
    _.forEach(product.pdfEn, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'en',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (product.pdfEs && product.pdfEs.length) {
    _.forEach(product.pdfEs, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'es',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (product.pdfIt && product.pdfIt.length) {
    _.forEach(product.pdfIt, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'it',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (product.pdfDe && product.pdfDe.length) {
    _.forEach(product.pdfDe, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'de',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (product.pdfNl && product.pdfNl.length) {
    _.forEach(product.pdfNl, function (multimediaPdf) {
      if (multimediaPdf.url) {
        arrMultimediaDataPdf.push({
          locale: 'nl',
          url: multimediaPdf.url
        });
      }
    });
  }
  if (arrMultimediaDataPdf && arrMultimediaDataPdf.length) {
    var multimediaPdf = {};
    multimediaPdf.nom = {};
    multimediaPdf.link = 'true';
    multimediaPdf.type = 'DOCUMENT';
    multimediaPdf.traductionFichiers = arrMultimediaDataPdf;
    multimediaPdf.nom.libelleFr = 'PDF';
    arrMultimedia.push(multimediaPdf);
  }

  if (arrMultimedia.length) {
    root.multimedias = arrMultimedia;
  } else {
    err = true;
  }
  rootFieldList.push('multimedias');

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildImageDetail(images, nImage, callback) {
  if (images && nImage < images.length) {
    var image = images[nImage];
    if (image.url) {
      /*if (image.url.match(/JPG$/)) {
        // extension to lowercase
        var matchUppercase = image.url.match(/\.[A-Z0-9]{3,4}$/),
          replacement = matchUppercase[0].toLowerCase();

        image.url = image.url.replace(matchUppercase[0], replacement);
      }*/

      var urlObject = Url.parse('https://wsrv.nl/?w=2500&url=' + image.url),
        path = urlObject.path,
        httpProtocol,
        filename = path.replace(new RegExp('^.*/([^/]+)$'), '$1'),
        ext = filename
          .replace(new RegExp('.*\\.([^\\.]+)$'), '$1')
          .toLowerCase(),
        contentType;

      switch (ext) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;

        default:
          contentType = 'image/' + ext;
          break;
      }

      switch (urlObject.protocol) {
        case 'https:':
          httpProtocol = https;
          break;
        default:
          httpProtocol = http;
          break;
      }

      var request = httpProtocol.request(urlObject, function (response) {
        var myBuffer = Buffer.from('');

        response.on('data', function (chunk) {
          myBuffer = Buffer.concat([myBuffer, Buffer.from(chunk, 'binary')]);
        });

        response.on('end', function () {
          if (
            response &&
            response.statusCode &&
            parseInt(response.statusCode) !== 404
          ) {
            images[nImage].data = {
              path: path,
              filename: filename,
              contentType: contentType,
              content: myBuffer
            };
          } else {
            console.log('Image error', urlObject, response.statusCode);
            images.splice(nImage--, 1);
          }

          __buildImageDetail(images, ++nImage, callback);
        });
      });

      // Handle errors
      request.on('error', function (error) {
        console.log('Problem with request : ', error.message);
        __buildImageDetail(images, ++nImage, callback);
      });

      request.end();
    } else {
      __buildImageDetail(images, ++nImage, callback);
    }
  } else {
    if (callback) {
      callback(null, images);
    }
  }
}

function __buildPdfDetail(pdfs, nPdf, callback) {
  if (pdfs && nPdf < pdfs.length) {
    var pdf = pdfs[nPdf];
    if (pdf.url) {
      var urlObject = Url.parse(pdf.url),
        path = urlObject.path,
        filename = path.replace(new RegExp('^.*/([^/]+)$'), '$1'),
        ext = filename
          .replace(new RegExp('.*\\.([^\\.]+)$'), '$1')
          .toLowerCase(),
        contentType;

      switch (ext) {
        default:
          contentType = 'application/' + ext;
          break;
      }

      var request = http.request(urlObject, function (response) {
        var myBuffer = Buffer.from('');

        response.on('data', function (chunk) {
          myBuffer = Buffer.concat([myBuffer, Buffer.from(chunk, 'binary')]);
        });

        response.on('end', function () {
          if (
            response &&
            response.statusCode &&
            parseInt(response.statusCode) !== 404
          ) {
            pdfs[nPdf].data = {
              path: path,
              filename: filename,
              contentType: contentType,
              content: myBuffer
            };
            pdfs[nPdf].sitraType = 'DOCUMENT';
          } else {
            pdfs.splice(nPdf--, 1);
          }

          __buildPdfDetail(pdfs, ++nPdf, callback);
        });
      });

      // Handle errors
      request.on('error', function (error) {
        console.error('Problem with request:', error.message);
        __buildPdfDetail(pdfs, ++nPdf, callback);
      });

      request.end();
    } else {
      __buildPdfDetail(pdfs, ++nPdf, callback);
    }
  } else {
    if (callback) {
      callback(null, pdfs);
    }
  }
}

function __buildLinkedObject(product, root, rootFieldList) {
  var liens = {},
    liensObjetsTouristiquesTypes = [],
    err = false;
  var objetTouristiques = {};

  if (product.linkedObject.idFatherSitra) {
    objetTouristiques.type = 'PROGRAMME_ORGANISATEUR';
    objetTouristiques.objetTouristique = {};
    objetTouristiques.objetTouristique.id = product.linkedObject.idFatherSitra;
    objetTouristiques.objetTouristique.type = product.linkedObject.idFatherType;
    objetTouristiques.objetTouristique.nom = {};
    objetTouristiques.objetTouristique.nom.libelleFr =
      product.linkedObject.idFatherName;
    liensObjetsTouristiquesTypes.push(objetTouristiques);
  }
  if (liensObjetsTouristiquesTypes.length) {
    liens.liensObjetsTouristiquesTypes = liensObjetsTouristiquesTypes;
    rootFieldList.push('liens.liensObjetsTouristiquesTypes');
    root.liens = liens;
  } else {
    err = true;
  }
  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

function __buildSki(product, root, rootFieldList, unwantedTypes) {
  var informationsDomaineSkiable = {},
    err = false;

  if (product.ski) {
    if (product.ski.classification) {
      informationsDomaineSkiable.classification = __buildTypeKey(
        product.ski.classification,
        null,
        unwantedTypes
      );
      rootFieldList.push('informationsDomaineSkiable.classification');
    }
    if (product.ski.nombrePistes) {
      informationsDomaineSkiable.nombrePistes = product.ski.nombrePistes;
      rootFieldList.push('informationsDomaineSkiable.nombrePistes');
    }
    if (product.ski.nombrePistesVertes) {
      informationsDomaineSkiable.nombrePistesVertes =
        product.ski.nombrePistesVertes;
      rootFieldList.push('informationsDomaineSkiable.nombrePistesVertes');
    }
    if (product.ski.nombrePistesBleues) {
      informationsDomaineSkiable.nombrePistesBleues =
        product.ski.nombrePistesBleues;
      rootFieldList.push('informationsDomaineSkiable.nombrePistesBleues');
    }
    if (product.ski.nombrePistesRouges) {
      informationsDomaineSkiable.nombrePistesRouges =
        product.ski.nombrePistesRouges;
      rootFieldList.push('informationsDomaineSkiable.nombrePistesRouges');
    }
    if (product.ski.nombrePistesNoires) {
      informationsDomaineSkiable.nombrePistesNoires =
        product.ski.nombrePistesNoires;
      rootFieldList.push('informationsDomaineSkiable.nombrePistesNoires');
    }
    if (product.ski.nombreKmPiste) {
      informationsDomaineSkiable.nombreKmPiste = product.ski.nombreKmPiste;
      rootFieldList.push('informationsDomaineSkiable.nombreKmPiste');
    }
    if (product.ski.nombreRemonteesMecaniques) {
      informationsDomaineSkiable.nombreRemonteesMecaniques =
        product.ski.nombreRemonteesMecaniques;
      rootFieldList.push(
        'informationsDomaineSkiable.nombreRemonteesMecaniques'
      );
    }
    if (product.ski.nombreTeleskis) {
      informationsDomaineSkiable.nombreTeleskis = product.ski.nombreTeleskis;
      rootFieldList.push('informationsDomaineSkiable.nombreTeleskis');
    }
    if (product.ski.nombreTelesieges) {
      informationsDomaineSkiable.nombreTelesieges =
        product.ski.nombreTelesieges;
      rootFieldList.push('informationsDomaineSkiable.nombreTelesieges');
    }
    if (product.ski.nombreTelecabines) {
      informationsDomaineSkiable.nombreTelecabines =
        product.ski.nombreTelecabines;
      rootFieldList.push('informationsDomaineSkiable.nombreTelecabines');
    }
    if (product.ski.nombreTelepheriques) {
      informationsDomaineSkiable.nombreTelepheriques =
        product.ski.nombreTelepheriques;
      rootFieldList.push('informationsDomaineSkiable.nombreTelepheriques');
    }
    if (product.ski.nombreAutresRemontees) {
      informationsDomaineSkiable.nombreAutresRemontees =
        product.ski.nombreAutresRemontees;
      rootFieldList.push('informationsDomaineSkiable.nombreAutresRemontees');
    }
    if (product.ski.geolocalisation) {
      root.geolocalisation = product.ski.geolocalisation;
      rootFieldList.push('localisation.geolocalisation.altitudeMini');
      rootFieldList.push('localisation.geolocalisation.altitudeMaxi');
    }
  }

  if (informationsDomaineSkiable && informationsDomaineSkiable.nombrePistes) {
    if (!root.informationsDomaineSkiable) {
      root.informationsDomaineSkiable = {};
    }
    root.informationsDomaineSkiable = informationsDomaineSkiable;
  } else {
    err = true;
  }

  return !err
    ? {
        root: root,
        rootFieldList: rootFieldList
      }
    : false;
}

function __initSitraReferencePerId(configSitraReference) {
  var data = {};

  _.forEach(
    configSitraReference,
    function (configSitraReferencePerCategory, category) {
      _.forEach(
        configSitraReferencePerCategory,
        function (configSitraReferenceData) {
          data[configSitraReferenceData.id] = {
            category: category
          };
        }
      );
    }
  );

  return data;
}

function __getTypeFromSitraId(id) {
  return configSitraReferencePerId[id]
    ? configSitraReferencePerId[id].category
    : null;
}

function __buildTypeKey(id, wantedTypes, unwantedTypes) {
  var typeKey = null;

  if (_.isArray(id)) {
    id = id.shift();
  }

  var type = __getTypeFromSitraId(id);
  if (
    type &&
    (!wantedTypes || wantedTypes.indexOf(type) > -1) &&
    (!unwantedTypes || unwantedTypes.indexOf(type) === -1)
  ) {
    typeKey = {
      elementReferenceType: type,
      id: id
    };
  }

  return typeKey;
}

function __buildTypeKeyArray(arrId, wantedTypes, unwantedTypes) {
  var block = [],
    type;

  if (!_.isArray(arrId)) {
    arrId = [arrId];
  }

  if (arrId && arrId.length) {
    arrId.forEach(function (id) {
      type = __getTypeFromSitraId(id);
      if (
        type &&
        (!wantedTypes || wantedTypes.indexOf(type) > -1) &&
        (!unwantedTypes || unwantedTypes.indexOf(type) === -1)
      ) {
        block.push({
          elementReferenceType: type,
          id: id
        });
      }
    });
  }

  return block;
}

// get state (published or hidden)
function __buildState(product, root, rootFieldList) {
  if (product.state) {
    root.state = product.state;
    rootFieldList.push('state');
    return { root, rootFieldList };
  }
  return null;
}

function __getSitraToken(product, member, callback) {
  console.log(
    '__getSitraToken for member / ProductMember =',
    member,
    product.member
  );

  var memberId = config.memberId,
    //var memberId = member || (product.member ? product.member : '-'),
    configAuth = config.sitra.auth.accessPerMemberId,
    access =
      configAuth && configAuth[memberId]
        ? configAuth[memberId]
        : configAuth['-'],
    now = new Date().getTime(),
    expire = now + 15 * 60 * 1000,
    options = {
      host: config.sitra.auth.host,
      path: config.sitra.auth.path,
      port: '80',
      auth: access.user + ':' + access.pass,
      headers: {
        Accept: 'application/json'
      }
    };

  console.log('send for id =>', memberId, access.user, access.pass);

  if (tokenPerMemberId[memberId] && tokenPerMemberId[memberId].expire > now) {
    if (callback) {
      callback(
        null,
        tokenPerMemberId[memberId].accessToken,
        tokenPerMemberId[memberId].data
      );
    }
  } else {
    var req = http.request(options, function (response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        var data;

        try {
          data = JSON.parse(str);
        } catch (err) {
          data = null;
        }

        var accessToken = data ? data.access_token : null;

        tokenPerMemberId[memberId] = {
          accessToken: accessToken,
          data: data,
          expire: expire
        };
        if (callback) {
          callback(null, accessToken, data);
        }
      });
    });

    req.end();
  }
}

function __getDate(date) {
  return moment(date).format('YYYY-MM-DD');
}

function __getHoraire(date) {
  return moment(date).format('HH:mm:ss');
}

function __traitePeriode(arrPeriodes) {
  var dateStartPrec = null,
    dateEndPrec = null,
    descriptionFinal = '',
    arrPeriodesFinal = [];

  _.forEach(arrPeriodes, function (value, key) {
    var dateStart = value.dateStart ? value.dateStart : null;
    var dateEnd = value.dateEnd ? value.dateEnd : null;
    var horaireO = value.horaireOuverture ? value.horaireOuverture : null;
    var horaireF = value.horaireFermeture ? value.horaireFermeture : null;
    var description = value.description ? value.description : '';

    //même date : horaires différents
    if (
      dateStart &&
      '"' + dateStart + '"' == '"' + dateStartPrec + '"' &&
      dateEnd &&
      '"' + dateEnd + '"' == '"' + dateEndPrec + '"'
    ) {
      if (description) descriptionFinal += description;
      if (horaireO) {
        descriptionFinal += ' - Ouverture : ' + __getHoraire(horaireO);
      }
      if (horaireF) {
        descriptionFinal += ' - Fermeture : ' + __getHoraire(horaireF);
      }
      descriptionFinal += '\r\n';
    } else {
      if (descriptionFinal) {
        var descriptionFinal2 = '';
        if (arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture) {
          descriptionFinal2 =
            ' - Ouverture : ' +
            __getHoraire(
              arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture
            );
          arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture = null;
        }
        if (arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture) {
          descriptionFinal2 =
            ' - Fermeture : ' +
            __getHoraire(
              arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture
            );
          arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture = null;
        }
        if (descriptionFinal2) {
          descriptionFinal = descriptionFinal2 + '\r\n' + descriptionFinal;
        }
        arrPeriodesFinal[arrPeriodesFinal.length - 1].description =
          descriptionFinal;
      }
      arrPeriodesFinal.push(value);
      descriptionFinal = '';
    }

    dateStartPrec = dateStart;
    dateEndPrec = dateEnd;
  });
  return arrPeriodesFinal;
}
