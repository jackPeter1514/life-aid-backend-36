
const express = require('express');
const multer = require('multer');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllAppointments,
  updateSystemSettings,
  getSystemLogs,
  getCustomerRequests,
  approveCustomerRequest,
  rejectCustomerRequest,
  getTestHistory,
  getPendingResults,
  uploadTestResults
} = require('../controllers/adminController');
const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG files are allowed.'));
    }
  }
});

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'super_admin'));

// Dashboard and management routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/status', checkPermission('update_users'), updateUserStatus);
router.get('/appointments', getAllAppointments);

// Customer request management
router.get('/customer-requests', getCustomerRequests);
router.put('/customer-requests/:id/approve', approveCustomerRequest);
router.put('/customer-requests/:id/reject', rejectCustomerRequest);

// Test history and results
router.get('/test-history', getTestHistory);
router.get('/pending-results', getPendingResults);
router.post('/upload-results', upload.single('file'), uploadTestResults);

// Super Admin only routes
router.put('/system/settings', authorize('super_admin'), updateSystemSettings);
router.get('/system/logs', authorize('super_admin'), getSystemLogs);

module.exports = router;
