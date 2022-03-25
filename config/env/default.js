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
  sitra: {},
};
