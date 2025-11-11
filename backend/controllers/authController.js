const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.warn('Nodemailer is not installed. Password reset emails will be logged to the console.');
}

const User = require('../models/User');
const { ROLES } = require('../auth/roles');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const getFrontendBaseUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const subject = 'Campus Bulletin Password Reset Request';
  const text = `Hi ${name || 'there'},\n\n` +
    'We received a request to reset the password for your Campus Bulletin account. ' +
    'If you made this request, click the link below to set a new password.\n\n' +
    `${resetUrl}\n\n` +
    'This link will expire in 15 minutes. If you did not request a password reset, no further action is required.\n\n' +
    'Best regards,\nCampus Bulletin Team';

  if (nodemailer) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text
    });
  } else {
    console.info('Password reset email (console fallback):');
    console.info('To:', email);
    console.info(text);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has admin or staff role
    const hasAccess = user.roles.some(role => 
      [ROLES.ADMIN, ROLES.STAFF].includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to access the admin area' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        studentId: user.studentId,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, roles = [ROLES.ADMIN] } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate roles
    const validRoles = roles.every(role => Object.values(ROLES).includes(role));
    if (!validRoles) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.create({ name, email, password, roles });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        studentId: user.studentId,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, password, roles = [ROLES.STAFF] } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate roles
    const validRoles = roles.every(role => Object.values(ROLES).includes(role));
    if (!validRoles) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.create({ name, email, password, roles });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        studentId: user.studentId,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        studentId: user.studentId,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student registration function
const studentRegister = async (req, res) => {
  try {
    const { name, email, password} = req.body;
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // // Check if studentId already exists
    // if (studentId) {
    //   const existingStudentId = await User.findOne({ studentId });
    //   if (existingStudentId) {
    //     return res.status(400).json({ message: 'Student ID already registered' });
    //   }
    // }
    
    const student = await User.create({
      name,
      email,
      password,
      roles: [ROLES.STUDENT]
    });
    
    res.status(201).json({ 
      success: true,
      message: "Student registered successfully",
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        roles: student.roles
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student login function
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has student role
    if (!user.roles.includes(ROLES.STUDENT)) {
      return res.status(403).json({ 
        message: 'Access denied: This account is not a student account' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        roles: user.roles,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff login function
const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has staff role
    if (!user.roles.includes(ROLES.STAFF)) {
      return res.status(403).json({ 
        message: 'Access denied: This account is not a staff account' 
      });
    }

    const token = generateToken(user._id);


    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        roles: user.roles,
        studentId: user.studentId,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('_id name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password - request reset link
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });

  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${getFrontendBaseUrl()}/auth/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl
      });
    } catch (error) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save({ validateBeforeSave: false });
      console.error('Failed to send password reset email:', error);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
  }

  return res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
};

// Reset password using token
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in with your new password.' });
};

module.exports = { 
  loginAdmin, 
  createAdmin, 
  getCurrentUser, 
  studentRegister, 
  studentLogin, 
  staffLogin,
  createStaff,
  updateProfile,
  changePassword,
  uploadAvatar,
  getUserById,
  forgotPassword,
  resetPassword
};

// Update current user's profile
async function updateProfile(req, res) {
  try {
    const { name, email, studentId, department, branch, year } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (studentId !== undefined) updates.studentId = studentId;
    if (department !== undefined) updates.department = department;
    if (branch !== undefined) updates.branch = branch;
    if (year !== undefined) updates.year = year;

    // Uniqueness checks when changing email or studentId
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    if (studentId) {
      const existingId = await User.findOne({ studentId, _id: { $ne: req.user._id } });
      if (existingId) {
        return res.status(400).json({ message: 'Student ID already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        studentId: user.studentId,
        department: user.department,
        branch: user.branch,
        year: user.year,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Change current user's password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Upload or replace avatar
async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete previous avatar if exists
    if (user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (e) {}
    }

    // Upload new avatar
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user-avatars',
      resource_type: 'image',
      transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }]
    });

    // Clean up local file
    try { await fs.unlink(req.file.path); } catch (e) {}

    user.avatarUrl = uploadResult.secure_url;
    user.avatarPublicId = uploadResult.public_id;
    await user.save();

    res.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
