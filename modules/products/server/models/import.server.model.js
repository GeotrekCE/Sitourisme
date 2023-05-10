'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  fs = require('fs'),
  _ = require('lodash'),
  os = require('os');

/**
 * Import products
 *
 * @param {String} filename
 * @param {function} callback
 */
exports.importProducts = __importProducts;

/**
 * Import
 * @param {String} type
 * @param {function} callback
 */
exports.import = function (type, callback) {
  console.log('import server model > import');
  // import by api for regiondo and geotrek-api
  if (_.includes(['regiondo', 'geotrek-api'], type.toLowerCase())) {
    __doImportByApi(type, () => {
      if (callback) {
        callback();
      }
    });
  } else {
    // import by file
    console.log(`${__dirname}/../../../../../var/data/import/${type}/`);
    fs.readdir(
      `${__dirname}/../../../../../var/data/import/${type}/`,
      (err, files) => {
        __doImport(err, files, type, () => {
          if (callback) {
            callback();
          }
        });
      }
    );
  }
};

/**
 * Import products
 *
 * @param {String} filename
 * @param {String} type
 * @param {function} callback
 * @private
 */
function __importProducts(filename, type, callback) {
  console.log('Importing', filename);

  fs.stat(filename, function (err, stat) {
    if (err || !stat) {
      console.log('Error: file ' + filename + ' does not exists');
      return false;
    }

    var User = mongoose.model('User');
    User.findOne(
      {
        username: 'admin'
      },
      function (err, user) {
        if (!err) {
          const arrType = filename.match(
            /([a-z0-9\-]+)_?([a-z1-9]*)\.(xml|csv|geojson)$/i
          );
          let importType = arrType && arrType[1] ? arrType[1] : '';
          const lang = arrType && arrType[2] ? arrType[2].toLowerCase() : 'fr';

          // for geotrek
          if (['geotrek'].includes(type)) {
            importType = 'Generic';
          }

          const ImportClassFilename = `${__dirname}/import/${type}/import${importType}.server.model.js`;
          let ImportClass = null;
          let importObj = null;

          fs.stat(ImportClassFilename, function (err, stat) {
            if (err || !stat) {
              console.log(
                'Error in importProducts() - Type "' +
                  importType +
                  '" not found'
              );
            } else {
              ImportClass = require(ImportClassFilename);
            }

            if (ImportClass) {
              importObj = new ImportClass(filename, {
                user,
                lang,
                importType: type
              });
              importObj.start(function () {
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
          });
        } else {
          if (callback) {
            callback();
          }
        }
      }
    );
  });
}

/**
 * Import product from sql
 * @param {String} type
 * @param {function} callback
 * @private
 */
function __importProductsbyApi(type, callback) {
  console.log('xx Importing ' + type);

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

/**
 * Do import
 *
 * @param {object} err
 * @param {Array} files
 * @param {String} type
 * @param {function} callback
 * @private
 */
function __doImport(err, files, type, callback) {
  if (files && files.length) {
    var filename = files.shift();

    if (filename.match(/\.(xml|csv|geojson)/i)) {
      __importProducts(
        __dirname + '/../../../../../var/data/import/' + type + '/' + filename,
        type,
        function () {
          console.log('Import done for ' + filename + os.EOL);
          __doImport(err, files, type, callback);
        }
      );
    } else {
      __doImport(err, files, type, callback);
    }
  } else {
    if (callback) {
      callback(null, { status: 'Import done ' });
    }
  }
}

function __doImportByApi(type, callback) {
  __importProductsbyApi(type, callback);
}

/**
 * Remove product
 *
 * @param products
 * @param {function} callback
 */
function __removeProduct(products, callback) {
  if (products.length > 0) {
    var Product = mongoose.model('Product'),
      product = products.shift();

    Product.delete(product, function (err) {
      if (err) {
        console.log('Error in __removeProduct() : ' + err);
      } else {
        console.log(" -> suppression Mongo de l'id : " + product.specialId);
      }
      __removeProduct(products, callback);
    });
  } else {
    if (callback) {
      callback();
    }
  }
}
