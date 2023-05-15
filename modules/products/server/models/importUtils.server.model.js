'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require(__dirname + '/../../../../config/config.js');

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

  if (
    process.env.NODE_ENV == 'development' &&
    config.debug &&
    config.debug.logs
  )
    console.log('importuils before doUpsert = ', next);

  Product.doUpsert(product, specialId, importType, function (err, data) {
    if (
      process.env.NODE_ENV == 'development' &&
      config.debug &&
      config.debug.logs
    )
      console.log('>>> cb doUpsert');
    if (err) {
      console.log(
        'Error in doUpsert() : Upsert failed for product : ',
        product.specialId
      );
    }
    if (
      process.env.NODE_ENV == 'development' &&
      config.debug &&
      config.debug.logs
    )
      console.log('Next !');
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
