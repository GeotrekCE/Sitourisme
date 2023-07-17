'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  _ = require('lodash');

/**
 * Import
 * @param {String} type
 * @param {String} instance
 * @param {function} callback
 */
exports.import = function (type, instance, callback) {
  console.log('> import.server.model ', type, instance);
  __importProductsbyApi(type, instance, () => {
    if (callback) {
      callback();
    }
  });
};

/**
 * Import product from sql
 * @param {String} type
 * @param {String} instance
 * @param {function} callback
 * @private
 */
function __importProductsbyApi(type, instance, callback) {
  var User = mongoose.model('User');
  User.findOne({
    username: 'admin'
  }).then(function (err, user) {
    if (!err) {
      const ImportClassFilename =
        __dirname + '/import/' + type + '/importGeneric.server.model.js';
      let ImportClass = require(ImportClassFilename);
      let importObj = null;

      if (ImportClass) {
        importObj = new ImportClass({
          user: user,
          lang: 'fr',
          importType: type,
          importInstance: instance
        });

        importObj.start(() => {
          if (callback) {
            callback();
          }
          importObj = ImportClass = null;
        });
      } else {
        if (callback) {
          callback();
        }
      }
    } else {
      if (callback) {
        callback();
      }
    }
  });
}
