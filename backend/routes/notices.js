const express = require('express');
const auth = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { ROLES } = require('../auth/roles');
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  approveNotice,
  rejectNotice,
  submitForApproval
} = require('../controllers/noticeController');

const router = express.Router(); 

// Public routes - accessible to all users
router.get('/', getNotices);
router.get('/:id', getNotice);

// Protected routes with role-based access control
// Create notice - Staff and Admin only
router.post('/', 
  auth, 
  requireRole([ROLES.STAFF, ROLES.ADMIN]), 
  requirePermission('notices', 'create'),
  upload.single('file'), 
  createNotice
);

// Update notice - Staff (own notices) and Admin only
router.put('/:id', 
  auth, 
  requireRole([ROLES.STAFF, ROLES.ADMIN]), 
  requirePermission('notices', 'update'),
  upload.single('file'), 
  updateNotice
);

// Delete notice - Admin can delete any, Staff can delete their own draft/pending notices
router.delete('/:id', 
  auth, 
  requireRole([ROLES.ADMIN, ROLES.STAFF]), 
  requirePermission('notices', 'delete'),
  deleteNotice
);

// Approval workflow routes
// Submit for approval - Staff only
router.patch('/:id/submit', 
  auth, 
  requireRole([ROLES.STAFF]), 
  submitForApproval
);

// Approve notice - Admin only
router.patch('/:id/approve', 
  auth, 
  requireRole([ROLES.ADMIN]), 
  requirePermission('notices', 'approve'),
  approveNotice
);

// Reject notice - Admin only
router.patch('/:id/reject', 
  auth, 
  requireRole([ROLES.ADMIN]), 
  requirePermission('notices', 'reject'),
  rejectNotice
);

module.exports = router;
