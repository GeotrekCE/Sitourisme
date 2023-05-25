'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  legalEntityName = 'LegalEntity',
  ProductFactory = require(__dirname + '/productFactory.server.model.js'),
  legalEntityFactory,
  LegalEntitySchema,
  legalEntitySchema;

/**
 * Legal Entity Schema
 * Cannot extend class ProductFactory due to node version :/
 */
// Create product factory
legalEntityFactory = new ProductFactory(legalEntityName);

// Get default product schema
legalEntitySchema = legalEntityFactory.getDefaultProductSchema();

// Set schema
legalEntityFactory.setSchema(legalEntitySchema);

// Get legal entity schema
LegalEntitySchema = legalEntityFactory.getMongooseSchema();

/**
 * Get legal entity by url
 *
 * @param {String} url
 * @param {function} callback
 */
LegalEntitySchema.statics.getByUrl =
  legalEntityFactory.getByUrl.bind(legalEntityFactory);

/**
 * Save
 *
 * @param {Object} product
 * @param {function} callback
 */
LegalEntitySchema.statics.save =
  legalEntityFactory.save.bind(legalEntityFactory);

/**
 * Clean url
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
LegalEntitySchema.statics.cleanUrl =
  legalEntityFactory.cleanUrl.bind(legalEntityFactory);

/**
 * Build url
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
LegalEntitySchema.statics.buildUrl =
  legalEntityFactory.buildUrl.bind(legalEntityFactory);

/**
 * Check phone
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
LegalEntitySchema.statics.checkPhone =
  legalEntityFactory.checkPhone.bind(legalEntityFactory);

/**
 * Check email
 *
 * @param {String} phone
 * @param {String} fieldName
 * @return {String}
 */
LegalEntitySchema.statics.checkEmail =
  legalEntityFactory.checkEmail.bind(legalEntityFactory);

/**
 * Delete
 *
 * @param {object} product
 * @param {function} callback
 */
LegalEntitySchema.statics.delete =
  legalEntityFactory.delete.bind(legalEntityFactory);

/**
 * Do update / insert
 *
 * @param {Object} datas
 * @param {String} specialId
 * @param {String} importType
 * @param {function} callback
 */
LegalEntitySchema.statics.doUpsert =
  legalEntityFactory.doUpsert.bind(legalEntityFactory);

/**
 * Export SITRA
 *
 * @param {Object} products
 * @param {Object} options
 * @param {function} callback
 */
LegalEntitySchema.statics.exportSitra =
  legalEntityFactory.exportSitra.bind(legalEntityFactory);

/**
 * Get sitra reference
 *
 * @param {Array} product
 * @returns {Object}
 */
LegalEntitySchema.statics.getSitraSubType =
  legalEntityFactory.getSitraSubType.bind(legalEntityFactory);

/**
 * Get sitra keys
 *
 * @param {Object} data
 */
LegalEntitySchema.statics.getSitraKeys =
  legalEntityFactory.getSitraKeys.bind(legalEntityFactory);

/**
 * Get sitra reference
 *
 * @param {Object} data
 */
LegalEntitySchema.statics.getSitraReference =
  legalEntityFactory.getSitraReference.bind(legalEntityFactory);

/**
 * Get status import reference
 *
 * @param {Object} data
 */
LegalEntitySchema.statics.getStatusImportReference =
  legalEntityFactory.getStatusImportReference.bind(legalEntityFactory);

/**
 * Get member reference
 *
 * @param {Object} data
 */
LegalEntitySchema.statics.getSitraMemberReference =
  legalEntityFactory.getSitraMemberReference.bind(legalEntityFactory);

/**
 * Get civility reference
 *
 * @param {Object} data
 */
LegalEntitySchema.statics.getSitraCivilityReference =
  legalEntityFactory.getSitraCivilityReference.bind(legalEntityFactory);

// Set mongoose model
legalEntityFactory.setMongooseModel(LegalEntitySchema);

// Export legal entity factory
module.exports = legalEntityFactory;
