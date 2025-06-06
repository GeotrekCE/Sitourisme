'use strict';

/**
 * Module dependencies.
 */
var ACL = require('acl2');

// Using the memory backend
const acl = new ACL(new ACL.memoryBackend());

/**
 * Invoke Products Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/events',
          permissions: '*'
        },
        {
          resources: '/api/events/import',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/events',
          permissions: '*'
        },
        {
          resources: '/api/events/import',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['guest'],
      allows: [
        /*{
          resources: '/api/events',
          permissions: '*'
        },*/
        {
          resources: '/api/events/import',
          permissions: '*'
        },
      ]
    }
  ]);
};

/**
 * Check If Products Policy Allows
 */
exports.isAllowed = async function (req, res, next) {
  const roles = req.user && Array.isArray(req.user.roles) ? req.user.roles : ['guest']
  const method = req.method.toLowerCase()
  const path = req.baseUrl + (req.route?.path || '')

  if (!Array.isArray(roles) || !path || typeof method !== 'string') {
    return res.status(500).send('Invalid ACL parameters')
  }

  if (
    req.event &&
    req.event.data &&
    req.user &&
    req.event.data.user.id === req.user.id
  ) {
    return next()
  }

  try {
    const isAllowed = await acl.areAnyRolesAllowed(roles, path, method);
    if (isAllowed) {
      return next();
    } else {
      return res.status(403).json({ message: 'User is not authorized' });
    }
  } catch (err) {
    return res.status(500).send('Unexpected authorization error');
  }
}
