const { hasPermission } = require('../auth/roles');

/**
 * Middleware to check if a user has the required role(s) for an action
 * @param {string[]} roles - Array of roles that are allowed to access the route
 * @returns {function} Express middleware function
 */
const requireRole = (roles = []) => {
  return (req, res, next) => {
    // Auth middleware should run before this, so req.user should be available
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has at least one of the required roles
    const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};

/**
 * Middleware to check if a user has permission for a specific action on a resource
 * @param {string} resource - The resource being accessed (e.g., 'notices')
 * @param {string} action - The action being performed (e.g., 'create', 'read', 'update')
 * @returns {function} Express middleware function
 */
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    // Auth middleware should run before this, so req.user should be available
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has permission for the action on the resource
    const userHasPermission = req.user.roles.some(role => hasPermission(role, resource, action));
    
    if (!userHasPermission) {
      return res.status(403).json({ message: `Access denied: You don't have permission to ${action} ${resource}` });
    }

    next();
  };
};

module.exports = { requireRole, requirePermission };