'use strict'

const path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('config/config.js')),
  configImportGEOTREK = require(path.resolve('config/configImport_GEOTREK.js')),
  _ = require('lodash')

let Model = null,
  Api = null,
  ModuleName = null,
  CGT = null,
  EntityServer = null
  
exports.init = function(model, api, moduleName, entityServer, cgt) {
    Model = model
    Api = api
    ModuleName = moduleName
    EntityServer = entityServer
    CGT = cgt
}

exports.list = async function (req, res) {
  try {
    const results = await Model.find({}).sort('-created').lean()
    return res.json(results)
  } catch (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    })
  }
}

exports.import = function (req, res) {
  const type = req.query && req.query.type ? req.query.type : null,
    instance = req.query && req.query.instance ? req.query.instance : null
  
  if (config.debug && config.debug.logs)
    console.log('Begin import auto for', type, instance)

  if (!type)
    throw 'Unable to determine type'
  
  if (configImportGEOTREK.geotrekInstance[instance] === undefined)
    throw 'Instance not found'

  try {
    res.json({ message: 'Importing ' + type + ' flux in progress from ' + configImportGEOTREK.geotrekInstance[instance].geotrekUrl })
    console.log('Model generic server = ', Model.modelName, CGT)
    Model.import(type, instance, null, Api, ModuleName, Model, EntityServer, CGT)
  } catch (err) {
    console.log('err = ', err)
  }
}

exports.delete = async function (req, res) {
  const id = req.query && req.query.id
  const key = req.query && req.query.instanceStructureGeotrekId
  if (!id && !key)
    return res.status(400).send({ message: 'id ou instanceStructureGeotrekId requis' })

  try {
    const doc = id
      ? await Model.findById(id)
      : await Model.findOne({ instanceStructureGeotrekId: key })
    if (!doc) return res.status(404).send({ message: 'Fiche introuvable' })

    Model.deleteSitra(doc, {}, async function (err, result) {
      if (err) return res.status(502).send({ message: 'Échec suppression Apidae', err })
      await Model.updateOne(
        { _id: doc._id },
        { $set: { statusImport: 3, state: 'HIDDEN', lastUpdate: new Date() } }
      )
      return res.json({ message: 'Fiche supprimée (logique)', id: doc._id, specialIdSitra: doc.specialIdSitra, result })
    })
  } catch (err) {
    return res.status(400).send({ message: errorHandler.getErrorMessage(err) })
  }
}
