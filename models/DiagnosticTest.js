
const mongoose = require('mongoose');

const diagnosticTestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['blood_test', 'imaging', 'cardiology', 'pathology', 'radiology', 'other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Duration is required']
  },
  preparationInstructions: {
    type: String,
    trim: true
  },
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosticTest', diagnosticTestSchema);
