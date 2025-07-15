
const express = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPermissions
} = require('../controllers/userController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD routes
router.post('/', checkPermission('create_users'), createUser);
router.get('/', checkPermission('read_users'), getAllUsers);
router.get('/:id', checkPermission('read_users'), getUserById);
router.put('/:id', checkPermission('update_users'), updateUser);
router.delete('/:id', checkPermission('delete_users'), deleteUser);

// IAM routes (Super Admin only)
router.put('/:id/permissions', authorize('super_admin'), updateUserPermissions);

module.exports = router;
