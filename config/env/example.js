// File to be renamed to development.js or production.js ;)
'use strict';

module.exports = {
  db: 'mongodb://localhost:27017/paca-search-dev?connectTimeoutMS=10000000&authSource=admin',
  dbName: 'paca-search-dev',
  app: {
    title: 'Geotrek 2 Apidae - Development Environment'
  }, 
  debug: {
    idGeo: 0, //ID GEOTREK 919184 or 0 FOR ALL OBJECTS
    allpages: true, //TO USE ALL GEOTREK API PAGES
    seeData: false, //TO SEE IN LOGS THE GEOTREK & APIDAE DATAS
    logs: true, // TO ACTIVATE OR NOT LOGS
    logProductExports: true, // TO LOG PRODUCT EXPORTS IN MONGODB
  },
  memberId: 1, //ID PROJECT APIDAE
  proprietaireId: 0, // ID OWNER APIDAE
  sitra: {
    api: {
      host: 'api.apidae-tourisme.cooking',
      path: '/api/v002/ecriture/'
    },
    privateData: {
      host: 'api.apidae-tourisme.cooking',
      path: '/api/v002/donnees-privees/'
    },
    apiCriteriaInternal: {
      host: 'api.apidae-tourisme.cooking',
      path: '/api/v002/criteres-internes/'
    },
    apiMetaData: {
      host: 'api.apidae-tourisme.cooking',
      path: '/api/v002/metadata/'
    },
    auth: {
      host: 'api.apidae-tourisme.cooking',
      path: '/oauth/token?grant_type=client_credentials',
      accessPerMemberId: {
        1: { // ID PROJECT APIDAE
          user: '',
          pass: '',
        }
      }
    }
  }
};
