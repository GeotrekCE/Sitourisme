'use strict';

/**
 * Module dependencies.
 */
var reportsPolicy = require('../policies/reports.server.policy'),
  reports = require('../controllers/reports.server.controller');

module.exports = function (app) {
  // Reports collection routes
  app
    .route('/api/reports')
    .all(reportsPolicy.isAllowed)
    .get(reports.listModule);

  // Reports collection routes
  app
    .route('/api/reports/:module')
    .all(reportsPolicy.isAllowed)
    .get(reports.listReport);

  // Single report routes
  app
    .route('/api/reports/:module/:report')
    .all(reportsPolicy.isAllowed)
    .get(reports.read);

  // Finish by binding the report middleware
  app.param('module', reports.setModule).param('report', reports.setReport);
};
