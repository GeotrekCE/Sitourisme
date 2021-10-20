'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  fs = require('fs'),
  _ = require('lodash'),
  Elasticsearch = require(__dirname +
    '/../../../../library/elasticsearch/elasticsearch.js'),
  dataString = require(__dirname + '/../../../../library/data/manipulate.js'),
  config = require(__dirname + '/../../../../config/config.js'),
  configSitraTown = require(__dirname +
    '/../../../../config/configSitraTown.js'),
  esIndex = config.elasticsearch.index,
  esType = 'town',
  csvParse = require('csv-parse');

/**
 * Town Schema
 */
var TownSchema = new Schema({
  specialId: {
    type: String,
    default: '',
    unique: true,
    trim: true
  },
  sitraId: {
    type: Number
  },
  name: {
    type: String,
    default: '',
    required: 'Please fill Town name',
    trim: true
  },
  zipcode: {
    type: String,
    default: '',
    required: 'Please fill Town zipcode',
    trim: true
  },
  insee: {
    type: String,
    default: '',
    trim: true
  },
  population: {
    type: Number
  },
  localization: {
    lat: {
      type: Number
    },
    lon: {
      type: Number
    },
    altitude: {
      type: Number
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Index town
 *
 * @param {object} town
 * @param {function} callback
 */
TownSchema.statics.index = function (town, callback) {
  var localization = null;
  if (town.localization && town.localization.lat && town.localization.lon) {
    localization = {
      lat: town.localization.lat,
      lon: town.localization.lon
    };
  }

  // Index town in search engine
  Elasticsearch.index(
    esIndex,
    esType,
    town.id,
    {
      name: town.name,
      'name/search': __cleanIndexedName(town),
      zipcode: town.zipcode,
      insee: town.insee,
      population: town.population ? parseInt(town.population) : null,
      sitraId: town.sitraId ? parseInt(town.sitraId) : null,
      localization: localization
    },
    callback
  );
};

/**
 * Save
 *
 * @param {object} town
 * @param {function} callback
 */
TownSchema.statics.save = function (town, callback) {
  town.save(function (err) {
    if (err) {
      console.log('Error in save() : ' + err);
      console.log(town);
      if (callback) {
        callback(err);
      }
      return false;
    }

    var Town = mongoose.model('Town');
    Town.index(town, callback);
  });
};

/**
 * Do update / insert
 *
 * @param {object} datas
 * @param {string} specialId
 * @param {function} callback
 */
TownSchema.statics.doUpsert = function (datas, specialId, callback) {
  var Town = mongoose.model('Town');

  Town.find({ specialId: specialId }, function (err, docs) {
    if (err) {
      console.log('Error in doUpsert() : ' + err);
      return false;
    }

    var town = docs.length > 0 ? _.extend(docs[0], datas) : new Town(datas);

    // Save
    Town.save(town, callback);
  });
};

/**
 * Do search
 *
 * @param {object} data
 * @param {function} callback
 * @private
 */
function __doSearch(data, callback) {
  var params = {},
    query = [];

  var arrAllowFields = {
    search: 'name/search',
    name: 'name',
    zipcode: 'zipcode',
    insee: 'insee',
    population: 'population',
    sitraId: 'sitraId'
  };

  for (var pName in arrAllowFields) {
    // Prepare query
    if (arrAllowFields.hasOwnProperty(pName) && data[pName]) {
      var arrKeyword = data[pName].match(/([^ -]+)/gi),
        arrKeywordLength = arrKeyword.length,
        iTmp,
        queryCond;

      for (iTmp = 0; iTmp < arrKeywordLength; iTmp++) {
        switch (pName) {
          case 'search':
            queryCond = '*' + dataString.removeAccents(arrKeyword[iTmp]) + '*';
            break;

          default:
            queryCond = '*' + arrKeyword[iTmp] + '*';
            break;
        }

        query.push({
          query_string: {
            query: queryCond,
            fields: [arrAllowFields[pName]]
          }
        });
      }
    }
  }

  // Built query
  if (query.length) {
    params.query = {
      bool: {
        must: query
      }
    };
  }

  // Size
  params.size = data.size ? data.size : 20;
  params.from = data.from ? data.from : 0;

  params.sort = data.sort ? data.sort : { population: { order: 'desc' } };

  params._source = {
    exclude: ['name/search']
  };

  Elasticsearch.search(esIndex, esType, params, callback);
}

/**
 * Search object
 *
 * @param {object} data
 * @param {function} callback
 */
TownSchema.statics.search = function (data, callback) {
  __doSearch(data, callback);
};

/**
 * Init elasticsearch analyser and mapping
 *
 * @param {function} callback
 */
TownSchema.statics.initElasticsearch = function (callback) {
  var mapping = {
    properties: {
      name: {
        type: 'string',
        analyzer: 'standard',
        boost: 10,
        fields: {
          search: {
            type: 'string',
            analyzer: 'standard',
            boost: 10
          },
          not_analyzed: {
            type: 'string',
            index: 'not_analyzed'
          }
        }
      },
      zipcode: {
        type: 'string',
        analyzer: 'standard',
        boost: 10,
        fields: {
          not_analyzed: {
            type: 'string',
            index: 'not_analyzed'
          }
        }
      },
      insee: {
        type: 'string',
        analyzer: 'standard',
        boost: 10,
        fields: {
          not_analyzed: {
            type: 'string',
            index: 'not_analyzed'
          }
        }
      },
      sitraId: {
        type: 'integer'
      },
      population: {
        type: 'integer'
      },
      localization: {
        type: 'geo_point'
      }
    }
  };

  Elasticsearch.initMapping(esIndex, esType, mapping, function (err, resp) {
    if (err) {
      console.log('Error in elasticsearch initMapping() : ' + err);
    }

    if (callback) {
      callback(err, resp);
    }
  });
};

/**
 * Import
 *
 * @param {function} callback
 */
TownSchema.statics.import = function (callback) {
  var Town = mongoose.model('Town');

  Town.importTowns(
    __dirname + '/../../../../../var/data/import/town.csv',
    function () {
      if (callback) {
        callback(null, { status: 'Import done' });
      }
    }
  );
};

/**
 * Import towns
 *
 * @param {string} filename
 * @param {function} callback
 */
TownSchema.statics.importTowns = function (filename, callback) {
  console.log('Importing ' + filename);

  fs.exists(filename, function (exists) {
    if (!exists) {
      console.log('Error: file ' + filename + ' does not exists');
      return false;
    }

    var User = mongoose.model('User');
    User.findOne(
      {
        username: 'admin'
      },
      function (err) {
        if (!err) {
          fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
              console.log('Error: ' + err);
              return;
            }

            csvParse(data, function (err, datas) {
              if (err) {
                console.log('Error: ' + err);
                if (callback) {
                  callback(err);
                }
                return;
              }

              // Remove first line of label
              datas.shift();

              // Import datas
              __importData(datas, callback);
            });
          });
        } else {
          if (callback) {
            callback();
          }
        }
      }
    );
  });
};

/**
 * Watch import towns
 *
 * @param {string} filename
 */
TownSchema.statics.watchImportTowns = function (filename) {
  fs.exists(filename, function (exists) {
    if (!exists) {
      console.log('Error: file ' + filename + ' does not exists');
      return false;
    }

    var Town = mongoose.model('Town');
    fs.watchFile(filename, function () {
      setTimeout(Town.importTowns, 5000, filename);
    });
  });
};

/**
 * Clean indexed name
 *
 * @param {Object} town
 * @returns {String}
 * @private
 */
function __cleanIndexedName(town) {
  var name =
    town.zipcode +
    ' ' +
    dataString
      .removeAccents(town.name)
      .replace(/[\-]/g, ' ')
      .replace(/saint(e?) /gi, 'saint$1 st st$1 ');

  return name;
}

/**
 * Watch import towns
 *
 * @param {string} filename
 */
function __importData(datas, callback) {
  var Town = mongoose.model('Town'),
    datasLine;

  if (datas && datas.length) {
    datasLine = datas.shift();

    datasLine[4] = datasLine[4].replace(/[^0-9,\.]+/g, '');
    datasLine[5] = datasLine[5].replace(/[^0-9,\.]+/g, '');

    var name = datasLine[0],
      zipcode = datasLine[2],
      insee = datasLine[3],
      lat = datasLine[4] ? parseFloat(datasLine[4].replace(/,/, '.')) : null,
      lon = datasLine[5] ? parseFloat(datasLine[5].replace(/,/, '.')) : null,
      population = datasLine[6] ? datasLine[6] : null,
      specialId = zipcode + '-' + insee;

    if (zipcode.length === 4) {
      zipcode = '0' + zipcode;
    }

    if (zipcode.match(/^(04|06|07|08|09|83|98|13)/)) {
      // Built town
      var town = {
        specialId: specialId,
        name: name,
        zipcode: zipcode,
        insee: insee,
        population: population
      };
      if (lat !== null && lon !== null) {
        town.localization = {
          lat: lat,
          lon: lon
        };
      }
      if (zipcode && configSitraTown[zipcode]) {
        for (var i = 0; i < configSitraTown[zipcode].length; i++) {
          if (insee && configSitraTown[zipcode][i].insee == insee) {
            town.sitraId = configSitraTown[zipcode][i].sitraId;
            town.name = configSitraTown[zipcode][i].name;
            break;
          }
          if (configSitraTown[zipcode][i].zipcode == zipcode) {
            town.sitraId = configSitraTown[zipcode][i].sitraId;
            town.name = configSitraTown[zipcode][i].name;
            if (!insee) {
              break;
            }
          }
        }
      }
      if (town.sitraId) {
        Town.doUpsert(town, town.specialId, function () {
          __importData(datas, callback);
        });
      } else {
        setTimeout(__importData, 1, datas, callback);
      }
    } else {
      setTimeout(__importData, 1, datas, callback);
    }
  } else {
    if (callback) {
      callback();
    }
  }
}

mongoose.model('Town', TownSchema);
