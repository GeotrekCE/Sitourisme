'use strict';

const path = require('path'),
  _ = require('lodash'),
  mongoose = require('mongoose'),
  moment = require('moment'),
  Apidae = require(path.resolve('./library/export/apidae.js')),
  ApidaeLib = new Apidae(),
  config = require(path.resolve('./config/config.js'));

class ExportApidae
{
    constructor(entity)
    {
        this.entity = entity;
    }
  
    __exportSitra(entities, options, callback, finalData)
    {
      if (entities.length) {
        console.log(`${entities.length} fiche(s) à exporter!`);
        let me = this,
          entity = entities.shift(),
          legalEntities =
            entity.legalEntity && entity.legalEntity.length
              ? entity.legalEntity
              : null,
          optionsEntities = _.clone(options);
    
        console.log('-> Export vers APIDAE id : ' + entity.specialId + 'type = ' + entity.type);
        
        ApidaeLib.__getSitraToken(
          ApidaeLib,
          entity,
          null,
          function (accessToken) {
            console.log('Accesstoken', accessToken);
            ApidaeLib.__doExport(
              me.entity,
              entity,
              accessToken,
              options,
              async function (finalDataNew) {
                if (finalDataNew) {
                  if (finalData) {
                    _.merge(finalData, finalDataNew);
                  } else {
                    finalData = finalDataNew;
                  }
                }
                me.__exportSitra(entities, options, callback, finalData);
              }
            );
          }
        );
      } else {
        console.log("fin de l'envoi a apidae!");
        if (callback) {
          callback(finalData);
        }
      }
    }
    
    __exportSitraAuto(type, options, callback)
    {
      
      let today = moment().startOf('day'),
        Entity = /*mongoose.model('Product')*/this.entity,
        importType = type.toUpperCase();
    
      console.log('Members to export : ', options.membersToImport, 'importType = ',importType);
    
      Entity.find({
        importType: importType,
        lastUpdate: { $gte: today.toDate() },
        statusImport: { $in: [0,1,2] }
      })
        .sort({ 'linkedObject.isFather': -1 })
        .exec(function (err, entities) {
          if (config.debug && config.debug.logs) {
            console.log('Import type = ', importType);
            console.log('Import lastdate = ', today.toDate());
            console.log('Import products = ', entities.length);
          }
          
          if (process.env.NODE_ENV == 'production') {
            let entitiesTmp = [];
            entities.forEach(function(prod){
              if (options.membersToImport.includes(prod.member))
              {
                entitiesTmp.push(prod);
              }
            });
            entities = entitiesTmp;
            if (config.debug && config.debug.logs) {
              console.log('Import entities for instance = ', entities.length);
            }
          }
    
          if (err) {
            console.error('Error in exportSitraAuto : ' + err);
          } else {
            const total = entities.length;
            console.log(`${total} à exporter vers APIDAE`);
            if (total > 0) {
              Entity.exportSitra(entities, options, function (err2) {
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
}

module.exports = ExportApidae;