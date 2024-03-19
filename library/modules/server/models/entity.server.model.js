'use strict';

const path = require('path'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    EntityFactory = require(path.resolve('./library/modules/server/models/entityFactory.server.model.js'));

class EntityServer
{
    constructor(entity, schema)
    {
        this.entity = entity;
        this.schema = schema;
        this.entityFactory = null;
        this.entitySchema = null;
        console.log('Entity server constructed for ', entity);
    }
    
    getModel() 
    {
        this.entityFactory = new EntityFactory(this.entity, this.schema);
        this.entitySchema = this.entityFactory.getDefaultSchema();
        
        this.entityFactory.setSchema(this.entitySchema);
        this.EntitySchema = this.entityFactory.getMongooseSchema();
        
        this.setBinding();
        this.setFn();
        this.entityFactory.setMongooseModel(this.EntitySchema);
        console.log('this entity factory = ', this.entityFactory.name);
          
        return this.entityFactory.getModel();
    }
    
    setBinding()
    {
        this.EntitySchema.statics.getByUrl = this.entityFactory.getByUrl.bind(this.entityFactory);
        this.EntitySchema.statics.buildUrl = this.entityFactory.buildUrl.bind(this.entityFactory);
        this.EntitySchema.statics.cleanUrl = this.entityFactory.cleanUrl.bind(this.entityFactory);
        this.EntitySchema.statics.checkPhone = this.entityFactory.checkPhone.bind(this.entityFactory);
        this.EntitySchema.statics.checkEmail = this.entityFactory.checkEmail.bind(this.entityFactory);
        this.EntitySchema.statics.exportSitra = this.entityFactory.exportSitra.bind(this.entityFactory);
        this.EntitySchema.statics.exportSitraAuto = this.entityFactory.exportSitraAuto.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraSubType = this.entityFactory.getSitraSubType.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraKeys = this.entityFactory.getSitraKeys.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraReference = this.entityFactory.getSitraReference.bind(this.entityFactory);
        this.EntitySchema.statics.getStatusImportReference = this.entityFactory.getStatusImportReference.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraMemberReference = this.entityFactory.getSitraMemberReference.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraPersonTypeReference = this.entityFactory.getSitraPersonTypeReference.bind(this.entityFactory);
        this.EntitySchema.statics.getSitraCivilityReference = this.entityFactory.getSitraCivilityReference.bind(this.entityFactory);
        this.EntitySchema.statics.getSITRAInternalCriteriaReference = this.entityFactory.getSITRAInternalCriteriaReference.bind(this.entityFactory);    
    }
    
    setFn()
    {
        this.EntitySchema.statics.import = function (type, instance, callback, api, moduleName, Model, EntityServer, CGT) {
          //if (config.debug && config.debug.logs)
            console.log('1. EntitySchema.statics.import', CGT);
            EntityServer.import(type, instance, callback, api, moduleName, Model, EntityServer, CGT);
        };
        
        this.EntitySchema.statics.doUpsert = function (
          datas,
          specialId,
          importType, 
          Model,
          EntityServer,
          cgt,
          callback,
        ) {
          console.log('SAVE1 OK DATAS', datas.name, cgt);
          Model.find({ specialId, importType }, function (err, docs) {
            if (err) {
              console.log('Error in doUpsert() : ' + err);
              if (callback) {
                callback(err);
              }
            } else {
              var data =
                docs.length > 0 ? _.extend(docs[0], datas) : new Model(datas);
              Model.save(data, callback, cgt, Model, EntityServer);
            }
          });
        };
        
        this.EntitySchema.statics.save = function (data, callback, cgt, Model, EntityServer) {
          console.log('SAVE2 OK DATAS', data.name, cgt);
          EntityServer.entityFactory.save(data, function () {
            console.log('CallBack after entityFactory save method', cgt);
            callback();
          });
        };
        
        this.EntitySchema.post('save', function (product, next) {
          console.log('AFTER SAVE ', product.name);
          next();
        });
    }
    
    import(type, instance, callback, api, moduleName, Model, EntityServer, CGT) {
      console.log('2/3. import = ', api, CGT);
      let User = mongoose.model('User');
      User.findOne({
        username: 'admin'
      }).then(function (err, user) {
        if (!err) {
            const ImportClass = require(path.resolve('./library/modules/server/models/importGeneric.server.model.js'));
            let importObj = new ImportClass({
              user: user,
              lang: 'fr',
              importType: type,
              importInstance: instance,
              importApi: api, 
              moduleName : moduleName,
              Model: Model,
              EntityServer : EntityServer,
              cgt: CGT
            });
    
            importObj.start(() => {
              if (callback) {
                callback();
              }
              importObj = null;
            });
        } else {
          if (callback) {
            callback();
          }
          
        }
      });
    }
}

module.exports = EntityServer;