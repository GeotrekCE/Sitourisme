'use strict';

//const { exit } = require('process');

const _ = require('lodash'),
  path = require('path'),
  moment = require('moment'),
  http = require('http'),
  https = require('https'),
  request = require('request'),
  Promise = require('bluebird'),
  //mongoose = require('mongoose'),
  Url = require('url'),
  //DataString = require(path.resolve('./library/data/manipulate.js')),
  config = require(path.resolve('./config/config.js')),
  configSitraReference = require(path.resolve('./config/configSitraReference.js')),
  chalk = require('chalk'),
  fetch = require("node-fetch")
  //fxp = require("fast-xml-parser")

class Apidae
{
  constructor(entity)
  {
    this.productImage = null
    this.productMultimedia = null
    this.gpxData = null
    this.tokenPerMemberId = {}
    this.configSitraReferencePerId = this.__initSitraReferencePerId(require(path.resolve('./config/configSitraReference.js')))
  }

  __initSitraReferencePerId(configSitraReference)
  {
    let data = {};
  
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
  
  __getTypeFromSitraId(id, context)
    {
    return context.configSitraReferencePerId[id]
      ? context.configSitraReferencePerId[id].category
      : null;
  }

  __buildTypeKey(id, wantedTypes, unwantedTypes, context)
  {
    let typeKey = null;
  
    if (_.isArray(id)) {
      id = id.shift();
    }
    let type = context.__getTypeFromSitraId(id, context);

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

  buildTypeKeyArray(arrId, wantedTypes, unwantedTypes, context)
  {
    let block = [],
      type;
  
    if (!_.isArray(arrId)) {
      arrId = [arrId];
    }
  
    if (arrId && arrId.length) {
      arrId.forEach(function (id) {
        type = context.__getTypeFromSitraId(id, context);
        
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

  __getSitraToken(context, product, member, callback) {
    const me = context,
      memberId = config.memberId,
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
  
    //console.log('send for id =>', memberId, access.user, access.pass, 'tokenMember = ',me.tokenPerMemberId);
  
    if (me.tokenPerMemberId[memberId] && me.tokenPerMemberId[memberId].expire > now) {
      if (callback) {
        callback(me.tokenPerMemberId[memberId].accessToken);
      }
    } else {
      let req = http.request(options, function (response) {
        let str = '';
        response.on('data', function (chunk) {
          str += chunk;
        });
  
        response.on('end', function () {
          let data;
  
          try {
            data = JSON.parse(str);
          } catch (err) {
            data = null;
          }
  
          const accessToken = data ? data.access_token : null;

          me.tokenPerMemberId[memberId] = {
            accessToken: accessToken,
            data: data,
            expire: expire
          };
          console.log('MemberId =',me.tokenPerMemberId, memberId);
                    
          if (callback) {
            callback(accessToken);
          }
        });
      });

      req.on('error', function (err) {
        console.error('Request error:', err);
        if (err.code === 'ENOTFOUND') {
          console.error('DNS lookup failed for:', options.hostname || options.host);
        }
        if (callback) {
          setTimeout(() => {
            me.__getSitraToken(me, product, member, callback);
          }, 15000);
        }
      });
  
      req.end();
    }
  }

  __getDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  /*__getHoraire(date) {
    return moment(date).format('HH:mm:ss');
  }*/

  __traitePeriode(arrPeriodes) {
    let dateStartPrec = null,
      dateEndPrec = null,
      descriptionFinal = '',
      arrPeriodesFinal = [];
  
    _.forEach(arrPeriodes, function (value, key) {
      const dateStart = value.dateStart ? value.dateStart : null,
        dateEnd = value.dateEnd ? value.dateEnd : null,
        horaireO = value.horaireOuverture ? value.horaireOuverture : null,
        horaireF = value.horaireFermeture ? value.horaireFermeture : null,
        description = value.description ? value.description : '';
  
      //même date : horaires différents
      if (
        dateStart &&
        '"' + dateStart + '"' == '"' + dateStartPrec + '"' &&
        dateEnd &&
        '"' + dateEnd + '"' == '"' + dateEndPrec + '"'
      ) {
        if (description) descriptionFinal += description;
        if (horaireO) {
          //descriptionFinal += ' - Ouverture : ' + this.__getHoraire(horaireO);
          descriptionFinal += ' - Ouverture : ' + horaireO;
        }
        if (horaireF) {
          //descriptionFinal += ' - Fermeture : ' + this.__getHoraire(horaireF);
          descriptionFinal += ' - Fermeture : ' + horaireF;
        }
        descriptionFinal += '\r\n';
      } else {
        if (descriptionFinal) {
          let descriptionFinal2 = '';
          if (arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture) {
            /*descriptionFinal2 =
              ' - Ouverture : ' +
              this.__getHoraire(
                arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture
              );*/
            descriptionFinal2 = ' - Ouverture : ' + arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture;
            arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireOuverture = null;
          }
          if (arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture) {
            /*descriptionFinal2 =
              ' - Fermeture : ' +
              this.__getHoraire(
                arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture
              );*/
            descriptionFinal2 = ' - Fermeture : ' + arrPeriodesFinal[arrPeriodesFinal.length - 1].horaireFermeture;
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

  // __exportEntities(product, legalEntities, options, callback, finalData) {
  //     //TODO CGT
  //   // const legalEntityServer = new EntityServer('LegalEntity', ProductSchema);
  //   // const LegalEntity = legalEntityServer.getModel(); 
  //   var LegalEntity = mongoose.model('LegalEntity');
  
  //   // if legalEntities exists then
  //   // TODO LEGALENTITY
  //   if (legalEntities && legalEntities.length) {
      
  //     let legalEntity = legalEntities.shift();
  //     let productId =
  //       legalEntity && legalEntity.product ? legalEntity.product : null;
  //     let legalEntityId =
  //       _.isObject(productId) && productId._id ? productId._id : productId;
  
  //     if (legalEntity.name === undefined || legalEntity.name === 'undefined') {
  //       legalEntity.name = product.name;
  //     }
  
  //     if (legalEntity.website) {
  //       legalEntity.website = DataString.cleanArray(legalEntity.website);
  //     }
  //     if (legalEntity.email) {
  //       legalEntity.email = DataString.cleanEmailArray(legalEntity.email);
  //     }
  //     if (legalEntity.phone) {
  //       legalEntity.phone = DataString.cleanPhoneArray(legalEntity.phone);
  //     }
  //     if (legalEntity.fax) {
  //       legalEntity.fax = DataString.cleanPhoneArray(legalEntity.fax);
  //     }
  
  //     if (legalEntityId) {
  //       LegalEntity.findOne(
  //         { _id: legalEntityId },
  //         function (err, legalEntityObj) {
  //           if (err) {
  //             console.error('Error find LegalEntity _id : ' + legalEntityId, err);
  //             this.__exportEntities(
  //               product,
  //               legalEntities,
  //               options,
  //               callback,
  //               finalData
  //             );
  //           } else if (!legalEntityObj) {
  //             if (callback) {
  //               callback(
  //                 {
  //                   err: true,
  //                   message:
  //                     'Error occured: legalEntity _id=' +
  //                     legalEntityId +
  //                     ' not found in SITourisme Database'
  //                 },
  //                 null
  //               );
  //             } else {
  //               this.__exportEntities(
  //                 product,
  //                 legalEntities,
  //                 options,
  //                 callback,
  //                 finalData
  //               );
  //             }
  //           } else {
  //             if (
  //               callback &&
  //               legalEntityObj.alert &&
  //               legalEntityObj.alert.length > 0 &&
  //               !legalEntityObj.alert[0].includes('postal')
  //             ) {
  //               return callback(
  //                 {
  //                   err: true,
  //                   message:
  //                     'Non importable pour _id=' +
  //                     legalEntityId +
  //                     ', voir les alertes'
  //                 },
  //                 null
  //               );
  //             }
  //             legalEntity.product = legalEntityObj;
  //             if (finalData) {
  //               finalData.push(legalEntity);
  //             } else {
  //               finalData = [legalEntity];
  //             }
  
  //             // Legal entity already exported
  //             if (
  //               legalEntityObj &&
  //               legalEntityObj.specialIdSitra &&
  //               legalEntityObj.specialIdSitra.length
  //             ) {
  //               this.__exportEntities(
  //                 product,
  //                 legalEntities,
  //                 options,
  //                 callback,
  //                 finalData
  //               );
  //             } else {
  //               // Create legal entity into sitra with same member as product one
  //               legalEntityObj.member = legalEntity.member = product.member;
  
  //               // Export legal entity
  //               LegalEntity.exportSitra(
  //                 [legalEntityObj],
  //                 options,
  //                 function (finalDataExport) {
  //                   if (!finalDataExport || finalDataExport.err) {
  //                     if (callback && finalDataExport) {
  //                       callback(
  //                         {
  //                           err: true,
  //                           message: 'Error occured: ' + finalDataExport.err
  //                         },
  //                         null
  //                       );
  //                     } else {
  //                       callback(
  //                         { err: true, message: 'Error occured: unknown' },
  //                         null
  //                       );
  //                     }
  //                   } else if (!legalEntityObj.specialIdSitra) {
  //                     if (callback) {
  //                       callback(null, legalEntityObj);
  //                     }
  //                   } else {
  //                     this.__exportEntities(
  //                       product,
  //                       legalEntities,
  //                       options,
  //                       callback,
  //                       finalData
  //                     );
  //                   }
  //                 }
  //               );
  //             }
  //           }
  //         }
  //       );
  //     } else {
  //       this.__exportEntities(product, legalEntities, options, callback, finalData);
  //     }
  //   } else {
  //     if (callback) {
  //       callback(null, finalData);
  //     }
  //   }
  // }
  
  __doExport(model, product, accessToken, options, callback) {
    let me = this,
      optionsDoExport = options || {},
      Product = model,
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
        product.specialIdSitra.length,
        model.modelName
      );
    }
  
    let PromiseRequestImage = Promise.method(() => {
      return new Promise((resolve, reject) => {
        me.productImage = [];
  
        if (product.image && product.image.length) {
          me.__buildImageDetail(product.image.toObject(), 0, (err, newImage) => {
            if (err) {
              console.error(err);
            }
            me.productImage = newImage;
            resolve(product);
          });
        } else {
          resolve(product);
        }
      });
    });

    const PromiseRequestGpx = () => {
      me.gpxData = []
      return Promise.all(
        (product.gpx || [])
          .filter(Boolean)
          .map(async (url, nPlan) => {
            const res = await fetch(url)
            if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
            const xml = await res.text()

            /*const parser = new fxp.XMLParser()
            const gpx = parser.parse(xml)*/

            me.gpxData.push({
              data: {
                path: url,
                filename: url.replace(/.*\/([^/]+)$/, '$1'),
                contentType: 'application/gpx+xml',
                content: xml
              }
            })
          })
      )
    }
  
    const PromiseRequestFather = async () => {
      if (product.linkedObject.specialIdFather) {
        try {
          const docs = await Product.findOne({
            specialId: product.linkedObject.specialIdFather,
            importType: product.importType
          })

          if (docs && docs.specialIdSitra) {
            product.linkedObject.idFatherSitra = docs.specialIdSitra
            product.linkedObject.idFatherType = docs.type
            product.linkedObject.idFatherName = docs.name
          }
        } catch (err) {
          console.error(err)
        }
      }
      return product;
    }

    PromiseRequestImage()
      .then(() => PromiseRequestGpx())
      .then(() =>PromiseRequestFather())
      .then(async (product) => {
        // Built root
        root = {
          type: product.type
        };
  
        //console.time('Build');
  
        // Status (published, hidden...)
        /*dataTmp = this.__buildState(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }*/
  
        // Built sub type
        dataTmp = me.__buildSubType(product, root, rootFieldList, unwantedTypes, me);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Built name
        dataTmp = me.__buildName(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Built root - informations
        // Informations - moyensCommunication
        dataTmp = me.__buildMeanCommunication(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Built root - presentation
        // Short description
        dataTmp = me.__buildShortDescription(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Description
        dataTmp = me.__buildDescription(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Descriptifs thématisés
        dataTmp = me.__buildDescriptifsThematises(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // TypePromoSitra
        dataTmp = me.__buildTypePromoSitra(
          product,
          root,
          rootFieldList,
          unwantedTypes
        );
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Address
        dataTmp = me.__buildAddress(product, root, rootFieldList, unwantedTypes);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Business tourism
        dataTmp = me.__buildBusinessTourism(
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
          dataTmp = me.__buildReservation(product, root, rootFieldList);
          if (dataTmp) {
            rootFieldList = dataTmp.rootFieldList;
          }
        }
  
        // Contact
        dataTmp = me.__buildContact(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Opening date
        dataTmp = me.buildOpeningDate(product, root, rootFieldList, me);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }

        dataTmp = me.__buildBooking(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Price
        dataTmp = me.__buildPrice(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Prestation
        dataTmp = me.buildPrestation(product, root, rootFieldList, unwantedTypes);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Visit
        //pas de visite en FMA
        if (product.type != 'FETE_ET_MANIFESTATION') {
          dataTmp = me.__buildVisit(product, root, rootFieldList, unwantedTypes);
          if (dataTmp) {
            rootFieldList = dataTmp.rootFieldList;
          }
        }
  
        // Legal entities
        dataTmp = me.buildLegalEntity(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Image
        dataTmp = me.__buildImage(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Multimedia
        dataTmp = me.__buildMultimedia(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  		// TODO BOOKING Liens
        dataTmp = me.__buildLiens(product, root, rootFieldList);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        //Objets liés
        dataTmp = me.__buildLinkedObject(
          product,
          root,
          rootFieldList,
          unwantedTypes
        );
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        // Ski
        dataTmp = me.__buildSki(product, root, rootFieldList, unwantedTypes);
        if (dataTmp) {
          rootFieldList = dataTmp.rootFieldList;
        }
  
        rootFieldList = _.uniq(rootFieldList);
  
  // TODO TREK
        // Aspect (Ne se gère pas comme root et rootFieldList)
        const aspectGroupes = me.__buildAspectGroupes(product);
        const aspectBusiness = me.__buildAspectBusiness(product);
  
        const listFields = ['root'];
        if (aspectGroupes && aspectGroupes.root) {
          listFields.push('aspect.GROUPES.root');
        }
        if (aspectBusiness && aspectBusiness.root) {
          listFields.push('aspect.TOURISME_AFFAIRES.root');
        }
  
        //console.timeEnd('Build');
  // TODO TREK
        // Build sent object
        var formData = {
          fields: JSON.stringify(listFields), // TODO EVENTS fields: JSON.stringify(['root']),
          root: JSON.stringify(root),
          'root.fieldList': JSON.stringify(rootFieldList),
          // TODO TREK
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
            : {})// TODO TREK
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
            formData.onValidationFail = 'CANCEL';
          }
        } else if (product.importType.includes('REGION')) {
          formData.skipValidation = 'false';
        } else {
          formData.skipValidation = 'true';
        }
  
        var attachmentData;
        if (me.productImage && me.productImage.length) {
          var nImage;
          for (nImage = 0; nImage < me.productImage.length; nImage++) {
            attachmentData = me.productImage[nImage].data
              ? me.productImage[nImage].data
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
  
        if (me.productMultimedia && me.productMultimedia.length) {
          var nMultimedia;
          for (
            nMultimedia = 0;
            nMultimedia < me.productMultimedia.length;
            nMultimedia++
          ) {
            attachmentData = me.productMultimedia[nMultimedia].data
              ? me.productMultimedia[nMultimedia].data
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

        if (me.gpxData && me.gpxData.length) {
          _.forEach(me.gpxData, function (gpxData, nPlan) {
            if (gpxData && gpxData.data) {
              formData['multimedia.plan-' + nPlan] = {
                value: gpxData.data.content,
                options: {
                  filename: gpxData.data.filename,
                  contentType: gpxData.data.contentType
                }
              }
            }
          })
        }

        if (config.debug && config.debug.seeData) console.log('PromiseRequestImage > datas = ', formData);
        if (config.debug && config.debug.idGeo != 0 && config.debug.idGeo != product.specialId) 
        {
          return callback(null, finalData);
        } else {
          console.time('Send data apidae');
          console.log('Api PUT = ', config.sitra.api.host, config.sitra.api.path);
        }
        
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
          async function (err, httpResponse, body) {
            console.timeEnd('Send data apidae');
            //console.log(formData);
            const statusCode = httpResponse?.statusCode;
            const success = statusCode === 200;
            if (!success) {
              console.log(chalk.red("##### L'export a échoué ! #####"));
            }
            console.log(body);
            console.log("****"+product.id);
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
  
            // Critères internes
            console.log('crit interne pour ', body.id, product.specialIdSitra)
            let specialIdSitraForCI = null
            if (body.id !== undefined && body.id !== null) {
              specialIdSitraForCI = body.id;
            } else if (product.specialIdSitra !== '') {
              specialIdSitraForCI = product.specialIdSitra;
            }
            if (specialIdSitraForCI) {
              me.__syncCriteresInternes(product, specialIdSitraForCI, accessToken)
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
  
              try {
                await Product.updateOne(
                  { _id: product.id },
                  {
                    $set: {
                      statusImport: 2,
                      specialIdSitra: product.specialIdSitra
                    }
                  }
                )

                console.log(
                  `change statusImport and add specialIdSitra for ${product.name}`
                )

                return callback(null, finalData)
              } catch (err) {
                return callback(err)
              }
            } else if (!doUpdate) {
              finalData[product.id] = {
                name: product.name,
                data: null,
                err: 'no message Apidae',
                errMessage: body.message,
                specialIdSitra: 0
              }

              try {
                await Product.updateOne(
                  { _id: product.id },
                  {
                    $set: {
                      statusImport: 4,
                      specialIdSitra: body.message
                    }
                  }
                )

                if (config.debug && config.debug.logs) {
                  console.log('body = ', body)
                }

                console.log(
                  `Error on creation - ${body} ${body.message} from Apidae > change statusImport = 4 for ${product.name}`
                )

                return callback(null, finalData)
              } catch (err) {
                console.error('Update failed:', err)
                return callback(err)
              }
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
              }
              
              try {
                await Product.updateOne(
                  { _id: product.id },
                  {
                    $set: {
                      statusImport: 4,
                      specialIdSitra: body.message
                    }
                  }
                )

                console.log(
                  `Error on creation - ${body.message} from Apidae > change statusImport = 4 for ${product.name}`
                )

                return callback(null, finalData)
              } catch (err) {
                console.error('Error updating product status:', err)
                return callback(err)
              }
            }
  
            // sinon update
            finalData[product.id] = {
              name: product.name,
              data: body,
              specialIdSitra: product.specialIdSitra
            }
  
            if (config.debug && config.debug.logs)
              console.log(
                'body [.errorType] body = ',
                body,
                `https://${config.sitra.api.host}${config.sitra.api.path} ${accessToken}`
              )
  
            // Log de l'export du trek vers Apidae.
            if (config.debug && config.debug.logProductExports) {
              me.__logExport(product, success, body)
            }

            return callback(null, finalData)
          }
        );
      })
      .catch(function (error) {
        console.error(error)
      })
  }

  async __logExport(product, success, body) {
    const ProductLogModel = require(path.resolve('./modules/products/server/models/product_log.model.js'));
    // Construction du document.
    let logData = {
      geotrekInstanceId: product.geotrekInstanceId,
      geotrekStructureId: product.geotrekStructureId,
      specialId: product.specialId,
      specialIdSitra: product.specialIdSitra,
    };
    const date = (new Date()).toISOString();
    // console.dir(httpResponse, {depth: 1})
    if (success) {
      logData.lastSuccessDate = date;
      logData.lastSuccessResponse = body;
    }
    else {
      logData.lastErrorDate = date;
      logData.lastErrorResponse = body;
    }
    // Création/mise à jour du document.
    try {
      await ProductLogModel.findOneAndUpdate(
        { specialId: logData.specialId }, // Condition de recherche.
        logData, // Données à mettre à jour.
        { upsert: true } // Créer le document s'il n'existe pas.
      )
    } catch (error) {
      console.error('Error while trying to log export:', product.specialId, error);
    }
  }

 __buildState(product, root, rootFieldList) {
    if (product.state) {
      root.state = product.state;
      rootFieldList.push('state');
      return { root, rootFieldList };
    }
    return null;
  }

 __buildSubType(product, root, rootFieldList, unwantedTypes, context) {
    let blockCategory,
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
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Category
        if (product.category && product.category.length) {
          blockField = 'categories';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.category,
            null,
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.prestation,
            ['ActiviteSportivePrestation'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.activitesSportives');
        // Prestation
        if (product.prestation && product.prestation.length) {
          blockField = 'activitesCulturelles';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.prestation,
            ['ActiviteCulturellePrestation'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.activitesCulturelles');
        break;
  
      case 'COMMERCE_ET_SERVICE':
        blockCategory = 'informationsCommerceEtService';
  
        // Sub type
        if (product.subType) {
          blockField = 'commerceEtServiceType';
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Type detail
        if (product.typeDetail && product.typeDetail.length) {
          blockField = 'typesDetailles';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeDetail,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typesDetailles');
        // Provider accreditation
        if (
          product.providerAccreditation &&
          product.providerAccreditation.length
        ) {
          blockField = 'habilitationsPrestataires';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.providerAccreditation,
            null,
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeProduct,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typesProduit');
        // aopAocIgp
        if (product.aopAocIgp && product.aopAocIgp.length) {
          blockField = 'aopAocIgps';
  
          blockData['aoc'] = true;
          blockData[blockField] = context.buildTypeKeyArray(
            product.aopAocIgp,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.aoc');
        }
        fieldList.push(blockCategory + '.aopAocIgps');
        // Label chart quality
        if (product.labelChartQuality && product.labelChartQuality.length) {
          blockField = 'labelsChartesQualite';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.labelChartQuality,
            null,
            unwantedTypes,
            context
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
        blockCategory = 'informationsEquipement'
  
        // Sub type
        if (product.subType) {
          blockField = 'rubrique'
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            ['EquipementRubrique'],
            null,
            context
          )
          fieldList.push(blockCategory + '.' + blockField)
        }
        
        // Activity
        if (product.activity && product.activity.length) {
          blockField = 'activites'
  
          blockData[blockField] = context.buildTypeKeyArray(
            _.take(product.activity, 3),
            ['EquipementActivite'],
            null,
            context
          )
        }
        fieldList.push(blockCategory + '.activites')
        // Itinerary
        if (product.itinerary) {
          blockField = 'itineraire'
  
          var itinerary = product.itinerary,
            blockItinerary = {}
  
          if (typeof itinerary.positive === 'number') {
            blockItinerary.denivellationPositive = product.itinerary.positive
            fieldList.push(
              blockCategory + '.' + blockField + '.denivellationPositive'
            )
          }
          if (typeof itinerary.negative === 'number') {
            blockItinerary.denivellationNegative = product.itinerary.negative
            fieldList.push(
              blockCategory + '.' + blockField + '.denivellationNegative'
            )
          }
          if (typeof itinerary.distance === 'number') {
            blockItinerary.distance = product.itinerary.distance
            fieldList.push(blockCategory + '.' + blockField + '.distance')
          }
          if (typeof itinerary.dailyDuration === 'number') {
            blockItinerary.dureeJournaliere = product.itinerary.dailyDuration
            fieldList.push(
              blockCategory + '.' + blockField + '.dureeJournaliere'
            )
          }
          if (typeof itinerary.altitudeMaximum === 'number') {
            blockItinerary.altitudeMaximum = product.itinerary.altitudeMaximum
            fieldList.push(blockCategory + '.' + blockField + '.altitudeMaximum')
          }
          if (typeof itinerary.altitudeMoyenne === 'number') {
            blockItinerary.altitudeMoyenne = product.itinerary.altitudeMoyenne
            fieldList.push(blockCategory + '.' + blockField + '.altitudeMoyenne')
          }
          if (typeof itinerary.altitudeMinimum === 'number') {
            blockItinerary.altitudeMinimum = product.itinerary.altitudeMinimum
            fieldList.push(blockCategory + '.' + blockField + '.altitudeMinimum')
          }

          /*if (product.passagesDelicats) {
            blockItinerary.passagesDelicats = {
              libelleFr: product.passagesDelicats,
              libelleEn: product.passagesDelicatsEn,
              libelleEs: product.passagesDelicatsEs,
              libelleIt: product.passagesDelicatsIt,
              libelleDe: product.passagesDelicatsDe,
              libelleNl: product.passagesDelicatsNl
            }
            //(process.env.NODE_ENV == 'production') ? 6527 : 5536, //Topo/pas à pas : 6527 / cooking 5536
          }
          fieldList.push(blockCategory + '.' + blockField + '.passagesDelicats')*/

          if (itinerary.itineraireType && itinerary.itineraireType.length) {
            blockItinerary.itineraireType = product.itinerary.itineraireType
            fieldList.push(blockCategory + '.' + blockField + '.itineraireType')
          }

          if (itinerary.itineraireBalise && itinerary.itineraireBalise.length) {
            blockItinerary.itineraireBalise = product.itinerary.itineraireBalise
            fieldList.push(
              blockCategory + '.' + blockField + '.itineraireBalise'
            )
            if (itinerary.precisionsBalisage) {
              blockItinerary.precisionsBalisage = {
                libelleFr: product.itinerary.precisionsBalisage
              }
              fieldList.push(
                blockCategory + '.' + blockField + '.precisionsBalisage'
              )
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
            }
            fieldList.push(
              blockCategory + '.' + blockField + '.referencesTopoguides'
            )
          }
          if (itinerary.referencesCartographiques) {
            blockItinerary.referencesCartographiques = {
              libelleFr: product.itinerary.referencesCartographiques,
              libelleEn: product.itinerary.referencesCartographiques,
              libelleEs: product.itinerary.referencesCartographiques,
              libelleIt: product.itinerary.referencesCartographiques,
              libelleDe: product.itinerary.referencesCartographiques,
              libelleNl: product.itinerary.referencesCartographiques
            }
            fieldList.push(
              blockCategory + '.' + blockField + '.referencesCartographiques'
            )
          }
          if (Object.keys(blockItinerary).length) {
            blockData[blockField] = blockItinerary
          }
        }
        break
  
      case 'FETE_ET_MANIFESTATION':
        blockCategory = 'informationsFeteEtManifestation';
  
        // Sub type
        if (product.subType) {
          blockField = 'typesManifestation';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Category
        if (product.category && product.category.length) {
          blockField = 'categories';
  
          blockData[blockField] = context.buildTypeKeyArray(
            _.take(product.category), // only 3 categories
            null,
            null,
            context
            // unwantedTypes // unwantedTypes
          );
          fieldList.push(blockCategory + '.categories');
        }
        // Theme
        if (product.theme && product.theme.length) {
          blockField = 'themes';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.theme,
            null,
            null,
            context
            // unwantedTypes
          );
          fieldList.push(blockCategory + '.themes');
        }
        // Scope
        if (product.scope) {
          blockField = 'portee';
  
          blockData[blockField] = context.__buildTypeKey(
            product.scope,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.portee');
        }
        // Generic event
        if (product.genericEvent) {
          blockField = 'evenementGenerique';
  
          blockData[blockField] = context.__buildTypeKey(
            _.without(product.genericEvent, 6017),
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.evenementGenerique');
        }
        //nom lieu
        if (product.nomLieu) {
          blockField = 'nomLieu';
          blockData[blockField] = product.nomLieu;
          fieldList.push(blockCategory + '.nomLieu');
        }
        
        //Capacité
        if (product.capacity) {
          blockData['nbParticipantsAttendu'] = blockData['nbVisiteursAttendu'] = product.capacity.value;
          fieldList.push(blockCategory + '.nbParticipantsAttendu');
          fieldList.push(blockCategory + '.nbVisiteursAttendu');
        }
        
        break;
  
      case 'HEBERGEMENT_COLLECTIF':
        blockCategory = 'informationsHebergementCollectif';
  
        // Sub type
        if (product.subType) {
          blockField = 'hebergementCollectifType';
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
  
        // Accommodation type
        if (product.typeAccommodation && product.typeAccommodation.length) {
          blockField = 'typesHebergement';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeAccommodation,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typesHebergement');
  
        // Housing type
        if (product.typeHousing && product.typeHousing.length) {
          blockField = 'typesHabitation';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeHousing,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typesHabitation');
  
        // Date ranking
        if (product.dateRanking) {
          blockField = 'dateClassement';
  
          blockData[blockField] = context.__getDate(product.dateRanking);
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
          blockData[blockField] = context.__buildTypeKey(
            product.rankingPrefectural,
            ['HebergementCollectifClassementPrefectoral'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.classementPrefectoral');
  
        // Label
        if (product.label && product.label.length) {
          blockField = 'labels';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.label,
            ['HebergementCollectifLabel'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.labels');
  
        // Chain Label
        if (product.chainLabel && product.chainLabel.length) {
          blockField = 'chaineEtLabel';
          blockData[blockField] = context.__buildTypeKey(
            product.chainLabel,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.chaineEtLabel');
  
        // Approval
        if (product.approval) {
          blockField = 'agrements';
  
          blockData[blockField] = context.__buildTypeKey(
            product.approval,
            null,
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Housing type
        if (product.typeHousing && product.typeHousing.length) {
          blockField = 'typesHabitation';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeHousing,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typesHabitation');
        // Date ranking
        if (product.dateRanking) {
          blockField = 'dateClassement';
  
          blockData[blockField] = context.__getDate(product.dateRanking);
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
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.label,
            ['HebergementLocatifLabel'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.labels');
        // Label type
        if (product.labelType) {
          blockField = 'typeLabel';
  
          blockData[blockField] = context.__buildTypeKey(
            product.labelType,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.typeLabel');
        // Ranking prefectural
        if (product.rankingPrefectural) {
          blockField = 'classementPrefectoral';
  
          blockData[blockField] = context.__buildTypeKey(
            product.rankingPrefectural,
            ['HebergementLocatifClassementPrefectoral'],
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Ranking
        if (product.ranking) {
          blockField = 'classement';
  
          blockData[blockField] = context.__buildTypeKey(
            product.ranking,
            ['HotellerieClassement'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.classement');
        // Date ranking
        if (product.dateRanking) {
          blockField = 'dateClassement';
  
          blockData[blockField] = context.__getDate(product.dateRanking);
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
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.label,
            ['HotellerieLabel'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.labels');
        // Chain
        if (product.chain && product.chain.length) {
          blockField = 'chaines';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.chain,
            ['HotellerieChaine'],
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Ranking
        if (product.ranking) {
          blockField = 'classement';
  
          blockData[blockField] = context.__buildTypeKey(
            product.ranking,
            ['HotelleriePleinAirClassement'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.classement');
        // Date ranking
        if (product.dateRanking) {
          blockField = 'dateClassement';
  
          blockData[blockField] = context.__getDate(product.dateRanking);
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
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.chain,
            ['HotelleriePleinAirChaine'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.chaines');
        // Label
        if (product.label && product.label.length) {
          blockField = 'labels';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.label,
            ['HotelleriePleinAirLabel'],
            unwantedTypes,
            context
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
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Category
        if (product.category && product.category.length) {
          blockField = 'categories';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.category,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Theme
        if (product.theme && product.theme.length) {
          blockField = 'themes';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.theme,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        break;
  
      case 'PATRIMOINE_NATUREL':
        blockCategory = 'informationsPatrimoineNaturel';
  
        // Category (correspond au sous-type pour eux)
        if (product.category && product.category.length) {
          blockField = 'categories';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.category,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.categories');
        // Ranking
        if (product.ranking) {
          blockField = 'classements';
  
          blockData[blockField] = context.buildTypeKeyArray(
            [product.ranking],
            ['PatrimoineNaturelClassement'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.classements');
        break;
  
      case 'RESTAURATION':
        blockCategory = 'informationsRestauration';
  
        // label
        if (product.labelRestauration) {
          blockField = 'label';
  
          blockData[blockField] = context.__buildTypeKey(
            product.labelRestauration,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.label');
  
        // speciality
        if (
          product.specialityRestauration &&
          product.specialityRestauration.length
        ) {
          blockField = 'specialites';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.specialityRestauration,
            ['RestaurationSpecialite'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.specialites');
  
        // Sub type
        if (product.subType) {
          blockField = 'restaurationType';
  
          blockData[blockField] = context.__buildTypeKey(
            product.subType,
            null,
            unwantedTypes,
            context
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Specialty
        if (product.typeSpecialty && product.typeSpecialty.length) {
          blockField = 'specialites';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.typeSpecialty,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.specialites');
        // Category
        if (product.category && product.category.length) {
          blockField = 'categories';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.category,
            null,
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.categories');
        // Chain
        if (product.chain && product.chain.length) {
          blockField = 'chaines';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.chain,
            ['RestaurationChaine'],
            unwantedTypes,
            context
          );
        }
        fieldList.push(blockCategory + '.chaines');
        // Guide
        if (product.guide && product.guide.length) {
          blockField = 'classementsGuides';
  
          blockData[blockField] = context.buildTypeKeyArray(
            product.guide,
            null,
            unwantedTypes,
            context
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
  
          blockData[blockField] = this.buildTypeKeyArray(
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
          blockData[blockField] = this.buildTypeKeyArray(
            product.informationAccommodation.numberDays,
            null,
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
  
          // nombreNuits
          blockField = 'nombreNuits';
          blockData[blockField] = this.buildTypeKeyArray(
            product.informationAccommodation.numberNights,
            null,
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
        // Accommodation type
        if (product.typeAccommodation && product.typeAccommodation.length) {
          blockField = 'typesHebergement';
  
          blockData[blockField] = this.buildTypeKeyArray(
            product.typeAccommodation,
            null,
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
  
        // Category
        if (product.category && product.category.length) {
          blockField = 'activiteCategories';
  
          blockData[blockField] = this.buildTypeKeyArray(
            product.category,
            null,
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
  
        // Transport
        if (product.transport && product.transport.length) {
          blockField = 'transports';
  
          blockData[blockField] = this.buildTypeKeyArray(
            product.transport,
            null,
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
  
        // Prestation activitesSportives
        if (product.prestation && product.prestation.length) {
          blockField = 'activitesSportives';
  
          blockData[blockField] = this.buildTypeKeyArray(
            product.prestation,
            ['ActiviteSportivePrestation'],
            unwantedTypes
          );
          fieldList.push(blockCategory + '.' + blockField);
        }
  
        // Prestation activitesCulturelles
        if (product.prestation && product.prestation.length) {
          blockField = 'activitesCulturelles';
  
          blockData[blockField] = this.buildTypeKeyArray(
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

 __buildName(product, root, rootFieldList) {
  let name = {},
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

 __buildMeanCommunication(product, root, rootFieldList) {
  let moyensCommunication = [],
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
      legalInformation.modeGestion = this.__buildTypeKey(
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

 __buildShortDescription(product, root, rootFieldList) {
  let shortDescription = {},
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

 __buildDescription(product, root, rootFieldList) {
  let description = {},
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

 __buildDescriptifsThematises(product, root, rootFieldList) {
  let descriptifsThematises = [],
    err = false

  // Retrieving the Geotrek ambiance field from the Apidae themed description
  if (product.ambianceLibelle) {
    let description = {}
      
    description.libelleFr = product.ambianceLibelle
    if (product.ambianceLibelleEn) {
      description.libelleEn = product.ambianceLibelleEn
    }
    if (product.ambianceLibelleEs) {
      description.libelleEs = product.ambianceLibelleEs
    }
    if (product.ambianceLibelleIt) {
      description.libelleIt = product.ambianceLibelleIt
    }
    if (product.ambianceLibelleDe) {
      description.libelleDe = product.ambianceLibelleDe
    }
    if (product.ambianceLibelleNl) {
      description.libelleNl = product.ambianceLibelleNl
    }

    descriptifsThematises.push({
      theme: {
        elementReferenceType: 'DescriptifTheme',
        id: (process.env.NODE_ENV == 'production') ? 6527 : 5536, //Topo/pas à pas : 6527 / cooking 5536
      },
      description: description
    })
  }

  if (product.passagesDelicats) {
    let descriptifsThematisesConseilsSuggest = {}
      
    descriptifsThematisesConseilsSuggest.libelleFr = product.passagesDelicats
    if (product.passagesDelicatsEn) {
      descriptifsThematisesConseilsSuggest.libelleEn = product.passagesDelicatsEn
    }
    if (product.passagesDelicatsEs) {
      descriptifsThematisesConseilsSuggest.libelleEs = product.passagesDelicatsEs
    }
    if (product.passagesDelicatsIt) {
      descriptifsThematisesConseilsSuggest.libelleIt = product.passagesDelicatsIt
    }
    if (product.passagesDelicatsDe) {
      descriptifsThematisesConseilsSuggest.libelleDe = product.passagesDelicatsDe
    }
    if (product.passagesDelicatsNl) {
      descriptifsThematisesConseilsSuggest.libelleNl = product.passagesDelicatsNl
    }

    descriptifsThematises.push({
      theme: {
        elementReferenceType: 'DescriptifTheme',
        id: 5154, //5154 - Descriptifs thématisés > Conseils et suggestions / cooking 5154 - Bons plans	 
      },
      description: descriptifsThematisesConseilsSuggest
    })
  }

  if (descriptifsThematises.length) {
    if (!root.presentation) {
      root.presentation = {}
    }
    root.presentation.descriptifsThematises = descriptifsThematises
    rootFieldList.push('presentation.descriptifsThematises')
  } else {
    err = true
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false
}

 __syncCriteresInternes(product, specialIdSitra, accessToken) {
  let criteresInternes = {
    'id': [specialIdSitra],
    'criteresInternesAAjouter': []
  }

  product.labelsMapping.forEach(labelMapping => {
      console.log('LabelMapping = ', labelMapping)
      criteresInternes.criteresInternesAAjouter.push(labelMapping)
  })

  product.theme.forEach(themeId => {
      console.log('Theme = ', themeId)
      criteresInternes.criteresInternesAAjouter.push(themeId)
  })

  const form = new FormData()
  form.append("criteres", JSON.stringify(criteresInternes))
  
  console.log(`__syncCriteresInternes https://${config.sitra.apiCriteriaInternal.host}${config.sitra.apiCriteriaInternal.path}`, criteresInternes, accessToken)
  console.time('Send data apiCriteriaInternal');
  //https://dev.apidae-tourisme.com/documentation-technique/api-decriture/v002criteres-internes/
  request(
  {
    url: `https://${config.sitra.apiCriteriaInternal.host}${config.sitra.apiCriteriaInternal.path}`,
    method: 'PUT',
    body: form,
    json: true,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  },
  async function (err, httpResponse, body) {
    console.log('end = __syncCriteresInternes', err, body?.message)
    console.timeEnd('Send data apiCriteriaInternal');
  })
  console.log('end = __syncCriteresInternes')
}
            
 __buildAspectGroupes(product) {
  let descriptionAspectGroupe = {},
    err = false,
    root = {},
    rootFieldList = [];

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

 __buildAspectBusiness(product) {
  let descriptifAspectBusiness = {},
    err = false,
    root = {},
    rootFieldList = [];

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

 __buildTypePromoSitra(product, root, rootFieldList, unwantedTypes) {
  let err = false,
    me = this

  if (product.typePromoSitra && product.typePromoSitra.length) {
    if (!root.presentation) {
      root.presentation = {}
    }
    root.presentation.typologiesPromoSitra = this.buildTypeKeyArray(
      product.typePromoSitra,
      null,
      unwantedTypes,
      me
    )
  } else {
    err = true
  }
  rootFieldList.push('presentation.typologiesPromoSitra')

  return !err ? { root: root, rootFieldList: rootFieldList } : false
}
/*__buildAddressReset(product, root, rootFieldList, unwantedTypes) {
  let err = false;

  root.localisation = {
    "adresse": null,
    "lieu": null,
    "geolocalisation": null,
    "perimetreGeographique": null,
    "lieuObjetTouristique": null,
  };
  rootFieldList.push('localisation.adresse');
  rootFieldList.push('localisation.lieu');
  rootFieldList.push('localisation.geolocalisation');
  rootFieldList.push('localisation.adresse');
  rootFieldList.push('localisation.perimetreGeographique');
  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}*/
 __buildAddress(product, root, rootFieldList, unwantedTypes) {
  let localization = {},
    address = {},
    geoLocalization = {},
    environment = null,
    lieu = {},
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
      geoLocalization.altitudeMaxi = product.geolocalisation.altitudeMaximum
      rootFieldList.push('localisation.geolocalisation.altitudeMaxi')
    }
    if (product.geolocalisation.altitudeMoyenne) {
      geoLocalization.altitudeMini = product.geolocalisation.altitudeMoyenne
      rootFieldList.push('localisation.geolocalisation.altitudeMini')
    }
    if (product.geolocalisation.altitudeMinimum) {
      geoLocalization.altitudeMinimum = product.geolocalisation.altitudeMinimum
      rootFieldList.push('localisation.geolocalisation.altitudeMinimum')
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
  if (product.idLieu) {
    lieu.id= product.idLieu;
    rootFieldList.push('localisation.lieu');
  }
  /*if (product.perimetreGeographique && product.perimetreGeographique.length) {
    localization.perimetreGeographique = [];
    _.forEach(product.perimetreGeographique, function (item) {
      localization.perimetreGeographique.push({
        id: item
      });
    });
    rootFieldList.push('localisation.perimetreGeographique');
  }*/
 
 /*localization.perimetreGeographique = [];
  if (product.address.city) {
    localization.perimetreGeographique.push({
      id: product.address.city
    });
  }
  rootFieldList.push('localisation.perimetreGeographique');*/
  /*if (product.perimetreGeographique && product.perimetreGeographique.length) {
    _.forEach(product.perimetreGeographique, function (item) {
      localization.perimetreGeographique.push({
        id: item
      });
    });
  }*/

  if (product.environment && product.environment.length) {
    environment = this.buildTypeKeyArray(product.environment, null, unwantedTypes, context);
  }
  rootFieldList.push('localisation.environnements');

  if (Object.keys(address).length) {
    localization.adresse = address;
  }
  if (Object.keys(geoLocalization).length) {
    localization.geolocalisation = geoLocalization;
  }
  if (Object.keys(lieu).length) {
    localization.lieu = lieu;
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

 __buildBusinessTourism(product, root, rootFieldList) {
  let businessTourism = {},
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

 __buildReservation(product, root, rootFieldList) {
  let arrOrganism = [],
    err = false;

  if (product.reservation) {
    _.forEach(product.reservation, (reservation) => {
      let organism = {
          structureReference: {}
        },
        organismObservation = {},
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
        //TODO CGT
        organism.type = this.__buildTypeKey(reservation.type);
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

 __buildContact(product, root, rootFieldList) {
  let arrContact = [],
    err = false;

  _.forEach(product.contact, function (contactData) {
    let contact = {},
      moyensCommunication = [];

    if (contactData) {
      if (contactData.civility) {
        //TODO CGT
        contact.civilite = this.__buildTypeKey(contactData.civility);
      }
      if (contactData.firstname) {
        contact.prenom = contactData.firstname;
      }
      if (contactData.lastname) {
        contact.nom = contactData.lastname;
      }
      if (contactData.primaryFunction) {
        //TODO CGT
        contact.fonction = this.__buildTypeKey(contactData.primaryFunction);
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

 __buildBooking(product, root, rootFieldList)
 {
  if (product.reservation) {
    let reservation = {};
    reservation.complement = {};
    reservation.complement.libelleFr = product.reservation.complementFr;
    
    root.reservation = reservation;
    rootFieldList.push('reservation.complement');
  }
  return { root: root, rootFieldList: rootFieldList };
}

 __buildPrice(product, root, rootFieldList)
 {
  let price = {},
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

 buildPrestation(product, root, rootFieldList, unwantedTypes) {
  let prestation = {},
    err = false;

  if (product.equipment && product.equipment.length) {
    prestation.equipements = this.buildTypeKeyArray(
      product.equipment,
      null,
      unwantedTypes,
      context
    );
  }

  rootFieldList.push('prestations.equipements');

  if (product.comfort && product.comfort.length) {
    prestation.conforts = this.buildTypeKeyArray(
      product.comfort,
      null,
      unwantedTypes,
      context
    );
  }
  rootFieldList.push('prestations.conforts');

/* TODO SPECIAL TREK*/
  if (product.service && product.service.length) {
    prestation.services = this.buildTypeKeyArray(
      product.service,
      null,
      unwantedTypes,
      context
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
/* TODO SPECIAL TREK*/

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
    prestation.tourismesAdaptes = this.buildTypeKeyArray(
      product.adaptedTourism,
      null,
      unwantedTypes,
      context
    );
    rootFieldList.push('prestations.tourismesAdaptes');
  }

  // ALERTE ! SPECIAL CASE !
  if (product.activity && product.activity.length) {
    var tmp = this.buildTypeKeyArray(product.activity, null, unwantedTypes, this);
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
    prestation.languesParlees = this.buildTypeKeyArray(
      product.language,
      null,
      unwantedTypes
    );
  }
  rootFieldList.push('prestations.languesParlees');

  if (product.languesDocumentation && product.languesDocumentation.length) {
    prestation.languesDocumentation = this.buildTypeKeyArray(
      product.languesDocumentation,
      null,
      unwantedTypes,
      context
    );
  }
  rootFieldList.push('prestations.languesDocumentation');

  if (product.typeClient) {
    prestation.typesClientele = this.buildTypeKeyArray(
      product.typeClient,
      'TypeClientele',
      unwantedTypes,
      this
    )
  }
  rootFieldList.push('prestations.typesClientele');

  if (product.labelTourismHandicap && product.labelTourismHandicap.length) {
    prestation.labelsTourismeHandicap = this.buildTypeKeyArray(
      product.labelTourismHandicap,
      null,
      unwantedTypes,
      context
    );
  }
  rootFieldList.push('prestations.labelsTourismeHandicap');

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
        this.buildTypeKeyArray(
          product.prestation,
          ['ActiviteSportivePrestation'],
          unwantedTypes,
          context
        );
    }
    rootFieldList.push('informationsPrestataireActivites.activitesSportives');
    // Prestation
    if (product.prestation && product.prestation.length) {
      root.informationsPrestataireActivites.activitesCulturelles =
        this.buildTypeKeyArray(
          product.prestation,
          ['ActiviteCulturellePrestation'],
          unwantedTypes,
          context
        );
    }
    rootFieldList.push('informationsPrestataireActivites.activitesCulturelles');
  }
	
  if (product.capacity) {
    prestation.tailleGroupeMax = product.capacity.value;
    rootFieldList.push('prestations.tailleGroupeMax');
  }

  if (Object.keys(prestation).length) {
    root.prestations = prestation;
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

 __buildVisit(product, root, rootFieldList, unwantedTypes) {
  let visit = {
      complementVisite: {}
    },
    err = false;

  if (product.visites && product.visites.visitable === true) {
    visit.visitable = true;
    rootFieldList.push('visites.visitable');
  }

  if (product.visitGroup && product.visitGroup.length) {
    visit.prestationsVisitesGroupees = this.buildTypeKeyArray(
      product.visitGroup,
      null,
      unwantedTypes,
      context
    );
    rootFieldList.push('visites.prestationsVisitesGroupees');
  }
  if (product.visitIndividual && product.visitIndividual.length) {
    visit.prestationsVisitesIndividuelles = this.buildTypeKeyArray(
      product.visitIndividual,
      null,
      unwantedTypes,
      context
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
    visit.complementVisite.libelleFr = this.buildTypeKeyArray(
      product.visitLabel,
      null,
      unwantedTypes,
      context
    );
    rootFieldList.push('visites.complementVisite.libelleFr');
  }
  if (
    product.visites &&
    product.visites.languesVisite &&
    product.visites.languesVisite.length
  ) {
    visit.languesVisite = this.buildTypeKeyArray(
      product.visites.languesVisite,
      null,
      unwantedTypes,
      context
    );
    rootFieldList.push('visites.languesVisite');
  }
  if (
    product.visites &&
    product.visites.languesPanneauInformation &&
    product.visites.languesPanneauInformation.length
  ) {
    visit.languesPanneauInformation = this.buildTypeKeyArray(
      product.visites.languesPanneauInformation,
      null,
      unwantedTypes,
      context
    );
    rootFieldList.push('visites.languesPanneauInformation');
  }
  if (
    product.visites &&
    product.visites.languesAudioGuide &&
    product.visites.languesAudioGuide.length
  ) {
    visit.languesAudioGuide = this.buildTypeKeyArray(
      product.visites.languesAudioGuide,
      null,
      unwantedTypes,
      context
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

 buildLegalEntity(product, root, rootFieldList) {
  let finalLegalEntity = {},
    err = false;

  if (product.legalEntity && product.legalEntity.length) {

    let gestionSitraId = product.gestionSitraId
    if (product.type != 'FETE_ET_MANIFESTATION' && process.env.NODE_ENV != 'production') {
      gestionSitraId = 223268
    }

    _.forEach(product.legalEntity, function (legalEntityObj) {
      
      switch (legalEntityObj.type) {
        case 'management':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }

          finalLegalEntity.informations.structureGestion = {
            type: 'STRUCTURE',
            id: gestionSitraId
          };

          rootFieldList.push('informations.structureGestion');
          break;

        case 'gestion':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }

          finalLegalEntity.informations.structureGestion = {
            type: 'STRUCTURE',
            id:  gestionSitraId
          };
          rootFieldList.push('informations.structureGestion');
          break;

        case 'information':
          if (!finalLegalEntity.informations) {
            finalLegalEntity.informations = {};
          }
          
          finalLegalEntity.informations.structureInformation = {
            type: 'STRUCTURE',
            id: gestionSitraId
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
            type: this.__buildTypeKey(resa.type),
            observation: organismObservation,
            moyensCommunication: moyensCommunication,
            structureReference: {
              type: 'STRUCTURE',
              id:  gestionSitraId,
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

 __buildImage(product, root, rootFieldList) {
  let arrImage = [],
    err = false;

  if (this.productImage && this.productImage.length) {
    _.forEach(this.productImage, function (imageData, nImage) {
      let image = {},
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
      if (imageData.title) {
        name.libelleFr = imageData.title;
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
      if (imageData.author) {
        copyright.libelleFr = imageData.author; //TODO ! description on trek
      }
      /*if (imageData.descriptionEn) {
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
      }*/

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

 __buildLiens(product, root, rootFieldList) {
  let liens = {};
  if (product.url) {
    liens.complement = {};
    liens.complement.libelleFr = product.url;
    root.liens = liens;
    rootFieldList.push('liens.complement');
  }
  return{ root: root, rootFieldList: rootFieldList };
}

 __buildMultimedia(product, root, rootFieldList) {
  let arrMultimedia = [],
    err = false;

  if (this.productMultimedia && this.productMultimedia.length) {
    _.forEach(this.productMultimedia, function (multimediaData, nMultimedia) {
      let multimedia = {},
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
  let arrMultimediaDataKml = [];
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
    let multimediaKml = {
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
  let arrMultimediaDataGpx = [];
  if (product.gpx && product.gpx.length) {
    product.gpx.forEach((url, nPlan) => {
      if (url) {
        arrMultimediaDataGpx.push({
          locale: 'fr',
          url: 'MULTIMEDIA#plan-' + (nPlan)
        })
      }
    })   
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
    let multimediaGpx = {};
    multimediaGpx.nom = {};
    multimediaGpx.link = 'false';
    multimediaGpx.type = 'PLAN';
    multimediaGpx.traductionFichiers = arrMultimediaDataGpx;
    multimediaGpx.nom.libelleFr = 'GPX';
    arrMultimedia.push(multimediaGpx);
  }

  // Add PDF
  let arrMultimediaDataPdf = [];
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
    let multimediaPdf = {};
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
 
__buildImageDetail(images, nImage, callback, originalImage = false, sizeImage = 2500)
{
  if (images && nImage < images.length) {
    let image = images[nImage]
    if (image.url) {
      let me = this,
        urlResize,
        urlObject

      if (originalImage) {
        urlObject = new URL(image.url)
      } else {
        urlResize = 'https://wsrv.nl/?w=' + sizeImage + '&url=' + image.url + '&output=jpg'
        urlObject = new URL(urlResize)
        if (config.debug && config.debug.logs) {
          console.log('urlResize = ', urlResize)
        }
      }

      me.__getImageSize(urlObject.href, function(size) {
          if (config.debug && config.debug.logs) {
            console.log('urlResize response = ', size)
          }
          if (size > 9500) {
            //l'image est trop grande 
            if (originalImage) {
                //si on voulait l'image originale et qu'elle est trop grand on passe a la prochaine
                images.splice(nImage--, 1)
                me.__buildImageDetail(images, ++nImage, callback)
            } else {
                //sinon on retente avec un image + petite
                sizeImage = sizeImage - 250
                me.__buildImageDetail(images, nImage, callback, false, sizeImage)
            }
          } else {
              if (config.debug && config.debug.logs) {
                console.log("Image url = ", urlObject.href)
              }
              let path = image.url,
                httpProtocol,
                filename = path.replace(new RegExp('^.*/([^/]+)$'), '$1'),
                ext = filename
                  .replace(new RegExp('.*\\.([^\\.]+)$'), '$1')
                  .toLowerCase(),
                contentType
        
              switch (ext) {
                case 'jpg':
                case 'jpeg':
                  contentType = 'image/jpeg'
                  break
                default:
                  contentType = 'image/' + ext
                  break
              }
        
              switch (urlObject.protocol) {
                case 'https:':
                  httpProtocol = https
                  break
                default:
                  httpProtocol = http
                  break
              }  
              let request = httpProtocol.request(urlObject, function (response) {
                if (config.debug && config.debug.logs) {
                  console.log("starting requesting Image")
                }
                let myBuffer = Buffer.from('')
        
                response.on('data', function (chunk) {
                  myBuffer = Buffer.concat([myBuffer, Buffer.from(chunk, 'binary')])
                })

                response.on('error', function (err) {
                    console.error(`Response error: ${err.message}`)
                    // Catch error and store on obj' errMessage 
                    me.__buildImageDetail(images, ++nImage, callback)
                })
            
                response.on('aborted', function () {
                    console.error("Request was aborted by the server.")
                })
        
                response.on('end', function () {
                  if (config.debug && config.debug.logs) {
                    console.log("end requesting Image checking for next one", response?.statusCode)
                  }
                  if (
                    response &&
                    response.statusCode &&
                    parseInt(response.statusCode) !== 404
                  ) {
                    if (images[nImage]) {
                      images[nImage].data = {
                        path: path,
                        filename: filename,
                        contentType: contentType,
                        content: myBuffer
                      }
                    }
                  } else {
                    if (originalImage != true) {
                      me.__buildImageDetail(images, nImage, callback, true)
                      return
                    } else {
                      images.splice(nImage--, 1)
                    }
                  }
                  me.__buildImageDetail(images, ++nImage, callback)
                })
              })
        
              // Handle errors
              request.on('error', function (error) {
                console.log('Problem with request : ', error.message)
                me.__buildImageDetail(images, ++nImage, callback)
              })
              if (config.debug && config.debug.logs) {
                console.log("end requesting Image")
              }
              request.end()
          }
      })
    } else {
      this.__buildImageDetail(images, ++nImage, callback)
    }
  } else {
    if (callback) {
      callback(null, images)
    }
  }
}

 __buildPdfDetail(pdfs, nPdf, callback) {
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

          this.__buildPdfDetail(pdfs, ++nPdf, callback);
        });
      });

      // Handle errors
      request.on('error', function (error) {
        console.error('Problem with request:', error.message);
        this.__buildPdfDetail(pdfs, ++nPdf, callback);
      });

      request.end();
    } else {
      this.__buildPdfDetail(pdfs, ++nPdf, callback);
    }
  } else {
    if (callback) {
      callback(null, pdfs);
    }
  }
}

 __buildLinkedObject(product, root, rootFieldList) {
  let liens = {},
    liensObjetsTouristiquesTypes = [],
    err = false,
    objetTouristiques = {};

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

 __buildSki(product, root, rootFieldList, unwantedTypes) {
  let informationsDomaineSkiable = {},
    err = false;

  if (product.ski) {
    if (product.ski.classification) {
      informationsDomaineSkiable.classification = this.__buildTypeKey(
        product.ski.classification,
        null,
        unwantedTypes,
        context
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

 buildOpeningDate(product, root, rootFieldList, context) {
  let openingDate = {},
    openingDateLabel = {},
    arrPeriod = [],
    period = {},
    periodLabel,
    endDateMax = null,
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

    if (product.openingDate.dureeSeance) {
      openingDate.dureeSeance = product.openingDate.dureeSeance;
    }

    // Build periodesOuvertures
    if (
      product.openingDate.periodesOuvertures &&
      product.openingDate.periodesOuvertures.length
    ) {
      //traitement des périodesOuvertures : gestion des doublons, des chevauchements.
      var arrPeriodesOuvertures = context.__traitePeriode(
        product.openingDate.periodesOuvertures
      );
      _.forEach(arrPeriodesOuvertures, function (periodData) {
        period = {};

        //recurrent
        if (product.openingDate.recurrent) {
          period.tousLesAns = product.openingDate.recurrent;
        }

        if (periodData.dateStart) {
          period.dateDebut = context.__getDate(periodData.dateStart);
        }
        if (periodData.dateEnd) {
          period.dateFin = context.__getDate(periodData.dateEnd);
          endDateMax = period.dateFin;
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
            period.horaireOuverture = periodData.ouverturesJourDuMois[0].horaireOuverture;
          }
          if (allEqualhoraireFermeture && horaireFermetureArr.length) {
            period.horaireFermeture = periodData.ouverturesJourDuMois[0].horaireFermeture;
          }

          period.ouverturesJournalieres = [];
          period.ouverturesJournalieres = ouverturesJourDuMois;
        }

        if (periodData.horaireOuverture) {
          period.horaireOuverture = periodData.horaireOuverture;
        }
        if (periodData.horaireFermeture) {
          period.horaireFermeture = periodData.horaireFermeture;
        }
        
        if (periodData.type) {
          period.type = periodData.type;
        }

        // Build opening date periodesOuvertures label
        // TODO TREK
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
        }// TODO TREK

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
    
    if (product.openingDate.expiration) {
       _.forEach(product.openingDate.expiration, function (periodDataExpiration) {
        root.expiration = {
          dateExpiration : moment(periodDataExpiration.expirationDate).format('YYYY-MM-DD'),
          expirationAction : periodDataExpiration.expirationAction,
        };
       });  
      rootFieldList.push('expiration.dateExpiration');
      rootFieldList.push('expiration.expirationAction');
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
    rootFieldList.push('ouverture.dureeSeance');
  } else {
    err = true;
  }

  return !err ? { root: root, rootFieldList: rootFieldList } : false;
}

__getImageSize(url, callback)
{
  fetch(url, { method: 'HEAD' })
    .then(response => {
      if (!response.ok)
      {
        callback(-1)
      }
  
      // Récupère la taille du contenu en octets depuis l'en-tête Content-Length
      var contentLength = response.headers.get('Content-Length');
      if (contentLength === null) 
      {
        callback(-1)
      }
  
      // Convertit la taille en kilooctets
      var sizeInKB = parseInt(contentLength, 10) / 1024;
      callback(sizeInKB)
    })
    .catch(error => {
     callback(-1)
    });
}

}

module.exports = Apidae;