const Notice = require('../models/Notice');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const { NOTICE_STATUS, ROLES } = require('../auth/roles');


const parsePagination = (page = '1', limit = '50') => {
  const pageValue = Array.isArray(page) ? page[0] : page;
  const limitValue = Array.isArray(limit) ? limit[0] : limit;

  const pageNumber = Math.max(parseInt(pageValue, 10) || 1, 1);

  let limitNumber;
  if (!limitValue) {
    limitNumber = 50;
  } else if (typeof limitValue === 'string' && limitValue.toLowerCase() === 'all') {
    limitNumber = 0;
  } else {
    const parsedLimit = parseInt(limitValue, 10);
    limitNumber = Number.isNaN(parsedLimit) ? 50 : Math.max(parsedLimit, 0);
  }

  return { pageNumber, limitNumber };
};

const applyPagination = (queryBuilder, pageNumber, limitNumber) => {
  if (limitNumber > 0) {
    queryBuilder = queryBuilder
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber);
  }
  return queryBuilder;
};

const populateNoticeRefs = (queryBuilder) => {
  return queryBuilder
    .populate('createdBy', '_id name email')
    .populate('approvedBy', '_id name email')
    .populate('rejectedBy', '_id name email')
    .sort({ datePosted: -1, createdAt: -1 });
};

const getNotices = async (req, res) => {
  try {
    console.log("\n========== GET NOTICES REQUEST ==========");
    console.log("👤 User:", req.user ? {
      id: req.user._id,
      name: req.user.name,
      roles: req.user.roles
    } : "Not authenticated");
    console.log("🔍 Query params:", req.query);
    
    const { category, search, page = '1', limit = '50', status } = req.query;

    const { pageNumber, limitNumber } = parsePagination(page, limit);

    let query = { isActive: true };
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Handle status filtering based on user role
    if (req.user) {
      // Admin can see all notices or filter by status
      if (req.user.roles.includes(ROLES.ADMIN)) {
        if (status) {
          query.status = status;
        }
      } 
      // Staff can see published notices and their own notices
      else if (req.user.roles.includes(ROLES.STAFF)) {
        if (status) {
          // Staff can filter their own notices by status
          query.$and = [
            { $or: [
              { status: NOTICE_STATUS.PUBLISHED },
              { createdBy: req.user._id }
            ]},
            { status: status }
          ];
        } else {
          // Default: show published notices and their own notices
          query.$or = [
            { status: NOTICE_STATUS.PUBLISHED },
            { createdBy: req.user._id }
          ];
        }
      }
      // Students can only see published notices
      else {
        query.status = NOTICE_STATUS.PUBLISHED;
      }
    } else {
      // Public users (not logged in) can only see published notices
      query.status = NOTICE_STATUS.PUBLISHED;
    }

    let queryBuilder = populateNoticeRefs(Notice.find(query));
    queryBuilder = applyPagination(queryBuilder, pageNumber, limitNumber);

    const notices = await queryBuilder;

    const total = await Notice.countDocuments(query);

    console.log("📊 Query used:", JSON.stringify(query, null, 2));
    console.log("📦 Found", notices.length, "notices");
    console.log("📋 Notice details:");
    notices.forEach((notice, index) => {
      console.log(`  ${index + 1}. ${notice.title} - Status: ${notice.status} - CreatedBy: ${notice.createdBy?._id || notice.createdBy}`);
    });
    console.log("==========================================\n");

    res.json({
      success: true,
      notices,
      pagination: {
        current: pageNumber,
        pages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 1,
        total,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', '_id name email')
      .populate('approvedBy', '_id name email')
      .populate('rejectedBy', '_id name email');
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ success: true, notice });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyNotices = async (req, res) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;

    const { pageNumber, limitNumber } = parsePagination(page, limit);

    const query = { createdBy: req.user._id };

    if (typeof status === 'string' && Object.values(NOTICE_STATUS).includes(status)) {
      query.status = status;
    }

    let queryBuilder = populateNoticeRefs(Notice.find(query));
    queryBuilder = applyPagination(queryBuilder, pageNumber, limitNumber);

    const notices = await queryBuilder;
    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      notices,
      pagination: {
        current: pageNumber,
        pages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 1,
        total,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error('Get my notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingApprovalNotices = async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query;

    const { pageNumber, limitNumber } = parsePagination(page, limit);

    const query = { status: NOTICE_STATUS.PENDING_APPROVAL };

    let queryBuilder = populateNoticeRefs(Notice.find(query));
    queryBuilder = applyPagination(queryBuilder, pageNumber, limitNumber);

    const notices = await queryBuilder;
    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      notices,
      pagination: {
        current: pageNumber,
        pages: limitNumber > 0 ? Math.ceil(total / limitNumber) : 1,
        total,
        limit: limitNumber
      }
    });
  } catch (error) {
    console.error('Get pending approval notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const createNotice = async (req, res) => {
  try {
    console.log("\n========== CREATE NOTICE REQUEST ==========");
    console.log("📝 Request Body:", req.body);
    console.log("👤 User:", {
      id: req.user._id,
      name: req.user.name,
      roles: req.user.roles
    });
    
    const { title, description, category, status } = req.body;
    console.log("📋 Parsed Data:", { title, description, category, status });

    if (!description || !description.trim()) {
      console.log("⚠️ Missing description in request");
      return res.status(400).json({ message: "Description is required" });
    }

    let fileUrl = null;
    let filePublicId = null;

    if (req.file) {
      console.log("📁 Uploading file:", req.file.originalname);
      console.log("📄 File type:", req.file.mimetype);
      console.log("📊 File size:", req.file.size, "bytes");

      try {
        // Cloudinary upload
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "notice-board",
          resource_type: req.file.mimetype.startsWith("image/") ? "image" : "raw",
          access_mode: "public",
          use_filename: true,
          unique_filename: true,
        });

        fileUrl = uploadResult.secure_url;
        filePublicId = uploadResult.public_id;

        console.log("✅ File uploaded successfully");
        console.log("🔗 File URL:", fileUrl);
        console.log("🆔 Public ID:", filePublicId);
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);

        // Clean up local file
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.warn('Warning: Could not delete temporary file:', unlinkError.message);
        }

        return res.status(500).json({
          message: "File upload failed",
          error: uploadError.message,
        });
      }

      // Always clean up local tmp file
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temporary file:', unlinkError.message);
      }
    }

    // Determine the initial status based on user role and request
    let initialStatus;
    let approvedBy = null;
    let approvedAt = null;
    
    console.log("🔍 Determining status...");
    if (req.user.roles.includes(ROLES.ADMIN)) {
      // Admins can create notices with any status
      initialStatus = status || NOTICE_STATUS.DRAFT;
      console.log("👑 Admin creating notice with status:", initialStatus);
      
      // If admin is directly publishing, set approvedBy and approvedAt
      if (initialStatus === NOTICE_STATUS.PUBLISHED) {
        approvedBy = req.user._id;
        approvedAt = new Date();
        console.log("✅ Auto-approving admin notice");
      }
    } else {
      // Staff can only create drafts or submit for approval
      initialStatus = status === NOTICE_STATUS.PENDING_APPROVAL ? 
        NOTICE_STATUS.PENDING_APPROVAL : NOTICE_STATUS.DRAFT;
      console.log("👨‍💼 Staff creating notice with status:", initialStatus);
    }

    console.log("💾 Creating notice in database...");
    const noticeData = {
      title,
      description: description.trim(),
      category,
      fileUrl,
      filePublicId,
      status: initialStatus,
      createdBy: req.user._id,
      approvedBy: initialStatus === NOTICE_STATUS.PUBLISHED ? req.user._id : null,
      approvedAt: initialStatus === NOTICE_STATUS.PUBLISHED ? new Date() : null
    };
    console.log("📦 Notice data:", noticeData);

    const notice = await Notice.create(noticeData);

    console.log("✅ NOTICE CREATED SUCCESSFULLY!");
    console.log("🆔 Notice ID:", notice._id);
    console.log("📌 Notice Status:", notice.status);
    console.log("👤 Created By:", notice.createdBy);
    console.log("==========================================\n");

    res.status(201).json({ success: true, notice });
  } catch (error) {
    console.error("\n❌ CREATE NOTICE ERROR ❌");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("==========================================\n");

    // Clean up tmp file if error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn("Warning: Could not delete temporary file:", unlinkError.message);
      }
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const updateNotice = async (req, res) => {
  try {
    console.log('Update notice request received for ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { title, description, category, status } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      console.log('Notice not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Notice not found' });
    }

    console.log('Found notice:', notice);

    // Check if user has permission to update this notice
    if (!req.user.roles.includes(ROLES.ADMIN) && 
        notice.createdBy.toString() !== req.user._id.toString()) {
      console.log('Permission denied for user:', req.user._id);
      return res.status(403).json({ 
        message: 'Access denied: You can only update your own notices' 
      });
    }

    let fileUrl = notice.fileUrl;
    let filePublicId = notice.filePublicId;

    if (req.file) {
      console.log('New file uploaded, replacing existing file');
      if (notice.filePublicId) {
        await cloudinary.uploader.destroy(notice.filePublicId);
      }
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'notice-board',
        resource_type: 'auto'
      });
      
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
      
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temporary file:', unlinkError.message);
      }
    } else {
      console.log('No new file uploaded, keeping existing file');
    }

    // Handle status transitions based on user role
    let newStatus = notice.status;
    let approvedBy = notice.approvedBy;
    let approvedAt = notice.approvedAt;
    
    if (status && status !== notice.status) {
      console.log('Status change requested from', notice.status, 'to', status);
      if (req.user.roles.includes(ROLES.ADMIN)) {
        // Admins can change to any status
        newStatus = status;
        
        // If publishing, record who approved and when
        if (status === NOTICE_STATUS.PUBLISHED) {
          approvedBy = req.user._id;
          approvedAt = new Date();
        }
      } else if (req.user.roles.includes(ROLES.STAFF)) {
        // Staff can only submit for approval or save as draft
        if (status === NOTICE_STATUS.PENDING_APPROVAL || 
            status === NOTICE_STATUS.DRAFT) {
          newStatus = status;
        } else {
          return res.status(403).json({ 
            message: 'Access denied: You cannot change to this status' 
          });
        }
      }
    }

    const updateData = {
      title,
      description: typeof description === 'string' && description.trim() !== '' ? description : notice.description,
      category,
      fileUrl,
      filePublicId,
      status: newStatus,
      approvedBy,
      approvedAt
    };

    console.log('Updating notice with data:', updateData);

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    console.log('Notice updated successfully:', updatedNotice);

    res.json({ success: true, notice: updatedNotice });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user has permission to delete this notice
    // Admin can delete any notice
    // Staff can only delete their own notices that are in DRAFT or PENDING_APPROVAL status
    if (!req.user.roles.includes(ROLES.ADMIN)) {
      if (notice.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Access denied: You can only delete your own notices' 
        });
      }
      
      if (notice.status !== NOTICE_STATUS.DRAFT && notice.status !== NOTICE_STATUS.PENDING_APPROVAL) {
        return res.status(403).json({ 
          message: 'Access denied: You can only delete draft or pending approval notices' 
        });
      }
    }

    if (notice.filePublicId) {
      await cloudinary.uploader.destroy(notice.filePublicId);
    }

    await Notice.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a notice (Admin only)
const approveNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Only pending notices can be approved
    if (notice.status !== NOTICE_STATUS.PENDING_APPROVAL) {
      return res.status(400).json({ 
        message: 'Only notices pending approval can be approved' 
      });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { 
        status: NOTICE_STATUS.PUBLISHED,
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null
      },
      { new: true }
    )
      .populate('createdBy', '_id name email')
      .populate('approvedBy', '_id name email')
      .populate('rejectedBy', '_id name email');

    res.json({ 
      success: true, 
      notice: updatedNotice,
      message: 'Notice approved and published successfully'
    });
  } catch (error) {
    console.error('Approve notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a notice (Admin only) - Deletes the notice
const rejectNotice = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Only pending notices can be rejected
    if (notice.status !== NOTICE_STATUS.PENDING_APPROVAL) {
      return res.status(400).json({ 
        message: 'Only notices pending approval can be rejected' 
      });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        status: NOTICE_STATUS.REJECTED,
        rejectionReason: rejectionReason || 'No reason provided',
        rejectedBy: req.user._id,
        rejectedAt: new Date(),
        approvedBy: null,
        approvedAt: null
      },
      { new: true }
    )
      .populate('createdBy', '_id name email')
      .populate('approvedBy', '_id name email')
      .populate('rejectedBy', '_id name email');

    res.json({ 
      success: true, 
      message: 'Notice rejected successfully',
      notice: updatedNotice
    });
  } catch (error) {
    console.error('Reject notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a notice for approval (Staff)
const submitForApproval = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check if user is the creator of this notice
    if (notice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied: You can only submit your own notices for approval' 
      });
    }

    // Only draft notices can be submitted for approval
    if (notice.status !== NOTICE_STATUS.DRAFT) {
      return res.status(400).json({ 
        message: 'Only draft notices can be submitted for approval' 
      });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { 
        status: NOTICE_STATUS.PENDING_APPROVAL,
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null,
        rejectedBy: null,
        rejectedAt: null
      },
      { new: true }
    )
      .populate('createdBy', '_id name email')
      .populate('approvedBy', '_id name email')
      .populate('rejectedBy', '_id name email');

    res.json({ 
      success: true, 
      notice: updatedNotice,
      message: 'Notice submitted for approval successfully'
    });
  } catch (error) {
    console.error('Submit for approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotices,
  getNotice,
  getMyNotices,
  getPendingApprovalNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  approveNotice,
  rejectNotice,
  submitForApproval
};
