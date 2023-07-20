'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  http = require('http'),
  https = require('https'),
  request = require('request'),
  _ = require('lodash'),
  ImportModel = require(__dirname + '/import.server.model.js'),
  productName = 'Product',
  ProductFactory = require(__dirname + '/productFactory.server.model.js'),
  config = require(__dirname + '/../../../../config/config.js'),
  productFactory,
  ProductSchema,
  productSchema,
  tokenPerMemberId = {},
  legalEntityFactory = require(__dirname + '/legalEntity.server.model.js');

/**
 * Product Schema
 * Cannot extend class ProductFactory due to node version :/
 */
// Create product factory
productFactory = new ProductFactory(productName);

// Get default product schema
productSchema = productFactory.getDefaultProductSchema();

// Add specific fields
// Legal entities
productSchema.legalEntity = [
  {
    type: {
      type: String,
      required: 'Please fill product import type for Legal Entity',
      trim: true
    },
    product: {
      type: Schema.ObjectId,
      ref: legalEntityFactory.getName()
    }
  }
];
// Update url - required
productSchema.url = {
  type: String,
  default: '',
  unique: true,
  required: 'Please fill url',
  trim: true
};

// Set schema
productFactory.setSchema(productSchema);

// Get product schema
ProductSchema = productFactory.getMongooseSchema();

/**
 * Get product by url
 *
 * @param {String} url
 * @param {function} callback
 */
ProductSchema.statics.getByUrl = productFactory.getByUrl.bind(productFactory);

/**
 * Save
 *
 * @param {Object} product
 * @param {function} callback
 */
ProductSchema.statics.save = function (product, callback) {
  var LegalEntity = mongoose.model('LegalEntity');

  (function recursiveInsert(legalEntities, callback, newLegalEntities) {
    if (!newLegalEntities) {
      newLegalEntities = [];
    }

    if (legalEntities && legalEntities.length) {
      var legalEntity = legalEntities.shift();

      if (
        legalEntity &&
        _.isObject(legalEntity.product) &&
        legalEntity.product.name
      ) {
        var legalEntityObject = legalEntity.product.toObject();
        if (legalEntityObject._id) {
          delete legalEntityObject._id;
        }
        if (
          !legalEntityObject.address ||
          !legalEntityObject.address.city ||
          !legalEntityObject.address.insee
        ) {
          legalEntityObject.address = product.address;
        }
        LegalEntity.doUpsert(
          legalEntityObject,
          legalEntityObject.specialId,
          product.importType,
          function (err, newLegalEntity) {
            if (err) {
              console.error(
                'Error in doUpsert() : Upsert failed for legalEntity : ',
                legalEntityObject.specialId
              );
              console.error(err);
            } else {
              legalEntity.product = newLegalEntity;
              newLegalEntities.push(legalEntity);
            }

            recursiveInsert(legalEntities, callback, newLegalEntities);
          }
        );
      } else {
        newLegalEntities.push(legalEntity);

        recursiveInsert(legalEntities, callback, newLegalEntities);
      }
    } else {
      product.legalEntity = newLegalEntities;
      if (callback) {
        callback(null);
      }
    }
  })(product.legalEntity, function (err) {
    if (err) {
      if (callback) {
        callback(err, null);
      }
    } else {
      productFactory.save(product, function (err) {
        var Product = mongoose.model(productName);
        callback();
      });
    }
  });
};

/**
 * Build url
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
ProductSchema.statics.buildUrl = productFactory.buildUrl.bind(productFactory);

/**
 * Clean url
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
ProductSchema.statics.cleanUrl = productFactory.cleanUrl.bind(productFactory);

/**
 * Check phone
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
ProductSchema.statics.checkPhone =
  productFactory.checkPhone.bind(productFactory);

/**
 * Check email
 *
 * @param {String} email
 * @param {String} fieldName
 * @return {String}
 */
ProductSchema.statics.checkEmail =
  productFactory.checkEmail.bind(productFactory);

/**
 * Delete
 *
 * @param {object} product
 * @param {function} callback
 */
ProductSchema.statics.delete = function (product, callback) {
  productFactory.delete(product, function (err) {
    var Product = mongoose.model(productName);
    Product.indexDelete(product, callback);
  });
};

/**
 * Do update / insert
 *
 * @param {Object} datas
 * @param {String} specialId
 * @param {String} importType
 * @param {function} callback
 */
ProductSchema.statics.doUpsert = function (
  datas,
  specialId,
  importType,
  callback
) {
  const Product = mongoose.model('Product');
  const LegalEntity = mongoose.model('LegalEntity');
  Product.find({ specialId, importType }, function (err, docs) {
    if (err) {
      console.log('Error in doUpsert() : ' + err);
      if (callback) {
        callback(err);
      }
    } else {
      if (datas.legalEntity && datas.legalEntity.length) {
        _.forEach(datas.legalEntity, function (legalEntity, ind) {
          if (legalEntity.product && !legalEntity.product._id) {
            datas.legalEntity[ind].product = new LegalEntity(
              legalEntity.product
            );
          }
        });
      }

      var product =
        docs.length > 0 ? _.extend(docs[0], datas) : new Product(datas);

      // Save
      Product.save(product, callback);
    }
  });
};

/**
 * Export SITRA
 *
 * @param {Object} products
 * @param {Object} options
 * @param {function} callback
 */
ProductSchema.statics.exportSitra =
  productFactory.exportSitra.bind(productFactory);

/**
 * Export SITRA
 *
 * @param {Object} products
 * @param {Object} options
 * @param {function} callback
 */
ProductSchema.statics.exportSitraAuto =
  productFactory.exportSitraAuto.bind(productFactory);

/**
 * removeFromSitra
 * @type {()}
 */
/* ProductSchema.statics.removeFromSitra = productFactory.removeFromSitra.bind(
  productFactory
); */

/**
 * removeFromSitra
 * @type {()}
 */
ProductSchema.statics.removeProductInSitra =
  productFactory.removeProductInSitra.bind(productFactory);

/**
 * Get sitra reference
 *
 * @param {Array} product
 * @returns {Object}
 */
ProductSchema.statics.getSitraSubType =
  productFactory.getSitraSubType.bind(productFactory);

/**
 * Get sitra keys
 *
 * @param {Object} data
 */
ProductSchema.statics.getSitraKeys =
  productFactory.getSitraKeys.bind(productFactory);

/**
 * Get sitra reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getSitraReference =
  productFactory.getSitraReference.bind(productFactory);

/**
 * Get status import reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getStatusImportReference =
  productFactory.getStatusImportReference.bind(productFactory);

/**
 * Get member reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getSitraMemberReference =
  productFactory.getSitraMemberReference.bind(productFactory);

/**
 * Get sitra personType reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getSitraPersonTypeReference =
  productFactory.getSitraPersonTypeReference.bind(productFactory);

/**
 * Get civility reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getSitraCivilityReference =
  productFactory.getSitraCivilityReference.bind(productFactory);

/**
 * Get civility reference
 *
 * @param {Object} data
 */
ProductSchema.statics.getSITRAInternalCriteriaReference =
  productFactory.getSITRAInternalCriteriaReference.bind(productFactory);

/**
 * Import
 *
 * @param {String} type
 * @param {String} instance
 * @param {function} callback
 */
ProductSchema.statics.import = function (type, instance, callback) {
  if (config.debug && config.debug.logs)
    console.log('ProductSchema.statics.import');
  ImportModel.import(type, instance, callback);
};

/**
 * export privateData after saving exported product of importType
 */
ProductSchema.post('save', function (product, next) {
  if (product.specialIdSitra && product.privateData) {
    __getSitraToken(product, function (err, accessToken) {
      if (err) {
        return null;
      } else if (!accessToken) {
        console.log('===================================================');
        console.log(
          'Unabled to export privateData for APIDAE Object "',
          product.specialIdSitra,
          '" : Accesstoken invalid.'
        );
        console.log('===================================================');
        return null;
      } else {
        var privateData = JSON.parse(product.privateData);
        privateData['objetsTouristiques'][0]['id'] = product.specialIdSitra;

        privateData = JSON.stringify(privateData);

        const { host, path } = config.sitra.privateData;

        return request(
          {
            url: `http://${host}${path}`,
            method: 'PUT',
            formData: { donneesPrivees: privateData },
            json: true,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          },
          function (err, httpResponse, body) {
            if (err) {
              console.log(
                '==================================================='
              );
              console.log('Error export privateData', err);
              console.log(
                '==================================================='
              );
              return null;
            }
            /*console.log('=================');
            console.log('Export privateData result: ', body);
            console.log('=================');*/
            return null;
          }
        );
      }
    });
  }

  next();
});

// Set mongoose model
productFactory.setMongooseModel(ProductSchema);

// Export product factory
module.exports = productFactory;

/**
 *
 * @param product
 * @param callback
 * @private
 */
function __getSitraToken(product, callback) {
  console.log('>>>>>>>>>>>>>>> ProductSchema. __getSitraToken ');
  var memberId = product.member ? product.member : '-',
    configAuth = config.sitra.auth.accessPerMemberId,
    access =
      configAuth && configAuth[memberId]
        ? configAuth[memberId]
        : configAuth['-'],
    now = new Date().getTime(),
    expire = now + 15 * 60 * 1000,
    options = {
      host: config.sitra.auth.host,
      path: config.sitra.auth.path,
      port: '80',
      auth: access.user + ':' + access.pass,
      headers: {
        Accept: 'application/json'
      }
    };

  if (tokenPerMemberId[memberId] && tokenPerMemberId[memberId].expire > now) {
    if (callback) {
      callback(
        null,
        tokenPerMemberId[memberId].accessToken,
        tokenPerMemberId[memberId].data
      );
    }
  } else {
    var req = http.request(options, function (response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
        var data;

        try {
          data = JSON.parse(str);
        } catch (err) {
          data = null;
        }

        var accessToken = data ? data.access_token : null;

        tokenPerMemberId[memberId] = {
          accessToken: accessToken,
          data: data,
          expire: expire
        };
        if (callback) {
          callback(null, accessToken, data);
        }
      });
    });

    req.end();
  }
}
