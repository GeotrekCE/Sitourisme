'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  Report = require(path.resolve(__dirname + '/../models/report.server.model')),
  report = new Report(),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  ));

/**
 * Show the current report
 */
exports.read = function (req, res) {
  report.read(function (err, logs) {
    if (err) {
      return res.status(400).send({
        err: err,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        err: null,
        logs: logs
      });
    }
  });
};

/**
 * List of module
 */
exports.listModule = function (req, res) {
  report.listModule(function (err, modules) {
    if (err) {
      return res.status(400).send({
        err: err,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        err: err,
        modules: modules
      });
    }
  });
};

/**
 * List of module reports
 */
exports.listReport = function (req, res) {
  report.listReport(function (err, reports) {
    if (err) {
      return res.status(400).send({
        err: err,
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        err: err,
        reports: reports
      });
    }
  });
};

/**
 * Set module
 */
exports.setModule = function (req, res, next, module) {
  if (report.setModule(module)) {
    next();
  } else {
    return next(new Error('Failed to load module ' + module));
  }
};

/**
 * Set report
 */
exports.setReport = function (req, res, next, file) {
  if (report.setReport(file)) {
    next();
  } else {
    return next(new Error('Failed to load report ' + file));
  }
};
