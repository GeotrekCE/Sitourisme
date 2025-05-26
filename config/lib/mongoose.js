'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
  chalk = require('chalk'),
  path = require('path'),
  mongoose = require('mongoose');

// Load the mongoose models
module.exports.loadModels = function () {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });
};

// Initialize Mongoose

module.exports.connect = function (cb) {
  mongoose.Promise = require('bluebird')
  const db = mongoose.connect(config.db)
    .then(() => {
      this.loadModels()
      if (cb) cb(db)
    })
    .catch((err) => {
      console.error(chalk.red('Could not connect to MongoDB!'))
      console.log(err)
    })
}

module.exports.disconnect = function (cb) {
  mongoose.disconnect(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    cb(err);
  });
};
