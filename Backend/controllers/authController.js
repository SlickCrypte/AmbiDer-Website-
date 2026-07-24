const User = require('../models/user');
const Candidate = require('../models/candidate');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If role is candidate, auto-create a Candidate document
    let candidateProfile = null;

    if (role === 'candidate' || !role) {
      candidateProfile = await Candidate.create({
        name,
        email,
        phone: phone || '',
        skills: [],
        experience: '',
        education: '',
        currentStatus: 'Applied'
      });
    }

    // Create User and link to Candidate if applicable
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'candidate',
      phone: phone || '',
      candidateProfile: candidateProfile ? candidateProfile._id : null
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      candidateId: candidateProfile ? candidateProfile._id : null,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('candidateProfile');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        candidateId: user.candidateProfile?._id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        candidateId: user.candidateProfile?._id || null
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('candidateProfile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    // Update User
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, profilePicture },
      { new: true }
    ).select('-password');

    // Also update Candidate profile if exists
    if (user.candidateProfile) {
      await Candidate.findByIdAndUpdate(
        user.candidateProfile,
        { name, phone },
        { new: true }
      );
    }

    res.status(200).json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};