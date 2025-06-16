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
          resources: '/api/products',
          permissions: '*'
        },
        {
          resources: '/api/products/import',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['user'],
      allows: [
        {
          resources: '/api/products',
          permissions: '*'
        },
        {
          resources: '/api/products/import',
          permissions: '*'
        }
      ]
    },
    {
      roles: ['guest'],
      allows: [
        /*{
          resources: '/api/products',
          permissions: '*'
        },*/
        {
          resources: '/api/products/import',
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

  // If an product is being processed and the current user created it then allow any manipulation
  if (
    req.product &&
    req.product.data &&
    req.user &&
    req.product.data.user.id === req.user.id
  ) {
    return next()
  }

  // Check for user roles
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
