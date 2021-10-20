'use strict';

//Towns service used for communicating with the towns REST endpoints
angular.module('towns').factory('Towns', [
  '$resource',
  function ($resource) {
    return $resource(
      'api/towns/:townId',
      {
        townId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }
]);
