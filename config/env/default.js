'use strict';

module.exports = {
  app: {
    title: 'PACA',
    description:
      '"PACA Manager APP JavaScript with MongoDB, ElasticSearch, Express, AngularJS, and Node.js.."',
    keywords: 'mongodb, express, angularjs, node.js, mongoose, passport',
    googleAnalyticsTrackingID:
      process.env.GOOGLE_ANALYTICS_TRACKING_ID ||
      'GOOGLE_ANALYTICS_TRACKING_ID',
    uploadUrl: 'http://normandie.media.tourinsoft.eu/upload/'
  },
  port: process.env.PORT || 3003,
  templateEngine: 'swig',
  sessionSecret: 'S3cretPacaApi',
  sessionCollection: 'sessions',
  sitra: {
    defaultMemberId: 1053,
    api: {
      host: 'api.apidae-tourisme-recette.accelance.net',
      path: '/api/v002/ecriture/'
    },
    privateData: {
      host: 'api.apidae-tourisme-recette.accelance.net',
      path: '/api/v002/donnees-privees/'
    },
    apiCriteriaInternal: {
      host: 'api.apidae-tourisme-recette.accelance.net',
      path: '/api/v002/criteres-internes/'
    },
    apiMetaData: {
      host: 'api.apidae-tourisme-recette.accelance.net',
      path: '/api/v002/metadata/'
    },
    auth: {
      host: 'api.apidae-tourisme-recette.accelance.net',
      path: '/oauth/token?grant_type=client_credentials',
      // Export APIDAE - Determined by member ID
      accessPerMemberId: {
        // Geotrek
        1111: {
          user: '47e3f2ee-c79c-40f3-81fc-443f4592fa90',
          pass: 'CTMUH4vPBRRQJaX'
        },
        ss: 'a4PhJRu4oBGc3K8'
      },
      // Geotrek - Chemin des parcs
      4430: {
        user: '8c5437e7-8210-488a-99d0-73094f62451a',
        pass: 'rk3bVSAYVqMM35Q'
      },
      // Geotrek - Rando Ecrins
      4433: {
        user: '24e3893c-aa3a-4541-b225-f69119397959',
        pass: 'yaUaIRhFBgXsCpV'
      },
      // Geotrek - Verdon
      4730: {
        user: '09f3a529-fde8-4f16-a094-ff3d0657853f',
        pass: 'yzaZX7vGS770h2e'
      },
      // Geotrek - Sisteronnais Buech
      4832: {
        user: 'c468e7d3-5cb3-495f-ae8d-864418fd8909',
        pass: 'Bsn5iihwRUe8IKA'
      },
      // Geotrek - Sainte baume
      5017: {
        user: '94316702-8eee-4639-a0da-f1a05d2b5cc4',
        pass: '8XDmQl7hfmRqKxE'
      },
      // RegionDo (prod)
      5029: {
        user: 'ef8e2a28-d80a-4b37-8346-8f0ba92d69cd',
        pass: 'djpic4xJzoADwe8'
      },
      // Geotrek - Alpilles
      5033: {
        user: '7bab0b74-0a97-4b93-ad72-bc229cffdfc2',
        pass: 'T0vUIfpXbMeZ9VP'
      },
      // Geotrek - Préalpes
      5052: {
        user: 'a02518a7-4c44-4fe5-a599-1fe9bc31ca20',
        pass: 'Vzc1R8K76eJVt7x'
      },
      // Geotrek - Luberon
      5112: {
        user: 'e1bfe7fc-7f67-485a-a91b-11f0c868e1b2',
        pass: 'tEnI0z5UBQAUqzq'
      },
      // Geotrek - Queyras
      5113: {
        user: '54ae7567-7dd5-4cc5-80a0-00ef18fbdf8e',
        pass: 'U5qT1u62jbPi59W'
      },
      // Geotrek - Camarguque
      5163: {
        user: '607f3774-406d-42a8-aebb-feb13a698e84',
        pass: 'rDoIGLTEP7hRovu'
      },
      // Geotrek - PN Port Cros
      5193: {
        user: '683686a0-410f-4653-ac3e-4e9e0d92ec0b',
        pass: '0dPc68MP1v9Rfki'
      },
      // RegionDo - Esterel
      5249: {
        user: '19bd6a10-f51d-4256-8e8e-5638d228c406',
        pass: 'WaWV80C3glwmJv3'
      },
      // Geotrek - Vendoux
      5446: {
        user: 'bf235aed-9489-4181-b579-1d02b4503158',
        pass: 'zAyuCwFlL1NAmKb'
      },
      // Geotrek - Alpes Rando
      5545: {
        user: 'b0dd27a3-91ee-4f05-a791-8802851c3729',
        pass: 'xVSR8gvs6AdyqXA'
      },
      // Geotrek - Baronnies
      5682: {
        user: '3b14d839-bf64-477d-a565-188aebf81602',
        pass: 'Sc9Sx8fdDrfByc3'
      },
      // RegionDo
      5701: {
        user: '78d118c7-9006-4f5f-807a-8c352c56a895',
        pass: 'C8Gt5W8n0FA5RFl'
      },
      // Geotrek - Rando Alpes Hautes Provences
      5992: {
        user: '42f76103-c349-49cf-b3f4-796c03f1d9eb',
        pass: 'U9OqRbDZ4LZg0HA'
      },
      // Geotrek - Mercantour
      6026: {
        user: '142da488-148a-4acf-a56e-293e899aca30',
        pass: 'MVv5b7lCuY9XVHG'
      },
      // Default
      // FIX: add - to user in order to disable default
      '-': {
        user: '-0ff2d78e-34da-48b4-a860-d0b4bad121af',
        pass: 'UEIUqPezQ6kToKP'
      }
    }
  }
};
