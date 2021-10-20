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
    .route('/api/products/search')
    .all(productsPolicy.isAllowed)
    .all(configureQueryRights)
    .get(products.search);

  app
    .route('/api/products/initElasticsearch')
    .all(productsPolicy.isAllowed)
    .get(products.initElasticsearch);

  app
    .route('/api/products/import')
    .all(productsPolicy.isAllowed)
    .get(products.import);

  app
    .route('/api/products/export-sitra')
    .all(productsPolicy.isAllowed)
    .get(products.exportSitra)
    .post(products.exportSitra);

  app
    .route('/api/products/export-sitra-search')
    .all(productsPolicy.isAllowed)
    .all(configureQueryRights)
    .get(products.exportSitraSearch);

  app.route('/api/products/remove-items-sitra').all(productsPolicy.isAllowed);
  // .get(products.removeFromSitra);
  // Single product routes
  app
    .route('/api/products/:productId')
    .all(productsPolicy.isAllowed)
    .get(products.read)
    .put(products.update)
    .delete(products.delete);

  // Display image for product (for image upload in local)
  app.route('/api/products/image/:imageName').get(products.getImage);

  app
    .route('/api/products/getByUrl/:productUrl')
    .all(productsPolicy.isAllowed)
    .get(products.read);

  app
    .route('/api/reindexation')
    .all(productsPolicy.isAllowed)
    .get(products.reindexation);

  // app.route('/api/check').all(productsPolicy.isAllowed).get(products.check);

  // Finish by binding the product middleware
  app
    .param('productId', products.productByID)
    .param('productUrl', products.productByUrl);
};

/**
 * MIDDLEWARE
 * if importSubType exists, we remove VAR83 from importType
 * in order to work only with importSubType data
 * because it's erase adt04 value in elasticsearch request
 * !!! This logic only works as long as only VAR83 has importSubTypes !!!
 * @param req
 * @param res
 * @param next
 */
function configureQueryRights(req, res, next) {
  if (req.query.importType && req.query.importSubType) {
    req.query.importType = req.query.importType.replace(/;?VAR83?/g, '');
  }
  return next();
}
