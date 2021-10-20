'use strict';

var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  Report = require(path.resolve(__dirname + '/../models/report.server.model')),
  arrReportByClientId = {
    default: new Report()
  };

// Create the chat configuration
module.exports = function (io, socket) {
  socket
    .on('modulesEvent', function () {
      var report = __getReport();
      report.listModule(function (err, data) {
        // Emit the status event when a new socket client is connected
        socket.emit('modulesEventResponse', {
          err: err,
          idClient: data.idClient,
          data: data
        });
      });
    })
    .on('reportsEvent', function (data) {
      var report = __getReport(data.idClient);
      if (!data || !data.module || typeof data.module !== 'string') {
        data.module = null;
      }
      report.setModule(data.module);

      report.listReport(function (err, report) {
        // Emit the status event when a new socket client is connected
        socket.emit('reportsEventResponse', {
          err: err,
          idClient: data.idClient,
          module: data.module,
          data: report
        });
      });
    })
    .on('reportsEventReceived', function (data) {
      var fsWatcher,
        report = __getReport(data.idClient),
        modulePath = report.getModulePath();
      if (modulePath) {
        fsWatcher = fs.watch(modulePath, function () {
          __closeFileWatcher(fsWatcher);
          setTimeout(
            function (data) {
              var report = __getReport(data.idClient);
              if (!data || !data.module) {
                data.module = null;
              }
              report.setModule(data.module);

              report.listReport(function (err, report) {
                // Emit the status event when a new socket client is connected
                socket.emit('reportsEventResponse', {
                  err: err,
                  idClient: data.idClient,
                  module: data.module,
                  data: report
                });
              });
            },
            2000,
            data
          );
        });

        setTimeout(
          function (fsW) {
            __closeFileWatcher(fsW);
          },
          600000,
          fsWatcher
        );
      }
    })
    .on('logsEvent', function (data) {
      var report = __getReport(data.idClient);
      if (!data || !data.module || typeof data.module !== 'string') {
        data.module = null;
      }
      if (!data || !data.report || typeof data.report !== 'string') {
        data.report = null;
      }
      report.setModule(data.module);
      report.setReport(data.report);

      __reportRead(socket, report, data);
    })
    .on('logsEventReceived', function (data) {
      var fsWatcher,
        report = __getReport(data.idClient),
        reportPath = report.getReportPath();
      if (reportPath) {
        fsWatcher = fs.watch(reportPath, function () {
          __closeFileWatcher(fsWatcher);
          setTimeout(__reportRead, 2000, socket, report, data);
        });

        setTimeout(
          function (fsW) {
            __closeFileWatcher(fsW);
          },
          120000,
          fsWatcher
        );
      }
    })
    .on('error', function (err) {
      console.log('Error with socket : ', err);
    });
};

/**
 * Get report
 */
function __getReport(clientId) {
  if (clientId) {
    if (!arrReportByClientId[clientId]) {
      arrReportByClientId[clientId] = {
        report: new Report()
      };
    }
    arrReportByClientId[clientId].dateExpire = new Date().getTime() + 240000;

    return arrReportByClientId[clientId].report;
  } else {
    return arrReportByClientId.default;
  }
}

/**
 * Read report
 */
function __reportRead(socket, report, data) {
  report.read(function (err, logs) {
    // Emit the status event when a new socket client is connected
    socket.emit('logsEventResponse', {
      err: err,
      module: data.module,
      report: data.report,
      idClient: data.idClient,
      data: logs
    });
  });
}

/**
 * Close file watcher
 */
function __closeFileWatcher(fsWatcher) {
  if (fsWatcher) {
    fsWatcher.close();
  }
}

// Clear old socket
setInterval(function () {
  var tsNow = new Date().getTime();
  _.forEach(arrReportByClientId, function (data, clientId) {
    if (clientId !== 'default') {
      if (data.dateExpire < tsNow) {
        delete arrReportByClientId[clientId];
      }
    }
  });
}, 120000);
