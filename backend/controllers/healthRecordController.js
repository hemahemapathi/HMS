import HealthRecord from '../models/HealthRecord.js';
import { notifyAllAdmins } from './notificationController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/health-records/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const verifyHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const healthRecord = await HealthRecord.findByIdAndUpdate(
      id,
      { 
        isVerified: true,
        verifiedBy: req.user.id
      },
      { new: true }
    ).populate('verifiedBy', 'name role');
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }
    
    res.json({ success: true, message: 'Health record verified successfully', healthRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadHealthRecord = (req, res) => {
  const uploadSingle = upload.single('file');
  
  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);
      
      const healthRecord = new HealthRecord({
        patient: req.user.id,
        title: req.body.title || 'Health Record',
        description: req.body.description || '',
        recordType: req.body.recordType || req.body.type || 'other',
        files: req.file ? [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }] : [],
        uploadedBy: req.user.id
      });

      await healthRecord.save();
      await healthRecord.populate('patient', 'name email');
      await healthRecord.populate('uploadedBy', 'name role');

      // Notify admins about new health record upload
      await notifyAllAdmins(
        'New Health Record Uploaded',
        `${healthRecord.patient.name} uploaded a new health record: ${healthRecord.title}`,
        'info',
        { recordId: healthRecord._id, action: 'health_record_uploaded' }
      );

      res.status(201).json({ 
        success: true, 
        message: 'Health record uploaded successfully',
        record: healthRecord 
      });
    } catch (error) {
      console.error('Save error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export const getHealthRecords = async (req, res) => {
  try {
    console.log('Getting health records for user:', req.user.id, 'Role:', req.user.role);
    
    let query = {};
    // If user is admin, show all records. If patient, show only their records
    if (req.user.role !== 'admin') {
      query.patient = req.user.id;
    }
    
    const records = await HealthRecord.find(query)
      .populate('patient', 'name email')
      .populate('uploadedBy', 'name role')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 });
    console.log('Found records:', records.length);
    console.log('Records with files:', records.map(r => ({ id: r._id, title: r.title, hasFiles: r.files?.length > 0 })));
    res.json({ success: true, records });
  } catch (error) {
    console.error('Error getting health records:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find()
      .populate('patient', 'name email')
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    // If this is a preview request and record has files, serve the file
    if (req.path.includes('/preview') && healthRecord.files && healthRecord.files.length > 0) {
      const file = healthRecord.files[0];
      const filePath = path.join(__dirname, '../uploads/health-records/', file.filename);
      
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', 'inline');
        return res.sendFile(path.resolve(filePath));
      } else {
        return res.status(404).json({ message: 'File not found' });
      }
    }

    res.json({ success: true, healthRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id)
      .populate('patient', 'name email');
    
    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    await HealthRecord.findByIdAndDelete(req.params.id);

    // Notify admins about health record deletion
    await notifyAllAdmins(
      'Health Record Deleted',
      `Health record "${healthRecord.title}" for ${healthRecord.patient.name} has been deleted`,
      'warning',
      { recordId: req.params.id, action: 'health_record_deleted' }
    );

    res.json({ success: true, message: 'Health record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};