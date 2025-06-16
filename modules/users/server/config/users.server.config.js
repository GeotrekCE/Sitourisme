'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./config/config'))

module.exports = function (app, db) {
  // Serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });

  // Deserialize sessions
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id).select('-salt -password')
      done(null, user)
    } catch (err) {
      done(err)
    }
  });

  // Load local strategy
  require(path.join(__dirname, './strategies/local.js'))(config)

  // Add passport's middleware
  app.use(passport.initialize())
  app.use(passport.session())
}