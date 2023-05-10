'use strict';

/**
 * Module dependencies.
 */
var productsPolicy = require('../policies/products.server.policy'),
  products = require('../controllers/products.server.controller');

module.exports = function (app) {
  // Products collection routes
  app
    .route('/api/products')
    .all(productsPolicy.isAllowed)
    .get(products.list)
    .post(products.create);

  app
    .route('/api/products/import')
    .all(productsPolicy.isAllowed)
    .get(products.import);

  // Finish by binding the product middleware
  app
    .param('productId', products.productByID)
    .param('productUrl', products.productByUrl);
};