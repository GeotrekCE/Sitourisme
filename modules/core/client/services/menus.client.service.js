(function () {
  'use strict';

  //Menu service used for managing  menus
  angular.module('core').service('Menus', [Menus]);

  function Menus() {
    var vm = this;

    /**
     *  Variables
     */
    // Define a set of default roles
    vm.defaultRoles = ['*'];
    // Define the menus object
    vm.menus = {};

    /** ===================================
     *           public methods
     ===================================== */

    vm.validateMenuExistance = validateMenuExistance;
    vm.getMenu = getMenu;
    vm.addMenu = addMenu;
    vm.removeMenu = removeMenu;
    vm.addMenuItem = addMenuItem;
    vm.addSubMenuItem = addSubMenuItem;
    vm.removeMenuItem = removeMenuItem;
    vm.removeSubMenuItem = removeSubMenuItem;

    //Adding the topbar menu
    vm.addMenu('topbar', {
      isPublic: false
    });

    /**
     * Validate menu existance
     * @param menuId
     * @returns {boolean}
     */
    function validateMenuExistance(menuId) {
      if (menuId && menuId.length) {
        if (vm.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
    }

    /**
     * Get the menu object by menu id
     * @param menuId
     * @returns {*}
     */
    function getMenu(menuId) {
      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Return the menu object
      return vm.menus[menuId];
    }

    /**
     * Add new menu object by menu id
     * @param menuId
     * @param options
     * @returns {*}
     */
    function addMenu(menuId, options) {
      options = options || {};

      // Create the new menu
      vm.menus[menuId] = {
        isPublic:
          options.isPublic === null || typeof options.isPublic === 'undefined'
            ? true
            : options.isPublic,
        roles: options.roles || vm.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return vm.menus[menuId];
    }

    /**
     * Remove existing menu object by menu id
     * @param menuId
     */
    function removeMenu(menuId) {
      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Return the menu object
      delete vm.menus[menuId];
    }

    /**
     * Add menu item object
     * @param menuId
     * @param options
     * @returns {*}
     */
    function addMenuItem(menuId, options) {
      options = options || {};

      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Push new menu item
      vm.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        stateParams: options.stateParams || {},
        type: options.type || 'item',
        class: options.class,
        isPublic:
          options.isPublic === null || typeof options.isPublic === 'undefined'
            ? vm.menus[menuId].isPublic
            : options.isPublic,
        roles:
          options.roles === null || typeof options.roles === 'undefined'
            ? vm.menus[menuId].roles
            : options.roles,
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        angular.forEach(options.items, function (element, i) {
          vm.addSubMenuItem(menuId, options.link, options.items[i]);
        });
      }

      // Return the menu object
      return vm.menus[menuId];
    }

    /**
     * Add submenu item object
     * @param menuId
     * @param parentItemState
     * @param options
     * @returns {*}
     */
    function addSubMenuItem(menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Search for menu item
      angular.forEach(vm.menus[menuId].items, function (element, itemIndex) {
        if (vm.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          vm.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            stateParams: options.stateParams || {},
            isPublic:
              options.isPublic === null ||
              typeof options.isPublic === 'undefined'
                ? vm.menus[menuId].items[itemIndex].isPublic
                : options.isPublic,
            roles:
              options.roles === null || typeof options.roles === 'undefined'
                ? vm.menus[menuId].items[itemIndex].roles
                : options.roles,
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      });

      // Return the menu object
      return vm.menus[menuId];
    }

    /**
     * Remove existing menu object by menu id
     * @param menuId
     * @param menuItemURL
     * @returns {*}
     */
    function removeMenuItem(menuId, menuItemURL) {
      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Search for menu item to remove
      angular.forEach(vm.menus[menuId].items, function (itemIndex) {
        if (vm.menus[menuId].items[itemIndex].link === menuItemURL) {
          vm.menus[menuId].items.splice(itemIndex, 1);
        }
      });

      // Return the menu object
      return vm.menus[menuId];
    }

    /**
     * Remove existing menu object by menu id
     * @param menuId
     * @param submenuItemURL
     * @returns {*}
     */
    function removeSubMenuItem(menuId, submenuItemURL) {
      // Validate that the menu exists
      vm.validateMenuExistance(menuId);

      // Search for menu item to remove
      angular.forEach(vm.menus[menuId].items, function (element, itemIndex) {
        angular.forEach(
          vm.menus[menuId].items[itemIndex].items,
          function (item, subitemIndex) {
            if (
              vm.menus[menuId].items[itemIndex].items[subitemIndex].link ===
              submenuItemURL
            ) {
              vm.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        );
      });

      // Return the menu object
      return vm.menus[menuId];
    }

    /** ===================================
     *           private methods
     ===================================== */

    /**
     * A private function for rendering decision
     * @param user
     * @returns {*}
     */
    function shouldRender(user) {
      var me = this;
      if (user) {
        if (~me.roles.indexOf('*')) {
          return true;
        } else {
          angular.forEach(user.roles, function (element, userRoleIndex) {
            angular.forEach(me.roles, function (item, roleIndex) {
              if (me.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
            });
          });
        }
      } else {
        return me.isPublic;
      }

      return false;
    }
  }
})();
