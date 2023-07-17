'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  config = require(__dirname + '/../../../../config/config.js'),
  configImportGEOTREK = require(path.resolve('config/configImport_GEOTREK.js')),
  _ = require('lodash');

/**
 * List of Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.list = async function (req, res) {
  try {
    const products = await Product.find({}).sort('-created').lean();
    return res.json(products);
  } catch (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Import Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.import = function (req, res) {
  const type = req.query && req.query.type ? req.query.type : null,
    instance = req.query && req.query.instance ? req.query.instance : null;
  
  if (config.debug && config.debug.logs)
    console.log('Begin import auto for', type);

  if (!type) {
    throw 'Unable to determine type';
  }
  
  if (configImportGEOTREK.geotrekInstance[instance] === undefined)
  {
    throw 'Instance not found';
  }

  try {
    res.json({ message: 'Importing ' + type + ' flux in progress from ' + configImportGEOTREK.geotrekInstance[instance].geotrekUrl });
    Product.import(type, instance);
  } catch (err) {
    console.log('err = ', err);
  }
};
