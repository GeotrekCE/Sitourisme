'use strict';

// Configuring the Products module
angular.module('products').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Trek',
      state: 'products',
      type: 'dropdown'
    });

    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Liste des équipements',
      state: 'products.list'
    });

    // Using ImportInstance 7 for development purposes
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Import Geotrek API',
      state: 'products.import',
      stateParams: { importType: 'geotrek-api', importInstance: '0' }
    });
  }
]);
