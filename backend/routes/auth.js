const express = require('express');
const { loginAdmin, createAdmin } = require('../controllers/authController');

const router = express.Router();

// POST /api/admin/login
router.post('/login', loginAdmin);

// POST /api/admin/create (remove in production)
router.post('/create', createAdmin);

module.exports = router;

