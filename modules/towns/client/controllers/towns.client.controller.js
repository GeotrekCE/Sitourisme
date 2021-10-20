'use strict';

angular.module('towns').controller('TownsController', [
  '$scope',
  '$stateParams',
  '$location',
  '$http',
  'Authentication',
  'Towns',
  function ($scope, $stateParams, $location, $http, Authentication, Towns) {
    $scope.authentication = Authentication;

    $scope.create = function () {
      var town = new Towns({
        title: this.title,
        content: this.content
      });
      town.$save(
        function (response) {
          $location.path('towns/' + response._id);

          $scope.title = '';
          $scope.content = '';
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.remove = function (town) {
      if (town) {
        town.$remove();

        for (var i in $scope.towns) {
          if ($scope.towns[i] === town) {
            $scope.towns.splice(i, 1);
          }
        }
      } else {
        $scope.town.$remove(function () {
          $location.path('towns');
        });
      }
    };

    $scope.update = function () {
      var town = $scope.town;

      town.$update(
        function () {
          $location.path('towns/' + town._id);
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.find = function () {
      $scope.towns = Towns.query();
    };

    $scope.findOne = function () {
      $scope.town = Towns.get({
        townId: $stateParams.townId
      });
    };

    $scope.initElasticsearch = function () {
      $http.get('/api/towns/initElasticsearch').then(
        function (response) {
          $scope.messages = response.data;
        },
        function (response) {
          $scope.messages = response.data;
        }
      );
    };

    $scope.import = function () {
      $http.get('/api/towns/import').then(
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
