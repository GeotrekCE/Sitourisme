'use strict';

module.exports = {
  app: {
    title: 'Geotrek 2 Apidae',
    description:
      '"Managing sync between Geotrek & Apidae"',
    keywords: 'geotrek, apidae'
  },
  port: process.env.PORT || 3003,
  templateEngine: 'swig',
  sessionSecret: 'S3cretPacaApi',
  sessionCollection: 'sessions',
  sitra: {},
  secure: false,
};
