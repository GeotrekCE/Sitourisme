'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

module.exports = function (app, db) {
  // Serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize sessions
  passport.deserializeUser(function (id, done) {
    User.findOne(
      {
        _id: id
      },
      '-salt -password',
      function (err, user) {
        done(err, user);
      }
    );
  });

  require(path.join(__dirname, './strategies/local.js'))(config);

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());
};
