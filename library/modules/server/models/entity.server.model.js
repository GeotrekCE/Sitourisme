'use strict';

const path = require('path'),
    _ = require('lodash'),
    mongoose = require('mongoose'),
    EntityFactory = require(path.resolve('./library/modules/server/models/entityFactory.server.model.js'))

class EntityServer
{
    constructor(entity, schema)
    {
        this.entity = entity
        this.schema = schema
        this.entityFactory = null
        this.entitySchema = null
        console.log('Entity server constructed for ', entity)
    }
    
    getModel() 
    {
        this.entityFactory = new EntityFactory(this.entity, this.schema)
        this.entitySchema = this.entityFactory.getDefaultSchema()
        
        this.entityFactory.setSchema(this.entitySchema)
        this.EntitySchema = this.entityFactory.getMongooseSchema()
        
        this.setBinding()
        this.setFn()
        this.entityFactory.setMongooseModel(this.EntitySchema)
        console.log('this entity factory = ', this.entityFactory.name)
          
        return this.entityFactory.getModel()
    }
    
    setBinding()
    {
        this.EntitySchema.statics.getByUrl = this.entityFactory.getByUrl.bind(this.entityFactory)
        this.EntitySchema.statics.buildUrl = this.entityFactory.buildUrl.bind(this.entityFactory)
        this.EntitySchema.statics.cleanUrl = this.entityFactory.cleanUrl.bind(this.entityFactory)
        this.EntitySchema.statics.checkPhone = this.entityFactory.checkPhone.bind(this.entityFactory)
        this.EntitySchema.statics.checkEmail = this.entityFactory.checkEmail.bind(this.entityFactory)
        this.EntitySchema.statics.exportSitra = this.entityFactory.exportSitra.bind(this.entityFactory)
        this.EntitySchema.statics.exportSitraAuto = this.entityFactory.exportSitraAuto.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraSubType = this.entityFactory.getSitraSubType.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraKeys = this.entityFactory.getSitraKeys.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraReference = this.entityFactory.getSitraReference.bind(this.entityFactory)
        this.EntitySchema.statics.getStatusImportReference = this.entityFactory.getStatusImportReference.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraMemberReference = this.entityFactory.getSitraMemberReference.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraPersonTypeReference = this.entityFactory.getSitraPersonTypeReference.bind(this.entityFactory)
        this.EntitySchema.statics.getSitraCivilityReference = this.entityFactory.getSitraCivilityReference.bind(this.entityFactory)
        this.EntitySchema.statics.getSITRAInternalCriteriaReference = this.entityFactory.getSITRAInternalCriteriaReference.bind(this.entityFactory)
        this.EntitySchema.statics.deleteSitra = this.entityFactory.deleteSitra.bind(this.entityFactory)
    }
    
    setFn()
    {
        this.EntitySchema.statics.import = function (type, instance, callback, api, moduleName, Model, EntityServer, CGT) {
            console.log('1. EntitySchema.statics.import', CGT)
            EntityServer.import(type, instance, callback, api, moduleName, Model, EntityServer, CGT)
        }
        
        this.EntitySchema.statics.doUpsert = async function (
          datas,
          specialId,
          instanceStructureGeotrekId,
          importType, 
          Model,
          EntityServer,
          cgt,
          callback,
        ) {
          console.log('SAVE1 OK DATAS', datas.name, cgt)
          try { 
            let doc
            if (instanceStructureGeotrekId !== undefined) {
              doc = await Model.findOne({ instanceStructureGeotrekId })
            }

            if (!doc) {  
              console.log('>> SAVE1 SEARCH ON OLD KEY')
              //docs = await Model.find({ specialId, importType })

              doc = await Model.findOne({
                specialId,
                importType,
                instanceStructureGeotrekId: { $exists: false }
              })

              if (doc) {
                console.log('>> MIGRATE OLD DOC')
                doc.instanceStructureGeotrekId = instanceStructureGeotrekId
                await doc.save()
              }
            }

            let data
            if (doc) {
              data = doc
              data.set(datas)
            } else {
              data = new Model(datas)
            }

            console.log('SAVE2 OK DATAS', data.name, cgt)
            await EntityServer.entityFactory.save(data, callback)
          } catch (err) {
            console.log('Error in doUpsert():', err)
            if (callback) {
              callback(err)
            }
          }
        }
        
        /*this.EntitySchema.statics.save = async function (data, callback, cgt, Model, EntityServer) {
          console.log('SAVE2 OK DATAS2', data.name, cgt);
          EntityServer.entityFactory.save(data, function () {
            console.log('CallBack after entityFactory save method', cgt);
            callback();
          });
        };*/
        
        this.EntitySchema.post('save', function (product, next) {
          console.log('AFTER SAVE ', product.name)
          next()
        })
    }
    
    async import(type, instance, callback, api, moduleName, Model, EntityServer, CGT) {
      console.log('2/3. import = ', api, CGT)
      try {
        const User = mongoose.model('User')
        const user = await User.findOne({ username: 'websenso' })

        if (!user) {
          console.warn('Admin user not found.')
          if (callback) callback()
          return
        }

        const ImportClass = require(path.resolve('./library/modules/server/models/importGeneric.server.model.js'))
        let importObj = new ImportClass({
          user: user,
          lang: 'fr',
          importType: type,
          importInstance: instance,
          importApi: api,
          moduleName: moduleName,
          Model: Model,
          EntityServer: EntityServer,
          cgt: CGT
        })

        importObj.start(() => {
          if (callback) {
            callback()
          }
          importObj = null
        })
      } catch (err) {
        console.error('Error during import:', err)
        if (callback) {
          callback()
        }
      }
    }
}

module.exports = EntityServer