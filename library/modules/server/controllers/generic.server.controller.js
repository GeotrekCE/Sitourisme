'use strict';

const path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('config/config.js')),
  configImportGEOTREK = require(path.resolve('config/configImport_GEOTREK.js')),
  _ = require('lodash');

let Model = null,
  Api = null,
  ModuleName = null,
  CGT = null,
  EntityServer = null;
  
exports.init = function(model, api, moduleName, entityServer, cgt) {
    Model = model;
    Api = api;
    ModuleName = moduleName;
    EntityServer = entityServer;
    CGT = cgt;
}

exports.list = async function (req, res) {
  try {
    const results = await Model.find({}).sort('-created').lean();
    return res.json(results);
  } catch (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

exports.import = function (req, res) {
  const type = req.query && req.query.type ? req.query.type : null,
    instance = req.query && req.query.instance ? req.query.instance : null;
  
  if (config.debug && config.debug.logs)
    console.log('Begin import auto for', type, instance);

  if (!type)
    throw 'Unable to determine type';
  
  if (configImportGEOTREK.geotrekInstance[instance] === undefined)
    throw 'Instance not found';

  try {
    res.json({ message: 'Importing ' + type + ' flux in progress from ' + configImportGEOTREK.geotrekInstance[instance].geotrekUrl });
    console.log('Model generic server = ', Model.modelName, CGT);
    Model.import(type, instance, null, Api, ModuleName, Model, EntityServer, CGT);
  } catch (err) {
    console.log('err = ', err);
  }
};
