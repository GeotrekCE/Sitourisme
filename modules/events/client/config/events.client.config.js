'use strict';

// Configuring the Products module
angular.module('events').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Evénements',
      state: 'events',
      type: 'dropdown'
    });

    Menus.addSubMenuItem('topbar', 'events', {
      title: 'Liste des fêtes et manifestations',
      state: 'events.list'
    });

    Menus.addSubMenuItem('topbar', 'events', {
      title: 'Import Geotrek API',
      state: 'events.import',
      stateParams: { importType: 'geotrek-api', importInstance: '0' }
    });
  }
]);
