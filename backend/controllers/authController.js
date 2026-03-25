import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { notifyAllAdmins } from './notificationController.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, dateOfBirth, gender, specialization, experience } = req.body;

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: `User with email ${email} already exists`,
        existingUser: {
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      address,
      dateOfBirth,
      gender,
      isApproved: role === 'admin' || role === 'patient' // Auto-approve admin and patients
    };

    // Add doctor-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.experience = experience;
    }

    const user = await User.create(userData);

    // Send notification to admins for ALL registrations
    await notifyAllAdmins(
      `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registration`,
      `${name} (${email}) has registered as a ${role}. Phone: ${phone || 'Not provided'}`,
      'info',
      { userId: user._id, userRole: role, action: 'registration' }
    );

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if doctor is approved
    if (user.role === 'doctor' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'Your doctor account is pending admin approval. Please wait for approval before accessing the system.',
        needsApproval: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        }
      });
    }

    // Notify admins about login activity
    await notifyAllAdmins(
      `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Login`,
      `${user.name} (${user.email}) has logged into the system`,
      'info',
      { userId: user._id, userRole: user.role, action: 'login' }
    );

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // If profileImage is being updated, validate its size
    if (req.body.profileImage && req.body.profileImage.length > 5000000) { // 5MB limit
      return res.status(400).json({ message: 'Profile image too large. Please use an image smaller than 5MB.' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Failed to update profile: ' + error.message });
  }
};