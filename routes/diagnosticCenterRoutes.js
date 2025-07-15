
const express = require('express');
const {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter
} = require('../controllers/diagnosticCenterController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllCenters);
router.get('/:id', getCenterById);

// Protected routes
router.use(protect);

// Admin and Super Admin routes
router.post('/', checkPermission('create_centers'), createCenter);
router.put('/:id', checkPermission('update_centers'), updateCenter);
router.delete('/:id', checkPermission('delete_centers'), deleteCenter);

module.exports = router;
