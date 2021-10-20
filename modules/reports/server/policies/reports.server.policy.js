'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Reports Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/reports',
          permissions: '*'
        },
        {
          resources: '/api/reports/:module',
          permissions: '*'
        },
        {
          resources: '/api/reports/:reportId',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/reports',
          permissions: ['get']
        },
        {
          resources: '/api/reports/:module',
          permissions: ['get']
        },
        {
          resources: '/api/reports/:reportId',
          permissions: ['get']
        }
      ]
    },
    {
      roles: ['guest'],
      allows: [
        {
          resources: '/api/reports',
          permissions: ['get']
        },
        {
          resources: '/api/reports/:module',
          permissions: ['get']
        },
        {
          resources: '/api/reports/:reportId',
          permissions: ['get']
        }
      ]
    }
  ]);
};

/**
 * Check If Reports Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  return next();

  //var roles = (req.user) ? req.user.roles : ['guest'];
  //
  //// If an report is being processed and the current user created it then allow any manipulation
  //if (req.report && req.user && req.report.user.id === req.user.id) {
  //	return next();
  //}
  //
  //// Check for user roles
  //acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
  //	if (err) {
  //		// An authorization error occurred.
  //		return res.status(500).send('Unexpected authorization error');
  //	}
  //	else {
  //		if (isAllowed) {
  //			// Access granted! Invoke next middleware
  //			return next();
  //		}
  //		else {
  //			return res.status(403).json({
  //				message: 'User is not authorized'
  //			});
  //		}
  //	}
  //});
};
