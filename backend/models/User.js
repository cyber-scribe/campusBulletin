const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('../auth/roles');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  verificationTokenExpires: {
    type: Date,
    default: null
  },
  avatarUrl: {
    type: String,
    default: null
  },
  avatarPublicId: {
    type: String,
    default: null
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true
  },
  department: {
    type: String,
    default: null
  },
  branch: {
    type: String,
    default: null
  },
  year: {
    type: String,
    default: null
  },
  roles: {
    type: [String],
    enum: Object.values(ROLES),
    default: [ROLES.STUDENT]
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
 
