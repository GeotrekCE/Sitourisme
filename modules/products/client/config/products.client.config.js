'use strict';

// Configuring the Products module
angular.module('products').run([
  'Menus',
  function (Menus) {
    // Add the products dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Equipements',
      state: 'products',
      type: 'dropdown'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Liste des équipements',
      state: 'products.list'
    });

    /*// Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Créer un équipement',
      state: 'products.create'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Init elasticsearch',
      state: 'products.initElasticsearch'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Reindexe elasticsearch',
      state: 'products.reindexeElasticsearch'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Import Geotrek',
      state: 'products.import',
      stateParams: { importType: 'geotrek' }
    });
*/
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Import Geotrek API',
      state: 'products.import',
      stateParams: { importType: 'geotrek-api' }
    });
/*
    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'products', {
      title: 'Import RegionDo',
      state: 'products.import',
      stateParams: { importType: 'regiondo' }
    });*/
  }
]);
