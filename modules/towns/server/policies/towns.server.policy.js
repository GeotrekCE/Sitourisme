'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Towns Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/towns',
          permissions: '*'
        },
        {
          resources: '/api/towns/search',
          permissions: '*'
        },
        {
          resources: '/api/towns/initElasticsearch',
          permissions: '*'
        },
        {
          resources: '/api/towns/import',
          permissions: '*'
        },
        {
          resources: '/api/towns/:townId',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/towns',
          permissions: ['get', 'post']
        },
        {
          resources: '/api/towns/search',
          permissions: ['get']
        },
        {
          resources: '/api/towns/initElasticsearch',
          permissions: ['get']
        },
        {
          resources: '/api/towns/import',
          permissions: ['get']
        },
        {
          resources: '/api/towns/:townId',
          permissions: ['get']
        }
      ]
    },
    {
      roles: ['guest'],
      allows: [
        {
          resources: '/api/towns',
          permissions: ['get']
        },
        {
          resources: '/api/towns/search',
          permissions: ['get']
        },
        {
          resources: '/api/towns/initElasticsearch',
          permissions: ''
        },
        {
          resources: '/api/towns/import',
          permissions: ''
        },
        {
          resources: '/api/towns/:townId',
          permissions: ['get']
        }
      ]
    }
  ]);
};

/**
 * Check If Towns Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = req.user ? req.user.roles : ['guest'];

  // If an town is being processed and the current user created it then allow any manipulation
  if (req.town && req.user && req.town.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(
    roles,
    req.route.path,
    req.method.toLowerCase(),
    function (err, isAllowed) {
      if (err) {
        // An authorization error occurred.
        return res.status(500).send('Unexpected authorization error');
      } else {
        if (isAllowed) {
          // Access granted! Invoke next middleware
          return next();
        } else {
          return res.status(403).json({
            message: 'User is not authorized'
          });
        }
      }
    }
  );
};
