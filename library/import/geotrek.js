const _ = require('lodash');

/**
 * Class Import
 *
 * @param {object} options
 * @constructor
 */
var Import = function (options) {
  this.arrData = [];
  this.options = options;
};

/**
 * Start process
 *
 * @param {function} callback
 */
Import.prototype.start = function (callback) {
  this.__initParser(function (err) {
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
  next(null, []);
};

/**
 * Import
 *
 * @param {object} data
 * @param {function} next
 */
Import.prototype.import = function (data, next) {
  next();
};

/**
 * Init parser
 *
 * @param {function} callback
 * @private
 */
Import.prototype.__initParser = function (callback) {
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
      self.__import(data, callback);
    } else {
      if (callback) {
        callback(err);
      }
    }
  });
};

/**
 * Launch import
 *
 * @param {object} data
 * @param {function} callback
 * @private
 */
Import.prototype.__import = function (data, callback) {
  var self = this;

  this.import(data, function (err) {
    if (err) {
      throw err;
    }

    self.__next(callback);
  });
};

/**
 * Calculate rate completion
 * @param product
 * @returns {number}
 */
Import.prototype.calculateRateCompletion = function (product) {
  var score = 0;

  if (product.type) {
    score++;
  }
  if (product.subType) {
    score++;
  }
  if (product.name) {
    score++;
  }
  if (product.territory && product.territory.length) {
    score++;
  }
  if (product.website && product.website.length) {
    score++;
  }
  if (product.email && product.email.length) {
    score++;
  }
  if (product.phone && product.phone.length) {
    score++;
  }
  if (product.shortDescription) {
    score++;
  }
  if (product.description) {
    score++;
  }
  if (product.complement) {
    score++;
  }
  if (product.ambiance) {
    score++;
  }
  if (product.passagesDelicats) {
    score++;
  }
  if (product.address) {
    if (product.address.address1) {
      score++;
    }
    if (product.address.zipcode) {
      score++;
    }
  }
  if (
    product.localization &&
    product.localization.lat !== null &&
    product.localization.lon !== null
  ) {
    score++;
  }
  if (product.itinerary) {
    score++;
    if (product.itinerary.dailyDuration !== null) {
      score++;
    }
    if (product.itinerary.distance !== null) {
      score++;
    }
    if (product.itinerary.positive !== null) {
      score++;
    }
    if (product.itinerary.negative !== null) {
      score++;
    }
    if (product.itinerary.itineraireType !== null) {
      score++;
    }
    if (product.itinerary.itineraireBalise !== null) {
      score++;
    }
  }
  if (product.image && product.image.length) {
    score++;
    if (product.image[0].description) {
      score++;
    }
  }
  if (product.equipment && product.equipment.length) {
    score++;
  }
  if (product.openingDate && product.openingDate.description) {
    score++;
  }
  if (product.price && product.price.description) {
    score++;
  }
  if (product.website && product.website.length) {
    score++;
  }
  if (product.email && product.email.length) {
    score++;
  }
  if (product.phone && product.phone.length) {
    score++;
  }
  if (product.typeDetail && product.typeDetail.length) {
    score++;
  }
  if (product.legalEntity && product.legalEntity.length > 0) {
    score++;
  }

  return _.floor((score * 100) / 22);
};

/**
 * add url
 *
 * @param {String} url
 * @return {String} The clean url
 * @private
 */
Import.prototype.addUrlHttp = function (url) {
  if (url && _.isString(url) && !url.match('^https?://|^//')) {
    url = this.url + url;
  }
  return url;
};

module.exports = Import;
