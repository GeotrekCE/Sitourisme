'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  LegalEntity = mongoose.model('LegalEntity'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  config = require(__dirname + '/../../../../config/config.js'),
  _ = require('lodash');

/**
 * Create a product
 *
 * @param {object} req
 * @param {object} res
 */
exports.create = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Show the current product
 *
 * @param {object} req
 * @param {object} res
 */
exports.read = function (req, res) {
  res.json(req.product);
};

/**
 * Update a product
 *
 * @param {object} req
 * @param {object} res
 */
exports.update = function (req, res) {
  var product = req.product.data,
    dataProduct,
    str = '';

  req.on('data', function (chunk) {
    str += chunk;
  });

  req.on('end', function () {
    try {
      dataProduct = JSON.parse(str);
      if (dataProduct.__v) {
        delete dataProduct.__v;
      }
      // Do not update legalEntity
      if (dataProduct.legalEntity) {
        delete dataProduct.legalEntity;
      }

      _.assign(product, dataProduct);

      Product.save(product, function (err) {
        if (err) {
          return res.status(400).send({
            message: err
          });
        } else {
          res.json(product);
        }
      });
    } catch (err) {
      return res.status(400).send({
        message: err
      });
    }
  });
};

/**
 * Delete an product
 *
 * @param {object} req
 * @param {object} res
 */
exports.delete = function (req, res) {
  var product = req.product;

  Product.delete(product, function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

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
 * Search Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.search = function (req, res) {
  Product.search(req.query, function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(products);
    }
  });
};

/**
 * Import Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.import = function (req, res) {
  var type = req.query && req.query.type ? req.query.type : null;
  if (process.env.NODE_ENV == 'development' && config.debug && config.debug.logs) console.log('Begin import auto for', type);

  if (!type) {
    throw 'Unable to determine type';
  }

  Product.import(type, () => {});

  res.json({ message: 'Importing ' + type + ' flux...' });
};
