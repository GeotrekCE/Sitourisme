'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);
  app.route('/not-found').get(core.renderNotFound);
  app.route('/fix-error').get(core.fixError);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
