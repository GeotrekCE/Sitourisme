'use strict';

/**
 * Module dependencies.
 */
var townsPolicy = require('../policies/towns.server.policy'),
  towns = require('../controllers/towns.server.controller');

module.exports = function (app) {
  // Towns collection routes
  app
    .route('/api/towns')
    .all(townsPolicy.isAllowed)
    .get(towns.list)
    .post(towns.create);

  app.route('/api/towns/search').all(townsPolicy.isAllowed).get(towns.search);

  app
    .route('/api/towns/initElasticsearch')
    .all(townsPolicy.isAllowed)
    .get(towns.initElasticsearch);

  app.route('/api/towns/import').all(townsPolicy.isAllowed).get(towns.import);

  // Single town routes
  app
    .route('/api/towns/:townId')
    .all(townsPolicy.isAllowed)
    .get(towns.read)
    .put(towns.update)
    .delete(towns.delete);

  // Finish by binding the town middleware
  app.param('townId', towns.townByID);
};
