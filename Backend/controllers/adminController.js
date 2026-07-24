const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Create Recruiter (Admin only)
exports.createRecruiter = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const recruiter = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'recruiter',
      phone: phone || '',
      isActive: true
    });

    res.status(201).json({
      message: 'Recruiter created successfully',
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
        isActive: recruiter.isActive,
        createdAt: recruiter.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get All Recruiters (Admin only)
exports.getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ role: 'recruiter' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: recruiters.length,
      recruiters
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Single Recruiter (Admin only)
exports.getRecruiter = async (req, res) => {
  try {
    const recruiter = await User.findOne({ _id: req.params.id, role: 'recruiter' })
      .select('-password');

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json(recruiter);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update Recruiter (Admin only)
exports.updateRecruiter = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const recruiter = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'recruiter' },
      { name, email, phone },
      { new: true }
    ).select('-password');

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json({ message: 'Recruiter updated', recruiter });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete Recruiter (Admin only)
exports.deleteRecruiter = async (req, res) => {
  try {
    const recruiter = await User.findOneAndDelete({ _id: req.params.id, role: 'recruiter' });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.status(200).json({ message: 'Recruiter deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Activate / Deactivate Recruiter (Admin only)
exports.toggleRecruiterStatus = async (req, res) => {
  try {
    const recruiter = await User.findOne({ _id: req.params.id, role: 'recruiter' });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    recruiter.isActive = !recruiter.isActive;
    await recruiter.save();

    res.status(200).json({
      message: `Recruiter ${recruiter.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: recruiter.isActive
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset Recruiter Password (Admin only)
exports.resetRecruiterPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const recruiter = await User.findOne({ _id: req.params.id, role: 'recruiter' });

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    recruiter.password = await bcrypt.hash(newPassword, 10);
    await recruiter.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
