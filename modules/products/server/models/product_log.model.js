'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schéma Mongoose pour la collection 'products_logs'.
const ProductLogSchema = new Schema({
  geotrekInstanceId: Number,
  geotrekStructureId: Number,
  specialId: {type: String, trim: true},
  specialIdSitra: String,
  lastSuccessDate: Date,
  lastSuccessResponse: mongoose.Schema.Types.Mixed,
  lastErrorDate: Date,
  lastErrorResponse: mongoose.Schema.Types.Mixed,
}, {
  collection: 'products_logs', // Forcer le nom de la collection.
  versionKey: false // Désactiver le champ __v.
});

// Modèle Mongoose pour la collection 'products_logs'.
const ProductLogModel = mongoose.model('ProductLog', ProductLogSchema);

module.exports = ProductLogModel;
