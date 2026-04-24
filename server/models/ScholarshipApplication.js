const mongoose = require('mongoose');

const scholarshipApplicationSchema = new mongoose.Schema({
  id: {
    type: String, // e.g. APP-001
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'shortlisted', 'awarded', 'rejected'],
    default: 'submitted'
  },
  academicSnapshot: {
    cgpa: { type: Number, required: true },
    attendance: { type: Number, required: true }
  },
  income: {
    type: Number,
    default: null
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  remarks: {
    type: String,
    default: ''
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ScholarshipApplication', scholarshipApplicationSchema);
