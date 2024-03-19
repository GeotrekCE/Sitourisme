'use strict';

// Setting up route
angular.module('events').config([
  '$stateProvider',
  function ($stateProvider) {
    // Products state routing
    $stateProvider
      .state('events', {
        abstract: true,
        url: '/events',
        template: '<ui-view/>'
      })
      .state('events.list', {
        url: '',
        templateUrl: 'modules/events/views/list-events.client.view.html'
      })
      .state('events.import', {
        url: '/import/:importType/:importInstance/',
        templateUrl: 'modules/events/views/import-events.client.view.html'
      });
  }
]);
