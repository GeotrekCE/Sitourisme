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
      .state('products.import', {
        url: '/import/:importType',
        templateUrl: 'modules/products/views/import-products.client.view.html'
      });
  }
]);
