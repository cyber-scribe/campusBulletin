const mongoose = require('mongoose');
const { NOTICE_STATUS } = require('../auth/roles');

// Define allowed categories (easy to modify)
const ALLOWED_CATEGORIES = [
  'Academic',
  'Exam', 
  'Event',
  'Events', 
  'Clubs', 
  'General',
  'Sports',
  'Library',
  'Placement',
];

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ALLOWED_CATEGORIES,
    default: 'General'
  },
  fileUrl: {
    type: String,
    default: null
  },
  filePublicId: {
    type: String,
    default: null
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: Object.values(NOTICE_STATUS),
    default: NOTICE_STATUS.DRAFT
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for searching
noticeSchema.index({ title: 'text' });

// Export the model
const Notice = mongoose.model('Notice', noticeSchema);

// Export categories for use in other files
Notice.ALLOWED_CATEGORIES = ALLOWED_CATEGORIES;

module.exports = Notice;