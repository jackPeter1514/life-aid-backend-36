
const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllAppointments,
  updateSystemSettings,
  getSystemLogs
} = require('../controllers/adminController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Dashboard and management routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', checkPermission('update_users'), updateUserStatus);
router.get('/appointments', getAllAppointments);

// Super Admin only routes
router.put('/system/settings', authorize('super_admin'), updateSystemSettings);
router.get('/system/logs', authorize('super_admin'), getSystemLogs);

module.exports = router;
