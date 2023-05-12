'use strict';

// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/views/settings/settings.client.view.html'
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl:
          'modules/users/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl:
          'modules/users/views/settings/change-password.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl:
          'modules/users/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin',
        templateUrl:
          'modules/users/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
  }
]);
