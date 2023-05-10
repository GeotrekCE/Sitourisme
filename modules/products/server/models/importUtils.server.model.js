'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const csvParse = require('csv-parse');
const _ = require('lodash');
let townPerZipcode = null,
  regionPerZipcode = null;

/**
 * Do upsert
 *
 * @param {Object} product
 * @param {String} specialId
 * @param {String} importType
 * @param {function} next
 */
exports.doUpsert = function (product, specialId, importType, next) {
  var Product = mongoose.model('Product');
console.log('import utils > doUpsert');
  Product.doUpsert(product, specialId, importType, function (err, data) {
    if (err) {
      console.log(
        'Error in doUpsert() : Upsert failed for product : ',
        product.specialId
      );
    }

    next(null, data);
  });
};

exports.findLegalEntityBySpecialIdSitra = async function (specialIdSitra) {
  const LegalEntity = mongoose.model('LegalEntity');

  return LegalEntity.findOne({ specialIdSitra }).lean();
};

exports.createLegalEntity = async function (legalEntity) {
  const LegalEntity = mongoose.model('LegalEntity');

  return LegalEntity.findOneAndUpdate(
    { specialIdSitra: legalEntity.specialIdSitra },
    legalEntity,
    { upsert: true }
  ).lean();
};

/**
 * Init town
 *
 * @param {function} callback
 */
exports.initTown = function (callback) {
  if (townPerZipcode) {
    if (callback) {
      callback(townPerZipcode);
    }
  } else {
    var filename = __dirname + '/../../../../../var/data/import/town.csv';
    fs.exists(filename, function (exists) {
      if (!exists) {
        console.log('Error: file ' + filename + ' does not exists');
        if (callback) {
          callback(townPerZipcode);
        }
        return false;
      }

      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          if (callback) {
            callback(townPerZipcode);
          }
          return;
        }

        townPerZipcode = {};
        // Create the parser
        csvParse(data, function (err, datas) {
          if (err) {
            console.log('Error: ' + err);
            if (callback) {
              callback(townPerZipcode);
            }
            return;
          }

          datas.forEach(function (data, line) {
            if (line > 0) {
              if (!townPerZipcode[data[2]]) {
                townPerZipcode[data[2]] = [];
              }
              townPerZipcode[data[2]].push({
                name: data[0],
                nameClean: data[1],
                insee: data[3],
                lat: data[4],
                lon: data[5]
              });
            }
          });

          if (callback) {
            callback(townPerZipcode);
          }
        });
      });
    });
  }
};

/**
 * Init region
 *
 * @param {function} callback
 */
exports.initRegion = function (callback) {
  if (regionPerZipcode) {
    if (callback) {
      callback(regionPerZipcode);
    }
  } else {
    var filename = __dirname + '/../../../../../var/data/region.csv';
    fs.exists(filename, function (exists) {
      if (!exists) {
        console.log('Error: file ' + filename + ' does not exists');
        if (callback) {
          callback(regionPerZipcode);
        }
        return false;
      }

      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          if (callback) {
            callback(regionPerZipcode);
          }
          return;
        }

        regionPerZipcode = {};
        // Create the parser
        csvParse(data, function (err, datas) {
          if (err) {
            console.log('Error: ' + err);
            if (callback) {
              callback(regionPerZipcode);
            }
            return;
          }

          datas.forEach(function (data, line) {
            if (line > 0) {
              regionPerZipcode[data[0]] = data[3];
            }
          });

          if (callback) {
            callback(regionPerZipcode);
          }
        });
      });
    });
  }
};

/**
 * Compare date
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
exports.compareDate = function (date1, date2) {
  if (date1 && date2) {
    return date1.toDateString() === date2.toDateString();
  } else {
    return date1 !== date2;
  }
};

/**
 * Is social network link
 *
 * @param {String} link
 * @returns {boolean}
 */
exports.isSocialNetworkLink = function (link) {
  return link.match(/facebook|tripadvisor|twitter|yelp|plus\.google/i);
};
