'use strict';

//Products service used for communicating with the products REST endpoints
angular.module('products').factory('Products', [
  '$resource',
  function ($resource) {
    return $resource(
      'api/products/:productId',
      {
        productId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }
]);
