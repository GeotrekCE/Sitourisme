'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password'
      },
      async function (username, password, done) {
        try {
          const user = await User.findOne({ username: username })

          if (!user || !user.authenticate(password)) {
            return done(null, false, {
              message: 'Invalid username or password'
            })
          }

          return done(null, user)
        } catch (err) {
          return done(err)
        }
      }
    )
  )
}
