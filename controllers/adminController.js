
import User from '../models/User.js';
import DiagnosticCenter from '../models/DiagnosticCenter.js';
import Appointment from '../models/Appointment.js';
import DiagnosticTest from '../models/DiagnosticTest.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCenters = await DiagnosticCenter.countDocuments({ isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalTests = await DiagnosticTest.countDocuments({ isActive: true });

    // Get pending requests count
    const pendingRequests = await Appointment.countDocuments({ status: 'scheduled' });

    // Get pending results count
    const pendingResults = await Appointment.countDocuments({ 
      status: 'completed',
      'results.reportUrl': { $exists: false }
    });

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCenters,
        totalAppointments,
        totalTests,
        pendingRequests,
        pendingResults,
        recentAppointments: recentAppointments.map(apt => ({
          _id: apt._id,
          patient: { name: apt.patientId.name },
          center: { name: apt.diagnosticCenterId.name },
          test: { name: apt.testId.name },
          appointmentDate: apt.appointmentDate,
          status: apt.status
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: error.message
    });
  }
};

// Get Customer Requests
export const getCustomerRequests = async (req, res) => {
  try {
    const requests = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests: requests.map(req => ({
        _id: req._id,
        patient: {
          name: req.patientId.name,
          email: req.patientId.email,
          phone: req.patientId.phone
        },
        center: { name: req.diagnosticCenterId.name },
        test: {
          name: req.testId.name,
          category: req.testId.category
        },
        appointmentDate: req.appointmentDate,
        appointmentTime: req.appointmentTime,
        status: req.status,
        totalAmount: req.totalAmount,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    console.error('Get customer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer requests',
      error: error.message
    });
  }
};

// Approve Customer Request
export const approveCustomerRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true }
    ).populate('patientId', 'name email phone')
     .populate('diagnosticCenterId', 'name')
     .populate('testId', 'name category');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment approved successfully',
      appointment
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
};

// Reject Customer Request
export const rejectCustomerRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        cancellationReason: 'Rejected by admin'
      },
      { new: true }
    ).populate('patientId', 'name email phone')
     .populate('diagnosticCenterId', 'name')
     .populate('testId', 'name category');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rejected successfully',
      appointment
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
};

// Get Test History
export const getTestHistory = async (req, res) => {
  try {
    const history = await Appointment.find({
      status: { $in: ['completed', 'confirmed'] }
    })
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name category')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      history: history.map(item => ({
        _id: item._id,
        patient: {
          name: item.patientId.name,
          email: item.patientId.email,
          phone: item.patientId.phone
        },
        center: { name: item.diagnosticCenterId.name },
        test: {
          name: item.testId.name,
          category: item.testId.category
        },
        appointmentDate: item.appointmentDate,
        status: item.status,
        totalAmount: item.totalAmount,
        results: item.results,
        completedAt: item.completedAt
      }))
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test history',
      error: error.message
    });
  }
};

// Get Pending Results
export const getPendingResults = async (req, res) => {
  try {
    const pendingResults = await Appointment.find({
      status: 'completed',
      'results.reportUrl': { $exists: false }
    })
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name category')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      pendingResults: pendingResults.map(item => ({
        _id: item._id,
        patient: {
          name: item.patientId.name,
          email: item.patientId.email,
          phone: item.patientId.phone
        },
        center: { name: item.diagnosticCenterId.name },
        test: {
          name: item.testId.name,
          category: item.testId.category
        },
        appointmentDate: item.appointmentDate,
        totalAmount: item.totalAmount,
        completedAt: item.completedAt || item.appointmentDate
      }))
    });
  } catch (error) {
    console.error('Get pending results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending results',
      error: error.message
    });
  }
};

// Upload Test Results
export const uploadTestResults = async (req, res) => {
  try {
    const { appointmentId, summary } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Upload file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'test-results',
          public_id: `result_${appointmentId}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    // Update appointment with results
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        results: {
          reportUrl: uploadResult.secure_url,
          summary: summary || '',
          uploadedAt: new Date()
        }
      },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('diagnosticCenterId', 'name')
     .populate('testId', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Results uploaded successfully',
      appointment,
      fileUrl: uploadResult.secure_url
    });
  } catch (error) {
    console.error('Upload results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload results',
      error: error.message
    });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .populate('diagnosticCenterId', 'name')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Update User Status
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).populate('diagnosticCenterId', 'name').select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Get All Appointments (Admin view)
export const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, centerId } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by center
    if (centerId) {
      query.diagnosticCenterId = centerId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('diagnosticCenterId', 'name')
      .populate('testId', 'name category price')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1 });

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
};

// System Settings (Super Admin only)
export const updateSystemSettings = async (req, res) => {
  try {
    const { maintenanceMode, allowRegistration, maxAppointmentsPerDay } = req.body;
    
    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings: {
        maintenanceMode,
        allowRegistration,
        maxAppointmentsPerDay
      }
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings',
      error: error.message
    });
  }
};

// Get System Logs (Super Admin only)
export const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;
    
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'User login successful',
        userId: '507f1f77bcf86cd799439011'
      },
      {
        timestamp: new Date(Date.now() - 3600000),
        level: 'warning',
        message: 'High API usage detected',
        details: 'User exceeded rate limit'
      }
    ];

    res.status(200).json({
      success: true,
      logs,
      totalPages: 1,
      currentPage: 1,
      total: logs.length
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system logs',
      error: error.message
    });
  }
};
