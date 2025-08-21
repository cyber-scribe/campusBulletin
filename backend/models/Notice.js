const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Events', 'Clubs', 'General'],
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
  }
}, {
  timestamps: true
});

// Index for searching
noticeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Notice', noticeSchema); 
