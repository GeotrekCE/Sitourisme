'use strict';

/**
 * Class Import
 *
 * @param {object} options
 * @constructor
 */
var Import = function (data, options, operation) {
  this.arrData = data;
  this.totalData = data.length;
  this.options = options;
  this.operation = operation;
  this.iterator = 0;
};

/**
 * Start process
 *
 * @param {function} callback
 */
Import.prototype.start = function (callback) {
  this.__init(function (err) {
    if (err) {
      throw err;
    }

    if (callback) {
      callback();
    }
  });
};

/**
 * Reset data
 *
 * @param {function} next
 */
Import.prototype.reset = function (next) {
  next(null);
};

/**
 * Current data
 *
 * @param {function} next
 */
Import.prototype.current = function (next) {
  next(null, this.arrData[this.iterator++]);
};

/**
 * Init
 *
 * @param {function} callback
 * @private
 */
Import.prototype.__init = function (callback) {
  var self = this;

  this.reset(function (err) {
    if (err) {
      throw err;
    }

    self.__next(callback);
  });
};

/**
 * Next
 *
 * @param {function} callback
 * @private
 */
Import.prototype.__next = function (callback) {
  var self = this;

  this.current(function (err, data) {
    if (err) {
      throw err;
    }

    if (data) {
      __exec(self.operation, data, self.iterator, self.totalData, function () {
        self.__next(callback);
      });
    } else {
      if (callback) {
        callback(err);
      }
    }
  });
};

Import.prototype.exec = __exec;

function __exec(fncToExec, item, index, totalData, callback) {
  if (fncToExec) {
    fncToExec(item, index, totalData, function () {
      callback();
    });
  } else {
    callback();
  }
}

module.exports = Import;
