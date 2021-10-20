'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  Town = mongoose.model('Town'),
  LegalEntity = mongoose.model('LegalEntity'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  )),
  Iterator = require(path.resolve(
    './modules/core/server/patterns/iterator.server.patterns'
  )),
  Report = require(path.resolve(
    './modules/reports/server/models/report.server.model'
  )),
  fs = require('fs'),
  json2csv = require('json2csv'),
  _ = require('lodash'),
  reportModule = 'products',
  csvStringify = require('csv-stringify');

exports.reindexation = function (req, res) {
  var totalIter,
    step = 100;

  console.log('===================================================');
  console.log('réindexation lancée');
  console.log('===================================================');

  res.json({
    message: 'Réindexation lancée... Veuillez patienter... longtemps !'
  });

  Product.find({}).count({}, function (err, value) {
    if (err) {
      console.error('err', err);
    } else {
      if (typeof value === 'number') {
        totalIter = value;

        Product.initElasticsearch(function (err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            Town.initElasticsearch(function (err) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                Town.import(function (err, resp) {
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    console.log(
                      '==================================================='
                    );
                    console.log('Import des villes terminé');
                    console.log(
                      '==================================================='
                    );
                    (function recurse(iter) {
                      iter = iter != null ? iter : 0;

                      console.log(iter * step, ' sur ', totalIter);

                      Product.find({})
                        .limit(step)
                        .skip(iter * step)
                        .exec(function (err, products) {
                          if (err) {
                            return res.status(400).send({
                              message: errorHandler.getErrorMessage(err)
                            });
                          } else {
                            var iteratorItem = new Iterator(products);

                            iteratorItem.operation = function (
                              item,
                              itemIndex,
                              totalItems,
                              next
                            ) {
                              Product.index(item, function (err) {
                                if (err) {
                                  console.error('err', err);
                                }
                                typeof next === 'function' && next();
                              });
                            };

                            iteratorItem.start(function () {
                              iter++;
                              if (iter * step < totalIter) {
                                recurse(iter);
                              } else {
                                console.log(
                                  '==================================================='
                                );
                                console.log(
                                  'Reindexation : END - ' +
                                    totalIter +
                                    ' items indexed.'
                                );
                                console.log(
                                  '==================================================='
                                );
                              }
                            });
                          }
                        });
                    })();
                  }
                });
              }
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'typeof totalIter incorrect'
        });
      }
    }
  });
};

/**
 * Create a product
 *
 * @param {object} req
 * @param {object} res
 */
exports.create = function (req, res) {
  var product = new Product(req.body);
  product.user = req.user;

  product.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * Show the current product
 *
 * @param {object} req
 * @param {object} res
 */
exports.read = function (req, res) {
  res.json(req.product);
};

/**
 * Update a product
 *
 * @param {object} req
 * @param {object} res
 */
exports.update = function (req, res) {
  var product = req.product.data,
    dataProduct,
    str = '';

  req.on('data', function (chunk) {
    str += chunk;
  });

  req.on('end', function () {
    try {
      dataProduct = JSON.parse(str);
      if (dataProduct.__v) {
        delete dataProduct.__v;
      }
      // Do not update legalEntity
      if (dataProduct.legalEntity) {
        delete dataProduct.legalEntity;
      }

      _.assign(product, dataProduct);

      Product.save(product, function (err) {
        if (err) {
          return res.status(400).send({
            message: err
          });
        } else {
          res.json(product);
        }
      });
    } catch (err) {
      return res.status(400).send({
        message: err
      });
    }
  });
};

/**
 * Delete an product
 *
 * @param {object} req
 * @param {object} res
 */
exports.delete = function (req, res) {
  var product = req.product;

  Product.delete(product, function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(product);
    }
  });
};

/**
 * List of Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.list = async function (req, res) {
  try {
    const products = await Product.find({}).sort('-created').lean();
    return res.json(products);
  } catch (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Export sitra
 *
 * @param {object} req
 * @param {object} res
 */
exports.exportSitra = function (req, res) {
  var strId = '',
    report,
    total;

  req.on('data', function (chunk) {
    console.log('chunk', chunk);
    strId += chunk;
  });

  req.on('end', function () {
    try {
      var arrId = strId ? strId.split(',') : [];

      console.log(`Demande d'export pour arrId=${arrId} et strId=${strId}`);

      Product.find({ _id: { $in: arrId } }).exec(function (err, products) {
        if (err) {
          return res.status(400).send({
            message: err
          });
        } else {
          total = products.length;

          console.log(`Debut de l'export manuel pour ${total} fiches!`);

          report = new Report();
          report.createModule(reportModule);
          report.createReport('export_' + new Date().getTime(), total);

          Product.exportSitra(products, { report: report }, function (err) {
            if (err && err.error400) {
              return res.status(400).send({
                message: err
              });
            }

            console.log("fin de l'export manuel");

            res.json({
              err: null,
              data: {
                module: reportModule,
                report: report.getReportId()
              }
            });
          });
        }
      });
    } catch (err) {
      return res.status(400).send({
        message: err
      });
    }
  });
};

/**
 * call APIDAE's API in order to delete items
 * specified by there specialIdSitra in resquest
 * @param req
 * @param res
 */
// SUPPRESSION APIDAE MANUEL : désactiver pour le moment
/* exports.removeFromSitra = function(req, res) {
  Product.removeFromSitra(req.query, function(err, result) {
    var report = new Report();
    if (err) {
      result = err;
    }
    report.createModule(reportModule);
    report.createReport(
      "export_" + new Date().getTime(),
      1
    );

    csvStringify(
      [
        [
          new Date(),
          req.query.id,
          req.query.name,
          result,
          req.query.specialIdSitra ? req.query.specialIdSitra : "",
          err ? err.info : "",
          err ? err.errMessage : "",
          "",
          "",
          "",
          req.query.member,
          "MANUEL"
        ]
      ],
      function(err, str) {
        report.writeReport(str);
        return res.json({
          err: err,
          data: {
            module: reportModule,
            report: report.getReportId()
          }
        });
      }
    );
  });
};
*/

/**
 * Export sitra search
 *
 * @param {object} req
 * @param {object} res
 */
exports.exportSitraSearch = function (req, res) {
  var query = req.query,
    limit = 100,
    from = 0;

  __exportSitra(query, limit, from, function (err, datas) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      res.json(datas);
    }
  });
};

exports.getImage = function (req, res) {
  if (req.params && req.params.imageName) {
    fs.readFile(
      path.resolve('public') + '/../../var/data/image/' + req.params.imageName,
      function (err, data) {
        if (err) {
          res.status(500);
        } else {
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data);
        }
      }
    );
  } else {
    res.status(400);
  }
};

/**
 * Product middleware
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {string} id
 */
exports.productByID = function (req, res, next, id) {
  Product.findById(id).exec(function (err, product) {
    if (err) return next(err);
    if (!product) return next(new Error('Failed to load product ' + id));
    var productObj = product.toObject(),
      subType = Product.getSitraSubType(productObj),
      reference = Product.getSitraReference(productObj),
      civility = Product.getSitraCivilityReference(productObj),
      town = Product.getSitraTownReference(productObj),
      statusImport = Product.getStatusImportReference(productObj),
      member = Product.getSitraMemberReference(productObj),
      personType = Product.getSitraPersonTypeReference(productObj),
      internalCriteria = Product.getSITRAInternalCriteriaReference();

    req.product = {
      data: product,
      sitraReference: {
        subType: subType,
        ref: reference,
        civility: civility,
        town: town,
        statusImport: statusImport,
        member: member,
        personType: personType,
        internalCriteria: internalCriteria
      }
    };
    next();
  });
};

/**
 * Product middleware
 *
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @param {string} url
 */
exports.productByUrl = function (req, res, next, url) {
  Product.getByUrl(url, function (err, product) {
    if (err) return next(err);
    if (!product)
      return next(new Error('Failed to load product with url ' + url));
    var productObj = product.toObject(),
      subType = Product.getSitraSubType(productObj),
      reference = Product.getSitraReference(productObj),
      town = Product.getSitraTownReference(productObj),
      statusImport = Product.getStatusImportReference(productObj);

    req.product = {
      data: product,
      sitraReference: {
        subType: subType,
        ref: reference,
        town: town,
        statusImport: statusImport
      }
    };
    next();
  });
};

/**
 * Search Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.search = function (req, res) {
  Product.search(req.query, function (err, products) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(products);
    }
  });
};

/**
 * Init elasticsearch
 *
 * @param {object} req
 * @param {object} res
 */
exports.initElasticsearch = function (req, res) {
  Product.initElasticsearch(function (err, resp) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(resp);
    }
  });
};

/**
 * Import Products
 *
 * @param {object} req
 * @param {object} res
 */
exports.import = function (req, res) {
  var type = req.query && req.query.type ? req.query.type : null;
  console.log('Begin import auto for', type);

  if (!type) {
    throw 'Unable to determine type';
  }

  Product.import(type, () => {
    if (['geotrek', 'regiondo'].includes(type) && type !== 'geotrek-api') {
      console.error('End import auto for', type);
      // création du fichier de rapport
      const report = new Report();
      report.createModule(reportModule);
      report.createReport(`export_${new Date().getTime()}`, 1);
      const options = {
        report,
        exportType: 'AUTO'
      };
      //suppression dans mongo + APIDAE
      console.log('removeProduct in APIDAE / MONGO');
      __removeProductDeleted(type, options, () => {
        //export auto vers SITRA
        console.log('exportAuto');
        Product.exportSitraAuto(type, options, () => {
          console.log('end of export sitra auto!');
        });
      });
    }
  });

  res.json({ message: 'Importing ' + type + ' flux...' });
};

function __removeProductDeleted(type, options, callback) {
  console.log('debut de la fonction __removeProductDeleted');
  Product.find({
    importType: type.toUpperCase(),
    deleted: { $exists: true, $ne: null },
    statusImport: { $ne: 3 }
  }).exec(function (err, docs) {
    if (err) {
      if (callback) {
        callback(err);
      }
    } else {
      var total = docs.length;
      console.log('total à supprimer', total);
      if (docs && total > 0) {
        if (total > 1300) {
          console.log('Trop de produits à supprimer : ' + total);
          console.log('=======');
          console.dir(
            docs.map((doc) => doc.name),
            { depth: null }
          );
          console.log('=======');
        } else {
          for (
            var itemsProcessed = 0;
            itemsProcessed < docs.length;
            itemsProcessed++
          ) {
            const doc = docs[itemsProcessed];
            Product.removeProductInSitra(doc, function (err, result) {
              // on ne veut pas avoir le rapport des objets qui n'étaient pas présents dans APIDAE
              if (doc && doc.statusImport === 2) {
                csvStringify(
                  [
                    [
                      new Date(),
                      doc.id,
                      doc.name,
                      result,
                      doc.specialIdSitra ? doc.specialIdSitra : '',
                      err ? err.info : '',
                      err ? err.errMessage : '',
                      '',
                      '',
                      '',
                      doc.member,
                      'AUTO',
                      'SUPPRESSION'
                    ]
                  ],
                  function (err2, str) {
                    if (!err2 && str) {
                      options.report.writeReport(str);
                    }
                  }
                );
              }
            });
          }
        }
        callback();
      } else {
        console.log('Aucun produit à supprimer');
        if (callback) {
          callback();
        }
      }
    }
  });
}

/**
 * Export sitra recursive
 *
 * @param {Object} query
 * @param {Integer} limit
 * @param {Integer} from
 * @param {function} callback
 * @param {Object} finalData
 * @param {Object} report
 * @private
 */
function __exportSitra(query, limit, from, callback, finalData, report) {
  var total = 0,
    arrId,
    i;

  if (!finalData) {
    finalData = {};
  }

  query.size = limit;
  query.from = from;
  Product.search(query, function (err, products) {
    if (err) {
      if (callback) {
        callback(err);
      }
    } else {
      arrId = [];
      if (products.hits && products.hits.total && products.hits.hits) {
        total = products.hits.total;
        for (i = 0; i < products.hits.hits.length; i++) {
          arrId.push(products.hits.hits[i]._id);
        }
      }
      if (arrId.length) {
        if (!report) {
          report = new Report();
          report.createModule(reportModule);
          report.createReport('export_' + new Date().getTime(), total);

          if (callback) {
            callback(null, {
              err: null,
              data: {
                module: reportModule,
                report: report.getReportId()
              }
            });
            callback = null;
          }
        }

        Product.find({
          _id: { $in: arrId },
          statusImport: { $in: [1, 2] }
        }).exec(function (err, products) {
          if (err) {
            if (callback) {
              callback(err);
            }
          } else {
            Product.exportSitra(products, { report: report }, function (datas) {
              if (datas) {
                _.assign(finalData, datas);
              }

              from += limit;
              if (from < total) {
                __exportSitra(query, limit, from, callback, finalData, report);
              } else {
                if (callback) {
                  callback(null, datas);
                }
              }
            });
          }
        });
      } else {
        if (callback) {
          callback(new Error('Cannot retrieve list of product ids !'));
        }
      }
    }
  });
}
/*
exports.check = function (req, res) {
  var converter = new Converter({}),
    legalEntityCount = 0,
    productCount = 0;

  converter.fromFile(
    path.resolve(__dirname + '/../../../../../var/data/check/check.csv'),
    function (err, results) {
      if (err) {
        console.log('===================================================');
        console.log('err', err);
        console.log('===================================================');
      }

      iterate(results, 0, function (results) {
        var fields = [
          'Nom',
          "Type d'objet touristique",
          'Id Sitra2',
          'field5',
          'Code postal',
          'Commune',
          'Entité de gestion',
          'Membre propriétaire - Nom',
          'count'
        ];

        try {
          var result = json2csv({ data: results, fields: fields, del: '\t' });
          fs.writeFile(
            path.resolve(
              __dirname + '/../../../../../var/data/check/checked.csv'
            ),
            result,
            function (err) {
              if (err) {
                res.json(err);
              } else {
                res.json('Done');
              }
            }
          );
        } catch (err) {
          // Errors are thrown for bad options, or if the data is empty and no fields are provided.
          // Be sure to provide fields if it is possible that your data array will be empty.
          console.error(err);
        }
      });
    }
  );
};
*/

function iterate(results, idx, callback) {
  if (idx === results.length - 1) {
    return callback(results);
  }

  var item = results[idx];

  if (item["Type d'objet touristique"] === 'Entité juridique') {
    LegalEntity.find({ specialIdSitra: item['Id Sitra2'].replace(/ /gi, '') })
      .count()
      .exec(function (err, count) {
        if (err) {
          console.error('===================================================');
          console.error('err', err);
          console.error('===================================================');
        }
        results[idx].count = count;

        idx++;
        iterate(results, idx, callback);
      });
  } else {
    Product.find({ specialIdSitra: item['Id Sitra2'].replace(/ /gi, '') })
      .count()
      .exec(function (err, count) {
        if (err) {
          console.error('===================================================');
          console.error('err', err);
          console.error('===================================================');
        }
        results[idx].count = count;

        idx++;
        iterate(results, idx, callback);
      });
  }
}
