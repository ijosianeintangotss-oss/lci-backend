// routes/userRoutes.js
const express = require('express');
const { 
  getUsers, 
  updateUserStatus, 
  getUserDashboard 
} = require('../controllers/userController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin routes
router.get('/', authMiddleware, isAdmin, getUsers);
router.put('/:id/status', authMiddleware, isAdmin, updateUserStatus);

// Client dashboard route - FIXED: No email parameter needed
router.get('/dashboard', authMiddleware, getUserDashboard);

module.exports = router;