
const express = require('express');
const {
  createAppointment,
  getUserAppointments,
  getCenterAppointments,
  updateAppointmentStatus,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for checking available slots (before protect middleware)
router.get('/available-slots', getAvailableSlots);

// All routes below are protected
router.use(protect);

// Patient routes
router.post('/', authorize('patient'), createAppointment);
router.get('/my-appointments', authorize('patient'), getUserAppointments);

// Center admin and admin routes
router.get('/center/:centerId?', authorize('admin', 'diagnostic_center_admin'), getCenterAppointments);
router.put('/:id/status', authorize('admin', 'diagnostic_center_admin'), updateAppointmentStatus);

module.exports = router;
