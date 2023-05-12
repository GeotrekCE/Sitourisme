'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  _ = require('lodash');

/**
 * Import
 * @param {String} type
 * @param {function} callback
 */
exports.import = function (type, callback) {
  __importProductsbyApi(type, () => {
    if (callback) {
      callback();
    }
  });
};

/**
 * Import product from sql
 * @param {String} type
 * @param {function} callback
 * @private
 */
function __importProductsbyApi(type, callback) {
  var User = mongoose.model('User');
  User.findOne(
    {
      username: 'admin'
    },
    (err, user) => {
      if (!err) {
        const ImportClassFilename =
          __dirname + '/import/' + type + '/importGeneric.server.model.js';
        let ImportClass = require(ImportClassFilename);
        let importObj = null;

        if (ImportClass) {
          importObj = new ImportClass({
            user: user,
            lang: 'fr',
            importType: type
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
    }
  );
}

