'use strict';

var eventsPolicy = require('../policies/events.server.policy'),
  events = require('../controllers/events.server.controller');

module.exports = function (app) {
  events.init();
  app.route('/api/events').all(eventsPolicy.isAllowed).get(events.list);

  app
    .route('/api/events/import')
    .all(eventsPolicy.isAllowed)
    .get(events.import);
};
