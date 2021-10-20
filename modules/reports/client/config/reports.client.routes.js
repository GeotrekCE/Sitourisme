'use strict';

// Setting up route
angular.module('reports').config([
  '$stateProvider',
  function ($stateProvider) {
    // Reports state routing
    $stateProvider
      .state('reports', {
        abstract: true,
        url: '/reports',
        template: '<ui-view/>'
      })
      .state('reports.list', {
        url: '',
        templateUrl: 'modules/reports/views/list-reports.client.view.html'
      })
      .state('reports.create', {
        url: '/create',
        templateUrl: 'modules/reports/views/create-report.client.view.html'
      })
      .state('reports.view', {
        url: '/:reportId',
        templateUrl: 'modules/reports/views/view-report.client.view.html'
      })
      .state('reports.edit', {
        url: '/:reportId/edit',
        templateUrl: 'modules/reports/views/edit-report.client.view.html'
      });
  }
]);
