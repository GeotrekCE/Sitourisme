'use strict';

/**
 * Module dependencies.
 */
var elasticsearch = require('elasticsearch');

// Connect to localhost:9200 and use the default settings
var client = new elasticsearch.Client({
  apiVersion: '2.4'
});

/**
 * Check is index exists or not
 */
exports.indexExists = function (esIndex, callback) {
  client.indices.exists(
    {
      index: esIndex,
      ignore: [404]
    },
    function (err, exists) {
      if (callback) {
        callback(err, exists);
      }
    }
  );
};

/**
 * Close index
 */
exports.indexClose = function (esIndex, callback) {
  client.indices.close(
    {
      index: esIndex,
      ignore: [404]
    },
    function (err, resp) {
      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Open index
 */
exports.indexOpen = function (esIndex, callback) {
  client.indices.open(
    {
      index: esIndex,
      ignore: [404]
    },
    function (err, exists) {
      if (callback) {
        callback(err, exists);
      }
    }
  );
};

/**
 * Create index
 */
exports.indexCreate = function (esIndex, obj, callback) {
  client.indices.create(
    {
      index: esIndex,
      body: obj
    },
    function (err, resp) {
      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Delete index
 */
exports.indexDelete = function (esIndex, callback) {
  client.indices.delete(
    {
      index: esIndex,
      ignore: [404]
    },
    function (err, resp) {
      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Set index setting
 */
exports.indexSetSettings = function (esIndex, obj, callback) {
  client.indices.putSettings(
    {
      index: esIndex,
      body: obj
    },
    function (err, resp) {
      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Check is type exists or not
 */
exports.typeExists = function (esIndex, esType, callback) {
  client.indices.existsType(
    {
      index: esIndex,
      type: esType
    },
    function (err, exists) {
      if (callback) {
        callback(err, exists);
      }
    }
  );
};

/**
 * Create mapping
 */
exports.mappingCreate = function (esIndex, esType, obj, callback) {
  client.indices.putMapping(
    {
      index: esIndex,
      type: esType,
      body: obj
    },
    function (err, resp) {
      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Delete mapping
 */
exports.mappingDelete = function (esIndex, esType, callback) {
  this.indexClose(esIndex, function (err) {
    if (err) {
      console.log(
        'Error in elasticsearch mappingDelete() : indexClose() ' + err
      );
    }

    client.indices.deleteMapping(
      {
        index: esIndex,
        type: esType
      },
      function (err, resp) {
        if (err) {
          console.log(
            'Error in elasticsearch mappingDelete() : indexClose() ' + err
          );
        }

        if (callback) {
          callback(err, resp);
        }
      }
    );
  });
};

/**
 * Index object
 */
exports.index = function (esIndex, esType, id, obj, callback) {
  client.index(
    {
      index: esIndex,
      type: esType,
      id: id,
      body: obj
    },
    function (err, resp) {
      if (err) {
        console.log('Error in elasticsearch index() : ' + err);
      }

      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Delete object
 */
exports.delete = function (esIndex, esType, id, callback) {
  client.delete(
    {
      index: esIndex,
      type: esType,
      id: id
    },
    function (err, resp) {
      if (err) {
        console.log('Error in elasticsearch delete() : ' + err);
      }

      if (callback) {
        callback(err, resp);
      }
    }
  );
};

/**
 * Search object
 */
exports.search = function (esIndex, esType, params, callback) {
  client.search(
    {
      index: esIndex,
      type: esType,
      body: params
    },
    function (err, exists) {
      if (callback) {
        callback(err, exists);
      }
    }
  );
};

/**
 * Init analyser
 */
exports.initAnalyser = function (esIndex, obj, callback) {
  var _this = this;

  this.indexExists(esIndex, function (err, exists) {
    if (err) {
      console.log(
        'Error in elasticsearch initAnalyser() - indexExists() : ' + err
      );
    }

    if (exists) {
      _this.indexDelete(esIndex, function (err) {
        if (err) {
          console.log(
            'Error in elasticsearch initAnalyser() : indexDelete() ' + err
          );
        }

        _this.indexCreate(esIndex, obj, callback);
      });
    } else {
      _this.indexCreate(esIndex, obj, callback);
    }
  });
};

/**
 * Init analyser
 */
exports.initMapping = function (esIndex, esType, obj, callback) {
  var _this = this;

  console.log('===================================================');
  console.log('esIndex', esIndex);
  console.log('esType', esType);

  this.typeExists(esIndex, esType, function (err, exists) {
    if (err) {
      console.log(
        'Error in elasticsearch initMapping() - typeExists() : ' + err
      );
    }

    console.log('exists', exists);
    console.log('===================================================');

    if (exists) {
      _this.mappingDelete(esIndex, esType, function (err) {
        if (err) {
          console.log(
            'Error in elasticsearch initMapping() : mappingDelete() ' + err
          );
        }

        _this.mappingCreate(esIndex, esType, obj, function (err) {
          if (err) {
            console.log(
              'Error in elasticsearch initMapping() : mappingCreate() ' + err
            );
          }

          _this.indexOpen(esIndex, callback);
        });
      });
    } else {
      // _this.indexClose(esIndex, function (err) {
      // 	if (err) {
      // 		console.log('Error in elasticsearch initMapping() : indexClose() ' + err);
      // 	}

      _this.mappingCreate(esIndex, esType, obj, function (err) {
        if (err) {
          console.log(
            'Error in elasticsearch initMapping() : mappingCreate() ' + err
          );
        }

        _this.indexOpen(esIndex, callback);
      });
      // });
    }
  });
};
