'use strict';

//Reports service used for communicating with the reports REST endpoints
angular.module('reports').factory('Reports', [
  '$resource',
  function ($resource) {
    return $resource(
      'api/reports/:reportId',
      {
        reportId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }
]);
