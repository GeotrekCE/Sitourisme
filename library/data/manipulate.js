const _ = require('lodash');
const moment = require('moment');

function filterDates(dates) {
  var today = new Date().getTime();
  const limitDateStart = new Date('01-01-2017');

  var filterDates = _(dates)
    // remove duplicate period
    .uniq((period) => period.dateStart.getTime() && period.dateEnd.getTime())
    .map((period) => {
      // replace date start and date end if inversed
      if (period.dateEnd.getTime() < period.dateStart.getTime()) {
        return {
          ...period,
          dateStart: period.dateEnd,
          dateEnd: period.dateStart
        };
      }
      if (period.dateStart.getTime() < +limitDateStart) {
        period.dateStart = limitDateStart;
      }
      return period;
    }) // remove anterior period
    .filter((period) => today < period.dateEnd.getTime())
    .valueOf();
  return filterDates;
}

function sortedDates(dates, order = 'ASC') {
  var dateOrder = 'dateStart';
  if (order === 'DESC') {
    dateOrder = 'dateEnd';
  }
  return dates.sort((previous, current) => {
    // get the start date from previous and current
    var previousTime = previous[dateOrder].getTime();
    var currentTime = current[dateOrder].getTime();

    // if the previous is earlier than the current
    if (previousTime < currentTime) {
      return -1;
    }

    // if the previous time is the same as the current time
    if (previousTime === currentTime) {
      return 0;
    }

    // if the previous time is later than the current time
    return 1;
  });
}

// the array is first sorted, and then checked for any overlap
exports.antiOverlap = (dateRanges) => {
  // on filtre en retirant les periodes dupliquées, finies et en corrigeant des erreurs
  var filterRanges = filterDates(dateRanges);
  // not overlap for one period - logic
  if (filterRanges.length <= 1) {
    return {
      ranges: filterRanges
    };
  }
  // on trie du plus vieux au plus récet
  var sortedRanges = sortedDates(filterRanges, 'DESC');

  var result = sortedRanges.reduce(
    (result, current, index, arr) => {
      // get the previous range
      if (index === 0) {
        return result;
      }
      var previous = arr[index - 1];

      // check for any overlap
      var previousStart = previous.dateStart.getTime();
      var previousEnd = previous.dateEnd.getTime();
      var currentStart = current.dateStart.getTime();
      var currentEnd = current.dateEnd.getTime();
      // chevauchement
      var overlap = previousEnd >= currentStart;
      // inclusion
      var include = currentStart >= previousStart && currentEnd <= previousEnd;

      var newPeriod = null;

      if (include) {
        result.overlapOrInclude = true;
        // create new period
        newPeriod = {
          ...current,
          // by default same type as the others or OUVERTURE_TOUS_LES_JOURS
          type: current.type || previous.type || 'OUVERTURE_TOUS_LES_JOURS',
          // new period begin one day after other period
          dateStart: moment(currentEnd).add(1, 'd').toDate(),
          dateEnd: moment(previousEnd).toDate()
        };
        // first period end one day before new period
        previous.dateEnd = moment(currentStart).add(-1, 'd').toDate();
        result.ranges.push(previous, current, newPeriod);
      } else if (overlap) {
        result.overlapOrInclude = true;
        // second period begin one day after first period
        current.dateStart = moment(previousEnd).add(1, 'd').toDate();
        result.ranges.push(previous, current);
      } else {
        result.ranges.push(previous, current);
      }

      return result;
      // seed the reduce
    },
    { ranges: [], overlapOrInclude: false }
  );

  // last treatment
  result.ranges = sortedDates(filterDates(result.ranges, 'ASC'));
  // return the final results
  return result;
};

exports.convertDuration = (duration) => duration * 60;

exports.convertDistance = (distance) => (distance / 1000).toFixed(2);

exports.convertNegative = (negative) => Math.abs(negative);

/**
 * encode utf8
 *
 * @param {String} txt
 * @return {String} encoding txt
 * @private
 */
exports.strEncode = (txt) => {
  if (txt) {
    return txt
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&cent;/g, '¢')
      .replace(/&pound;/g, '£')
      .replace(/&euro;/g, '€')
      .replace(/&yen;/g, '¥')
      .replace(/&deg;/g, '°')
      .replace(/&frac14;/g, '¼')
      .replace(/&OElig;/g, 'Œ')
      .replace(/&frac12;/g, '½')
      .replace(/&oelig;/g, 'œ')
      .replace(/&frac34;/g, '¾')
      .replace(/&Yuml;/g, 'Ÿ')
      .replace(/&iexcl;/g, '¡')
      .replace(/&laquo;/g, '«')
      .replace(/&raquo;/g, '»')
      .replace(/&iquest;/g, '¿')
      .replace(/&Agrave;/g, 'À')
      .replace(/&Aacute;/g, 'Á')
      .replace(/&Acirc;/g, 'Â')
      .replace(/&Atilde;/g, 'Ã')
      .replace(/&Auml;/g, 'Ä')
      .replace(/&Aring;/g, 'Å')
      .replace(/&AElig;/g, 'Æ')
      .replace(/&Ccedil;/g, 'Ç')
      .replace(/&Egrave;/g, 'È')
      .replace(/&Eacute;/g, 'É')
      .replace(/&Ecirc;/g, 'Ê')
      .replace(/&Euml;/g, 'Ë')
      .replace(/&Igrave;/g, 'Ì')
      .replace(/&Iacute;/g, 'Í')
      .replace(/&Icirc;/g, 'Î')
      .replace(/&Iuml;/g, 'Ï')
      .replace(/&ETH;/g, 'Ð')
      .replace(/&Ntilde;/g, 'Ñ')
      .replace(/&Ograve;/g, 'Ò')
      .replace(/&Oacute;/g, 'Ó')
      .replace(/&Ocirc;/g, 'Ô')
      .replace(/&Otilde;/g, 'Õ')
      .replace(/&Ouml;/g, 'Ö')
      .replace(/&Oslash;/g, 'Ø')
      .replace(/&Ugrave;/g, 'Ù')
      .replace(/&Uacute;/g, 'Ú')
      .replace(/&Ucirc;/g, 'Û')
      .replace(/&Uuml;/g, 'Ü')
      .replace(/&Yacute;/g, 'Ý')
      .replace(/&THORN;/g, 'Þ')
      .replace(/&szlig;/g, 'ß')
      .replace(/&agrave;/g, 'à')
      .replace(/&aacute;/g, 'á')
      .replace(/&acirc;/g, 'â')
      .replace(/&atilde;/g, 'ã')
      .replace(/&auml;/g, 'ä')
      .replace(/&aring;/g, 'å')
      .replace(/&aelig;/g, 'æ')
      .replace(/&ccedil;/g, 'ç')
      .replace(/&egrave;/g, 'è')
      .replace(/&eacute;/g, 'é')
      .replace(/&ecirc;/g, 'ê')
      .replace(/&euml;/g, 'ë')
      .replace(/&igrave;/g, 'ì')
      .replace(/&iacute;/g, 'í')
      .replace(/&icirc;/g, 'î')
      .replace(/&iuml;/g, 'ï')
      .replace(/&eth;/g, 'ð')
      .replace(/&ntilde;/g, 'ñ')
      .replace(/&ograve;/g, 'ò')
      .replace(/&oacute;/g, 'ó')
      .replace(/&ocirc;/g, 'ô')
      .replace(/&otilde;/g, 'õ')
      .replace(/&ouml;/g, 'ö')
      .replace(/&oslash;/g, 'ø')
      .replace(/&ugrave;/g, 'ù')
      .replace(/&uacute;/g, 'ú')
      .replace(/&ucirc;/g, 'û')
      .replace(/&uuml;/g, 'ü')
      .replace(/&yacute;/g, 'ý')
      .replace(/&thorn;/g, 'þ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lsquo;/g, '"')
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&hellip;/g, '...')
      .replace(/&ndash;/g, '')
      .replace(/&reg;/, '®');
  } else return '';
};

/**
 * Remove accents
 *
 * @param {String} str
 * @returns {String}
 * @private
 */
const removeAccents = (str) => {
  if (str) {
    return str
      .replace(new RegExp(/[àáâãäå]/g), 'a')
      .replace(new RegExp(/[ÁÂÃÄÅ]/g), 'A')
      .replace(new RegExp(/[òóôõö]/g), 'o')
      .replace(new RegExp(/[ÒÓÔÕÖ]/g), 'O')
      .replace(new RegExp(/[ùúûü]/g), 'u')
      .replace(new RegExp(/[ÙÚÛÜ]/g), 'U')
      .replace(new RegExp(/[ìíîï]/g), 'i')
      .replace(new RegExp(/[ÌÍÎÏ]/g), 'I')
      .replace(new RegExp(/[èéêë]/g), 'e')
      .replace(new RegExp(/[ÈÉÊË]/g), 'E')
      .replace(new RegExp(/[ýÿ]/g), 'y')
      .replace(new RegExp(/[ÝŸ]/g), 'Y')
      .replace(new RegExp(/æ/g), 'ae')
      .replace(new RegExp(/Æ/g), 'AE')
      .replace(new RegExp(/œ/g), 'oe')
      .replace(new RegExp(/Œ/g), 'OE')
      .replace(new RegExp(/ç/g), 'c')
      .replace(new RegExp(/Ç/g), 'C')
      .replace(new RegExp(/ñ/g), 'n')
      .replace(new RegExp(/Ñ/g), 'N');
  } else {
    return '';
  }
};

exports.removeAccents = removeAccents;

exports.cleanEmailArray = (emails) => {
  if (!_.isArray(emails)) {
    emails = [emails];
  }
  var listEmails = [];
  if (emails && emails.length) {
    try {
      _.forEach(emails, (email) => {
        if (email && typeof email === 'string' && email.includes('@')) {
          email = removeAccents(email);
          if (email.includes('<')) {
            listEmails = listEmails.concat(email.split('<'));
          } else if (email.includes('/')) {
            listEmails = listEmails.concat(email.split('/'));
          } else {
            listEmails.push(email);
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  const cleanEmails = _(listEmails)
    .map((email) => {
      let cleanEmail = email
        .trim()
        .toLowerCase()
        .replace(new RegExp(/[;,()]/g), '.')
        .replace(new RegExp(/\s/g), '')
        .replace('@@', '@')
        .replace('.@.', '@');
      if (email.slice(-1) === '.') {
        cleanEmail = cleanEmail.replace(/$/g, '');
      }
      if (_.endsWith(cleanEmail, '.f')) {
        cleanEmail += 'r';
      }
      if (cleanEmail.includes('@')) {
        return cleanEmail;
      }
      return null;
    })
    .compact()
    .uniq()
    .valueOf();
  return cleanEmails;
};

exports.cleanPhoneArray = (phones) => {
  if (!_.isArray(phones)) {
    phones = [phones];
  }
  const cleanPhones = _(phones)
    .map(String)
    .map((phone) => {
      if (!phone || !/\d/.test(phone)) {
        return null;
      }
      phone = phone.toString().trim();

      if (_.includes(phone, '()')) {
        phone = phone.replace('()', '(0)');
      }
      if (_.includes(phone, '(+33)')) {
        phone = phone.replace('(+33)', '0');
      }

      var phoneRegExpReplace33 = /\+ ?33\ *\(0\)\ *|33\ ?\(0\)/g,
        phoneRegExpRemove = /^\+ ?33\ */,
        phoneRegExpSpace =
          /^([0-9]{2})([\.\-/ ]?)([0-9]{2})([\.\-/ ]?)([0-9]{2})([\.\-/ ]?)([0-9]{2})([\.\-/ ]?)([0-9]{2})/;

      return phone
        .replace(/\s/g, '')
        .replace(/\ *t[eé]l\ *:\ */i, '')
        .replace(phoneRegExpReplace33, '0')
        .replace(phoneRegExpRemove, '')
        .replace(phoneRegExpSpace, '$1 $3 $5 $7 $9');
    })
    .compact()
    .uniq()
    .valueOf();

  return cleanPhones;
};

// remove duplicate and bad value
exports.cleanArray = (list) => {
  if (!_.isArray(list)) {
    list = [list];
  }
  return _(list).compact().uniq().value();
};

// concat and remove duplicate in array
exports.concatArray = (tab1, tab2) => {
  return this.cleanArray(tab1.concat(tab2));
};

/**
 * stripTags
 *
 * @param {String} txt
 * @return {String} The clean txt
 * @private
 */
exports.stripTags = (txt) => {
  if (txt) {
    return txt.replace(/(<([^>]+)>)/gi, '');
  }
  return '';
};

exports.cutString = (txt, maxLength = 254) => String(txt).slice(0, maxLength);
