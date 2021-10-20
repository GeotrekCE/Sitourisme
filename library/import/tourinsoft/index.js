'use strict';

var util = require('util'),
  Import = require(__dirname + '/../generic.js'),
  xml2json = require('xml2json'),
  fs = require('fs'),
  mongoose = require('mongoose');

/**
 * Class Tourinsoft
 *
 * @param {string} filename
 * @param {object} options
 * @constructor
 */
var Tourinsoft = function (filename, options) {
  this.filename = filename;
  this.user = options.user ? options.user : null;
};

util.inherits(Tourinsoft, Import);

/**
 * Reset
 *
 * @param {function} next
 */
Tourinsoft.prototype.reset = function (next) {
  fs.readFile(this.filename, 'utf8', __parseFile.bind(this, next));
};

module.exports = Tourinsoft;

/**
 * Parse file
 *
 * @param {function} next
 * @param {err} err
 * @param {string} data
 * @private
 */
function __parseFile(next, err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }

  this.index = 0;
  this.arrData = xml2json.toJson(data, {
    object: true,
    reversible: false,
    coerce: true,
    sanitize: false,
    trim: false,
    arrayNotation: false
  });

  next();
}
