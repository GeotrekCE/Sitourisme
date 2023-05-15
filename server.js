/**
 * Module dependencies.
 */
var config = require('./config/config'),
  mongoose = require('./config/lib/mongoose'),
  express = require('./config/lib/express');

// Initialize mongoose
mongoose.connect(function (db) {
  // Initialize express
  var app = express.init(db);

  // Start the app by listening on <port>
  app.listen(config.port);

  // Logging initialization
  console.log(
    `Geotrek 2 Apidae application started on port ${config.port} on ${process.env.NODE_ENV} environment`
  );
});
