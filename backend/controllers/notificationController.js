import Notification from '../models/Notification.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Email failure tracking
let emailFailureCount = 0;
let lastEmailFailure = null;
const MAX_EMAIL_FAILURES = 3;
const EMAIL_COOLDOWN = 10 * 60 * 1000; // 10 minutes

// Create transporter with rate limiting
const getEmailTransporter = () => {
  // Check if we should skip email due to recent failures
  if (emailFailureCount >= MAX_EMAIL_FAILURES) {
    const timeSinceLastFailure = Date.now() - lastEmailFailure;
    if (timeSinceLastFailure < EMAIL_COOLDOWN) {
      console.log('🚫 Email service temporarily disabled due to failures');
      return null;
    } else {
      emailFailureCount = 0;
      lastEmailFailure = null;
    }
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials missing - EMAIL_USER:', !!process.env.EMAIL_USER, 'EMAIL_PASS:', !!process.env.EMAIL_PASS);
    return null;
  }
  
  try {
    console.log('🚀 Creating email transporter for:', process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 3
    });
    
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.log('❌ Transporter creation failed:', error.message);
    emailFailureCount++;
    lastEmailFailure = Date.now();
    return null;
  }
};

// Send email notification with proper error handling
const sendEmailNotification = async (recipientEmail, title, message) => {
  if (!recipientEmail) {
    console.log('❌ No recipient email provided');
    return false;
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log('❌ Email transporter not available');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `HMS Alert: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">${title}</h2>
          <p style="color: #34495e; line-height: 1.6;">${message}</p>
          <hr style="border: 1px solid #ecf0f1;">
          <p style="color: #7f8c8d; font-size: 12px;">
            <strong>Time:</strong> ${new Date().toLocaleString()}<br>
            <em>This is an automated notification from Health Management System</em>
          </p>
        </div>
      `
    };

    console.log('📧 Attempting to send email to:', recipientEmail);
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', recipientEmail);
    return true;
  } catch (emailError) {
    console.log('❌ Email sending failed:', emailError.message);
    emailFailureCount++;
    lastEmailFailure = Date.now();
    return false;
  }
};

// Create notification and send email
export const createNotification = async (recipientId, title, message, type = 'info', data = null) => {
  try {
    console.log('📝 Creating notification for user:', recipientId);
    
    const notification = new Notification({
      recipient: recipientId,
      title,
      message,
      type,
      data
    });

    await notification.save();
    await notification.populate('recipient', 'name email');
    
    console.log('✅ Notification saved for:', notification.recipient.email);

    // Send email notification (with failure handling)
    const emailSent = await sendEmailNotification(notification.recipient.email, title, message);
    
    if (emailSent) {
      console.log('✅ Email notification sent successfully');
    } else {
      console.log('⚠️ Email notification failed, but database notification saved');
    }

    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

// Get notifications for user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notify all admins (with rate limiting)
export const notifyAllAdmins = async (title, message, type = 'info', data = null) => {
  try {
    console.log('🔔 Notifying all admins:', title);
    const admins = await User.find({ role: 'admin' });
    console.log('👥 Found admins:', admins.length);
    
    if (admins.length === 0) {
      console.log('❌ No admins found to notify');
      return;
    }
    
    // Notify all admins, not just the first one
    for (const admin of admins) {
      console.log('📧 Creating notification for admin:', admin.email);
      await createNotification(admin._id, title, message, type, data);
    }
    
    console.log('✅ All admin notifications created');
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
  }
};

// Get email service status
export const getEmailStatus = async (req, res) => {
  try {
    const status = {
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      failureCount: emailFailureCount,
      isDisabled: emailFailureCount >= MAX_EMAIL_FAILURES,
      nextRetryTime: lastEmailFailure ? new Date(lastEmailFailure + EMAIL_COOLDOWN) : null
    };
    
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test email functionality
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || process.env.EMAIL_USER;
    
    console.log('🧪 Testing email to:', testEmail);
    const emailSent = await sendEmailNotification(
      testEmail,
      'Test Email',
      'This is a test email from HMS to verify email functionality.'
    );
    
    res.json({ 
      success: emailSent, 
      message: emailSent ? 'Test email sent successfully' : 'Test email failed to send'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};