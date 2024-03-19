'use strict';

//Events service used for communicating with the events REST endpoints
angular.module('events').factory('Events', [
  '$resource',
  function ($resource) {
    return $resource(
      'api/events/:eventId',
      {
        eventId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );
  }
]);
