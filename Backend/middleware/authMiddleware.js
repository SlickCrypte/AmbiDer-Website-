/**
 * UPDATED authMiddleware.js
 * Added: isActive check for recruiters
 * Replace your existing middleware/authMiddleware.js with this
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Verify JWT token + check isActive status
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if recruiter account is still active
    if (decoded.role === 'recruiter') {
      const user = await User.findById(decoded.id).select('isActive');
      if (user && user.isActive === false) {
        return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(', ')} can perform this action.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
