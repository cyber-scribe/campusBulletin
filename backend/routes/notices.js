const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');

const router = express.Router(); 

// Public routes
router.get('/', getNotices);
router.get('/:id', getNotice);

// Admin routes (protected)
router.post('/', auth, upload.single('file'), createNotice);
router.put('/:id', auth, upload.single('file'), updateNotice);
router.delete('/:id', auth, deleteNotice);

module.exports = router;
