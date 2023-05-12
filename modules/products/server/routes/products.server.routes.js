'use strict';

var productsPolicy = require('../policies/products.server.policy'),
  products = require('../controllers/products.server.controller');

module.exports = function (app) {
  app
    .route('/api/products')
    .all(productsPolicy.isAllowed)
    .get(products.list)
    .post(products.create);

  app
    .route('/api/products/import')
    .all(productsPolicy.isAllowed)
    .get(products.import);
};