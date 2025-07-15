
const express = require('express');
const {
  createTest,
  getTestsByCenter,
  getAllTests,
  updateTest,
  deleteTest
} = require('../controllers/diagnosticTestController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllTests);
router.get('/center/:centerId', getTestsByCenter);

// Protected routes
router.use(protect);

// Admin and center admin routes
router.post('/', checkPermission('create_tests'), createTest);
router.put('/:id', checkPermission('update_tests'), updateTest);
router.delete('/:id', checkPermission('delete_tests'), deleteTest);

module.exports = router;
