'use strict';

const path = require('path'),
    EntityServer = require(path.resolve('./library/modules/server/models/entity.server.model.js')),
    ProductSchema = require(path.resolve('./modules/products/server/models/product.schema.js')),
    genericServerController = require(path.resolve('./library/modules/server/controllers/generic.server.controller.js')),
    productsApi = 'trek',
    moduleName = 'products';
    
let entityServer = null,
    entityModel = null,
    cgt = 'CGT products';

exports.init = function() {
    entityServer = new EntityServer('Product', ProductSchema);
    entityModel = entityServer.getModel();
}
    
exports.list = async function (req, res) {
    genericServerController.init(entityModel, productsApi, moduleName);
    return genericServerController.list(req, res);
}

exports.import = function (req, res) {
    console.log('controller product import > entity model = ', entityServer.entity);
    genericServerController.init(entityModel, productsApi, moduleName, entityServer, cgt);
    return genericServerController.import(req, res);
}