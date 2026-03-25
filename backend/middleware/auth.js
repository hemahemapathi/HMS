import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Received token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('Found user:', user ? user.email : 'User not found');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    // Additional check for doctors - must be approved
    if (req.user.role === 'doctor' && !req.user.isApproved) {
      return res.status(403).json({ 
        message: 'Your doctor account is pending admin approval',
        needsApproval: true 
      });
    }
    
    next();
  };
};

export const doctorApprovalCheck = (req, res, next) => {
  if (req.user.role === 'doctor' && !req.user.isApproved) {
    return res.status(403).json({ 
      message: 'Doctor account not approved by admin yet.' 
    });
  }
  next();
};