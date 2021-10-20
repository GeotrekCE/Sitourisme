'use strict';

module.exports = {
  db: 'mongodb://localhost/paca-search-dev?connectTimeoutMS=10000000',
  dbName: 'paca-search-dev',
  sessionSecret: 'S3cretPacaApiDev',
  elasticsearch: {
    index: 'paca-dev'
  },
  app: {
    title: 'PACA API - Development Environment'
  }
};
