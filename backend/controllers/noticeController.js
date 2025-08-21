const Notice = require('../models/Notice');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;


const getNotices = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const notices = await Notice.find(query)
      .sort({ datePosted: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      notices,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ success: true, notice });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const createNotice = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    let fileUrl = null;
    let filePublicId = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'notice-board',
        resource_type: 'auto'
      });
      
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
      
      await fs.unlink(req.file.path);
    }

    const notice = await Notice.create({
      title,
      description,
      category,
      fileUrl,
      filePublicId
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    console.error('Create notice error:', error);
    
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    let fileUrl = notice.fileUrl;
    let filePublicId = notice.filePublicId;


    if (req.file) {
      
      if (notice.filePublicId) {
        await cloudinary.uploader.destroy(notice.filePublicId);
      }
console.log(req.file)
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'notice-board',
        resource_type: 'auto'
      });
      
      fileUrl = result.secure_url;
      filePublicId = result.public_id;
      
      await fs.unlink(req.file.path);
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, description, category, fileUrl, filePublicId },
      { new: true }
    );

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

module.exports = {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
};
