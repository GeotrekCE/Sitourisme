'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Town = mongoose.model('Town'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  ));

/**
 * Create a town
 *
 * @param {object} req
 * @param {object} res
 */
exports.create = function (req, res) {
  var town = new Town(req.body);
  town.user = req.user;

  town.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(town);
    }
  });
};

/**
 * Show the current town
 *
 * @param {object} req
 * @param {object} res
 */
exports.read = function (req, res) {
  res.json(req.town);
};

/**
 * Update a town
 *
 * @param {object} req
 * @param {object} res
 */
exports.update = function (req, res) {
  var town = req.town;

  town.title = req.body.title;
  town.content = req.body.content;

  town.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(town);
    }
  });
};

/**
 * Delete an town
 *
 * @param {object} req
 * @param {object} res
 */
exports.delete = function (req, res) {
  var town = req.town;

  town.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(town);
    }
  });
};

/**
 * List of Towns
 *
 * @param {object} req
 * @param {object} res
 */
exports.list = function (req, res) {
  Town.find()
    .sort('-created')
    .exec(function (err, towns) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(towns);
      }
    });
};

/**
 * Town middleware
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {string} id
 */
exports.townByID = function (req, res, next, id) {
  Town.findById(id).exec(function (err, town) {
    if (err) return next(err);
    if (!town) return next(new Error('Failed to load town ' + id));
    req.town = town;
    next();
  });
};

/**
 * Search Towns
 *
 * @param {object} req
 * @param {object} res
 */
exports.search = function (req, res) {
  Town.search(req.query, function (err, towns) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(towns);
    }
  });
};

/**
 * Init elasticsearch
 *
 * @param {object} req
 * @param {object} res
 */
exports.initElasticsearch = function (req, res) {
  Town.initElasticsearch(function (err, resp) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(resp);
    }
  });
};

/**
 * Import Towns
 *
 * @param {object} req
 * @param {object} res
 */
exports.import = function (req, res) {
  Town.import(function (err, resp) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(resp);
    }
  });
};

/**
 * Add event on town csv file
 */
Town.watchImportTowns(__dirname + '/../../../../../var/data/import/town.csv');
