'use strict';

// Setting up route
angular.module('products').config([
  '$stateProvider',
  function ($stateProvider) {
    // Products state routing
    $stateProvider
      .state('products', {
        abstract: true,
        url: '/products',
        template: '<ui-view/>'
      })
      .state('products.list', {
        url: '',
        templateUrl: 'modules/products/views/list-products.client.view.html'
      })
      .state('products.create', {
        url: '/create',
        templateUrl: 'modules/products/views/create-product.client.view.html'
      })
      .state('products.initElasticsearch', {
        url: '/initElasticsearch',
        templateUrl:
          'modules/products/views/initElasticsearch-products.client.view.html'
      })
      .state('products.reindexeElasticsearch', {
        url: '/reindexeElasticsearch',
        templateUrl:
          'modules/products/views/reindexeElasticsearch-products.client.view.html'
      })
      .state('products.import', {
        url: '/import/:importType',
        templateUrl: 'modules/products/views/import-products.client.view.html'
      })
      .state('products.view', {
        url: '/:productId',
        templateUrl: 'modules/products/views/view-product.client.view.html'
      })
      .state('products.edit', {
        url: '/:productId/edit',
        templateUrl: 'modules/products/views/edit-product.client.view.html'
      });
  }
]);
