'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InstanceSyncSchema = new Schema({
  instanceId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },

  lastSyncDate: {
    type: Date,
    default: null
  }

}, {
  collection: 'instances_sync',
  versionKey: false
})

const InstanceSyncModel = mongoose.model('InstanceSync', InstanceSyncSchema)

module.exports = InstanceSyncModel