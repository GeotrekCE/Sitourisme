'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  moment = require('moment'),
  csvParse = require('csv-parse');

/**
 * Class report
 *
 * @param {String} path
 * @constructor
 */
var Report = function (options) {
  options = options || {};

  var modulePath = options.pathModule
    ? options.pathModule
    : path.resolve(__dirname + '/../../../../../var/data/report');

  // Init properties
  this.path = null;
  this.module = null;
  this.report = null;

  // Csv
  this.delimiter = options.delimiter ? options.delimiter : ',';
  this.quote = options.quote ? options.quote : '"';
  this.escape = options.escape ? options.escape : '"';

  // Init properties values
  this.setPath(modulePath);
  if (options.module) {
    this.setModule(options.module);
  }
  if (options.report) {
    this.setReport(options.report);
  }
};

/**
 * Set path
 *
 * @param dir
 * @returns {Report}
 */
Report.prototype.setPath = function (dir) {
  this.path = dir;
  if (!__dirExists(this.path)) {
    __dirCreate(this.path);
  }

  return this;
};

/**
 * Set module
 *
 * @param module
 * @returns {boolean}
 */
Report.prototype.setModule = function (module) {
  module = __cleanModule(module);

  if (__dirExists(this.getModulePath(module))) {
    this.module = __cleanModule(module);

    return true;
  }

  this.module = null;

  return false;
};

/**
 * Set report
 *
 * @param report
 * @returns {boolean}
 */
Report.prototype.setReport = function (report) {
  report = __cleanReport(report);
  if (__dirExists(this.getModulePath())) {
    if (__fileExists(this.getReportPath(report))) {
      this.report = report;

      return true;
    }
  }

  this.report = null;

  return false;
};

/**
 * Get module path
 *
 * @returns {String|null}
 */
Report.prototype.getModulePath = function (module) {
  module = module || this.module;

  if (module) {
    return this.path + '/' + module;
  } else {
    return null;
  }
};

/**
 * Get report id
 *
 * @returns {String|null}
 */
Report.prototype.getReportId = function (report) {
  report = report || this.report;

  if (report) {
    return report;
  } else {
    return null;
  }
};

/**
 * Get report name
 *
 * @returns {String|null}
 */
Report.prototype.getReportName = function (report) {
  report = report || this.report;

  if (report) {
    return report + '.log';
  } else {
    return null;
  }
};

/**
 * Get report path
 *
 * @returns {String|null}
 */
Report.prototype.getReportPath = function (report) {
  report = this.getReportName(report);

  if (this.module && report) {
    return this.getModulePath() + '/' + report;
  } else {
    return null;
  }
};

/**
 * Set module
 *
 * @param module
 * @returns {boolean}
 */
Report.prototype.createModule = function (module) {
  module = __cleanModule(module);

  var modulePath = this.getModulePath(module);

  if (!__dirExists(modulePath)) {
    __dirCreate(modulePath);
  }

  return this.setModule(module);
};

/**
 * Set report
 *
 * @param report
 * @param total
 * @param data
 * @returns {boolean}
 */
Report.prototype.createReport = function (report, total, data) {
  report = __cleanReport(report + '_' + total);

  if (this.module && report) {
    fs.writeFileSync(this.getReportPath(report), data || '');

    return this.setReport(report);
  }

  return false;
};

/**
 * Set report
 *
 * @param data
 * @returns {boolean}
 */
Report.prototype.writeReport = function (data) {
  if (this.module && this.report) {
    fs.writeFileSync(this.getReportPath(), data, { flag: 'a' });
    return true;
  }
  return false;
};

/**
 * List module
 *
 * @param callback
 */
Report.prototype.listModule = function (callback) {
  var _this = this;

  fs.readdir(this.path, function (err, directories) {
    var modules = [],
      module,
      stats,
      i,
      l;

    if (!err && directories) {
      l = directories.length;
      for (i = 0; i < l; i++) {
        module = directories[i];
        try {
          stats = fs.statSync(_this.getModulePath(module));
        } catch (e) {
          stats = null;
        }

        // Is it a file ?
        if (stats.isDirectory()) {
          modules.push({
            name: module,
            lastUpdate: stats ? stats.mtime : null
          });
        }
      }
    }
    if (callback) {
      callback(err, modules);
    }
  });
};

/**
 * List module reports
 *
 * @param callback
 */
Report.prototype.listReport = function (callback) {
  var _this = this,
    modulePath = this.getModulePath();

  if (modulePath) {
    fs.readdir(modulePath, function (err, files) {
      var reports = [],
        id,
        reportName,
        total,
        stats,
        reg,
        i,
        l;

      if (!err && files) {
        l = files.length;
        for (i = 0; i < l; i++) {
          id = files[i].replace(/.log$/, '');
          try {
            stats = fs.statSync(_this.getReportPath(id));
          } catch (e) {
            stats = null;
          }

          // Is it a file ?
          if (stats && stats.isFile()) {
            if ((reg = id.match(/export_([0-9]+)_([0-9]+)$/i))) {
              reportName =
                'Export du ' +
                moment(parseInt(reg[1])).format('DD/MM/YYYY HH:mm');
              total = parseInt(reg[2]);
            } else {
              reportName = id;
              total = null;
            }

            reports.unshift({
              id: id,
              module: _this.module,
              name: reportName,
              total: total,
              created: stats.birthtime || stats.ctime,
              lastUpdate: stats.mtime
            });
          }
        }
      }
      if (callback) {
        callback(err, reports);
      }
    });
  } else {
    callback(new Error('Missing data'), {});
  }
};

/**
 * List module reports
 *
 * @param callback
 */
Report.prototype.read = function (callback) {
  var _this = this,
    options;

  if (this.module && this.report) {
    fs.readFile(this.getReportPath(), function (err, buffer) {
      if (err) {
        if (callback) {
          callback(err, {});
        }
      } else if (buffer) {
        options = {
          delimiter: _this.delimiter,
          quote: _this.quote,
          escape: _this.escape
        };

        csvParse(buffer.toString(), options, function (err, datas) {
          if (err) {
            console.log('Error: ' + err);
            if (callback) {
              callback(err, datas);
            }
            return;
          }

          if (callback) {
            callback(err, datas);
          }
        });
      } else {
        if (callback) {
          callback(err, {});
        }
      }
    });
  } else {
    callback(new Error('Missing data'), {});
  }
};

/**
 * Dir exists ?
 *
 * @param dir
 * @returns {boolean}
 * @private
 */
function __dirExists(dir) {
  try {
    // Query the entry
    var stats = fs.statSync(dir);

    // Is it a directory?
    if (stats.isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * Create dir
 *
 * @param dir
 * @returns {boolean}
 * @private
 */
function __dirCreate(dir) {
  try {
    fs.mkdirSync(dir);

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * File exists ?
 *
 * @param file
 * @returns {boolean}
 * @private
 */
function __fileExists(file) {
  try {
    // Query the entry
    var stats = fs.statSync(file);

    // Is it a file ?
    if (stats.isFile()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

/**
 * Create dir
 *
 * @param dir
 * @returns {boolean}
 * @private
 */
function __fileCreate(file, content) {
  try {
    fs.writeFileSync(file, content);

    return true;
  } catch (e) {
    return false;
  }
}

function __cleanModule(module) {
  if (module) {
    module = module.replace(/([^a-z0-9\ -_])/gi, '');
  } else {
    module = null;
  }

  return module;
}

function __cleanReport(report) {
  if (report) {
    report = report.replace(/([^a-z0-9\ -_])/gi, '');
  } else {
    report = null;
  }

  return report;
}

module.exports = Report;
