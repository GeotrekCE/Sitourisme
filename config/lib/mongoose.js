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
/*module.exports.connect = function (cb) {
  mongoose.Promise = require('bluebird');
  var db = mongoose.connect(config.db, { useMongoClient: true }, (err) => {
    // Log Error
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    } else {
      // Load modules
      this.loadModels();

      // Call callback FN
      if (cb) cb(db);
    }
  });
};*/
module.exports.connect = function (cb) {
  mongoose.Promise = require('bluebird')
  console.error(chalk.green('Mongoose connect CB on ', cb))
  const db = mongoose.connect(config.db)
    .then(() => {
      this.loadModels()
    console.error(chalk.green('Mongoose Db ', db))
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
