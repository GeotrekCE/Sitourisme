'use strict';

angular.module('products').controller('ProductsController', [
  '$scope',
  '$stateParams',
  '$location',
  '$http',
  'Authentication',
  'Products',
  function ($scope, $stateParams, $location, $http, Authentication, Products) {
    $scope.authentication = Authentication;

    $scope.create = function () {
      var product = new Products({
        title: this.title,
        content: this.content
      });
      product.$save(
        function (response) {
          $location.path('products/' + response._id);

          $scope.title = '';
          $scope.content = '';
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.remove = function (product) {
      if (product) {
        product.$remove();

        for (var i in $scope.products) {
          if ($scope.products[i] === product) {
            $scope.products.splice(i, 1);
          }
        }
      } else {
        $scope.product.$remove(function () {
          $location.path('products');
        });
      }
    };

    $scope.update = function () {
      var product = $scope.product;

      product.$update(
        function () {
          $location.path('products/' + product._id);
        },
        function (errorResponse) {
          $scope.error = errorResponse.data.message;
        }
      );
    };

    $scope.find = function () {
      $scope.products = Products.query();
    };

    $scope.findOne = function () {
      $scope.product = Products.get({
        productId: $stateParams.productId
      });
    };

    $scope.initElasticsearch = function () {
      $http.get('/api/products/initElasticsearch').then(
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
      var url = '/api/products/import';
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
