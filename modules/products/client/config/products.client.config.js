'use strict';

// Configuring the Products module
angular.module('products').run([
  'Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Equipements',
      state: 'products',
      type: 'dropdown'
    });

    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Liste des équipements',
      state: 'products.list'
    });

    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Import Geotrek API',
      state: 'products.import',
      stateParams: { importType: 'geotrek-api' }
    });
  }
]);
