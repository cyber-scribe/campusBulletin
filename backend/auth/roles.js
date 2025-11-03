// Role constants
const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  STUDENT: 'student'
};

// Notice status constants
const NOTICE_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
};

// Permission matrix defining what each role can do
const PERMISSIONS = {
  [ROLES.ADMIN]: {
    notices: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      reject: true,
      publish: true,
      readAll: true // Can read all notices regardless of status
    }
  },
  [ROLES.STAFF]: {
    notices: {
      create: true,
      read: true,
      update: true, // Can only update their own notices
      delete: true, // Can only delete their own draft or pending approval notices
      approve: false,
      reject: false,
      publish: false,
      readAll: false // Can only read published notices and their own
    }
  },
  [ROLES.STUDENT]: {
    notices: {
      create: false,
      read: true, // Can only read published notices
      update: false,
      delete: false,
      approve: false,
      reject: false,
      publish: false,
      readAll: false
    }
  }
};

// Helper function to check if a user has permission for an action
const hasPermission = (role, resource, action) => {
  if (!PERMISSIONS[role] || !PERMISSIONS[role][resource]) {
    return false;
  }
  return PERMISSIONS[role][resource][action] === true;
};

module.exports = {
  ROLES,
  NOTICE_STATUS,
  PERMISSIONS,
  hasPermission
};