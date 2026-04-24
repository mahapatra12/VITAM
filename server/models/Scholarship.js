const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  id: {
    type: String, // e.g. SCH-001
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  budget: {
    type: Number,
    required: true
  },
  icon: {
    type: String, // lucide-react icon name string
    default: 'Award'
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
