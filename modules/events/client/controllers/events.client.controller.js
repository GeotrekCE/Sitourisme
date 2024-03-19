'use strict';

angular.module('events').controller('EventsController', [
  '$scope',
  '$stateParams',
  '$location',
  '$http',
  'Authentication',
  'Events',
  function ($scope, $stateParams, $location, $http, Authentication, Events) {
    $scope.authentication = Authentication;

    $scope.create = function () {
      var event = new Events({
        title: this.title,
        content: this.content
      });
      event.$save(
        function (response) {
          $location.path('events/' + response._id);

          $scope.title = '';
          $scope.content = '';
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.remove = function (event) {
      if (event) {
        event.$remove();

        for (var i in $scope.events) {
          if ($scope.events[i] === event) {
            $scope.events.splice(i, 1);
          }
        }
      } else {
        $scope.event.$remove(function () {
          $location.path('events');
        });
      }
    };

    $scope.update = function () {
      var event = $scope.event;

      event.$update(
        function () {
          $location.path('events/' + event._id);
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.find = function () {
      $scope.events = Events.query();
    };

    $scope.findOne = function () {
      $scope.event = Events.get({
        eventId: $stateParams.eventId
      });
    };

    $scope.initElasticsearch = function () {
      $http.get('/api/events/initElasticsearch').then(
        function (response) {
          $scope.messages = response.data;
        },
        function (response) {
          $scope.messages = response.data;
        }
      );
    };

    $scope.reindexeElasticsearch = function () {
      $http.get('/api/reindexation').then(
        function (response) {
          $scope.messages = response.data;
        },
        function (response) {
          $scope.messages = response.data;
        }
      );
    };

    $scope.import = function () {
      var url = '/api/events/import';
      if ($stateParams.importType && $stateParams.importInstance) {
        url += '?type=' + $stateParams.importType + '&instance=' + $stateParams.importInstance;
      }
      $http.get(url).then(
        function (response) {
          $scope.messages = response.data;
        },
        function (response) {
          $scope.messages = response.data;
        }
      );
    };
  }
]);
