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
 * Product middleware
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {string} id
 */
exports.productByID = function (req, res, next, id) {
  Product.findById(id).exec(function (err, product) {
    if (err) return next(err);
    if (!product) return next(new Error('Failed to load product ' + id));
    var productObj = product.toObject(),
      subType = Product.getSitraSubType(productObj),
      reference = Product.getSitraReference(productObj),
      civility = Product.getSitraCivilityReference(productObj),
      town = Product.getSitraTownReference(productObj),
      statusImport = Product.getStatusImportReference(productObj),
      member = Product.getSitraMemberReference(productObj),
      personType = Product.getSitraPersonTypeReference(productObj),
      internalCriteria = Product.getSITRAInternalCriteriaReference();

    req.product = {
      data: product,
      sitraReference: {
        subType: subType,
        ref: reference,
        civility: civility,
        town: town,
        statusImport: statusImport,
        member: member,
        personType: personType,
        internalCriteria: internalCriteria
      }
    };
    next();
  });
};

/**
 * Product middleware
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {string} url
 */
exports.productByUrl = function (req, res, next, url) {
  Product.getByUrl(url, function (err, product) {
    if (err) return next(err);
    if (!product)
      return next(new Error('Failed to load product with url ' + url));
    var productObj = product.toObject(),
      subType = Product.getSitraSubType(productObj),
      reference = Product.getSitraReference(productObj),
      town = Product.getSitraTownReference(productObj),
      statusImport = Product.getStatusImportReference(productObj);

    req.product = {
      data: product,
      sitraReference: {
        subType: subType,
        ref: reference,
        town: town,
        statusImport: statusImport
      }
    };
    next();
  });
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
  console.log('Begin import auto for', type);

  if (!type) {
    throw 'Unable to determine type';
  }

  Product.import(type, () => {});

  res.json({ message: 'Importing ' + type + ' flux...' });
};
