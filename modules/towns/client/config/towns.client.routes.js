'use strict';

// Setting up route
angular.module('towns').config([
  '$stateProvider',
  function ($stateProvider) {
    // Towns state routing
    $stateProvider
      .state('towns', {
        abstract: true,
        url: '/towns',
        template: '<ui-view/>'
      })
      .state('towns.list', {
        url: '',
        templateUrl: 'modules/towns/views/list-towns.client.view.html'
      })
      .state('towns.create', {
        url: '/create',
        templateUrl: 'modules/towns/views/create-town.client.view.html'
      })
      .state('towns.initElasticsearch', {
        url: '/initElasticsearch',
        templateUrl:
          'modules/towns/views/initElasticsearch-towns.client.view.html'
      })
      .state('towns.import', {
        url: '/import',
        templateUrl: 'modules/towns/views/import-towns.client.view.html'
      })
      .state('towns.view', {
        url: '/:townId',
        templateUrl: 'modules/towns/views/view-town.client.view.html'
      })
      .state('towns.edit', {
        url: '/:townId/edit',
        templateUrl: 'modules/towns/views/edit-town.client.view.html'
      });
  }
]);
