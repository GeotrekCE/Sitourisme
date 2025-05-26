'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = async function (req, res, next, id) {
  try {
    const user = await User.findOne({ _id: id })

    if (!user) {
      return next(new Error('Failed to load User ' + id))
    }

    req.profile = user
    next()
  } catch (err) {
    next(err)
  }
}
