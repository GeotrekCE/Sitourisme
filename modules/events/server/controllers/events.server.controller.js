'use strict';

const path = require('path'),
    EntityServer = require(path.resolve('./library/modules/server/models/entity.server.model.js')),
    EventSchema = require(path.resolve('./modules/events/server/models/event.schema.js')),
    genericServerController = require(path.resolve('./library/modules/server/controllers/generic.server.controller.js')),
    eventsApi = 'touristicevent',
    moduleName = 'events';
    
let entityServer = null,
    entityModel = null,
    cgt = 'CGT events';

exports.init = function() {
    entityServer = new EntityServer('Event', EventSchema);
    entityModel = entityServer.getModel();
}
     
exports.list = async function (req, res) {
    genericServerController.init(entityModel, eventsApi, moduleName);
    return genericServerController.list(req, res);
}

exports.import = function (req, res) {
    console.log('controller events import > entity model = ', entityServer.entity);
    genericServerController.init(entityModel, eventsApi, moduleName, entityServer, cgt);
    return genericServerController.import(req, res);
}