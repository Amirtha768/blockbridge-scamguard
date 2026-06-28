import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'payment_screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.userId;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    cb(null, `payment_${userId}_${timestamp}_${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG and JPEG allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// POST /api/payment-requests/submit - Submit payment proof
router.post('/submit', authenticate, upload.single('screenshot'), async (req, res) => {
  try {
    const { transactionId, plan } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a payment screenshot'
      });
    }

    if (!transactionId || transactionId.trim() === '') {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please provide a transaction ID'
      });
    }

    if (!plan || !['PRO', 'BUSINESS'].includes(plan)) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Please select a valid plan (PRO or BUSINESS)'
      });
    }

    // Determine amount based on plan
    const amount = plan === 'PRO' ? 199 : 499;

    // Store relative path for screenshot_url
    const screenshotUrl = `/api/admin/screenshots/${req.file.filename}`;

    // Insert payment request
    const [result] = await db.execute(
      `INSERT INTO payment_requests (user_id, plan, amount, screenshot_url, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [userId, plan, amount, screenshotUrl, transactionId]
    );

    res.json({
      success: true,
      message: 'Payment proof submitted successfully',
      requestId: result.insertId
    });
  } catch (error) {
    console.error('Error submitting payment proof:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment proof'
    });
  }
});

// GET /api/payment-requests/my-requests - Get user's payment requests
router.get('/my-requests', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [requests] = await db.execute(
      `SELECT id, plan, transaction_id, status, created_at, verified_at
       FROM payment_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment requests'
    });
  }
});

// Multer error handling middleware
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (err.message === 'Invalid file type. Only PNG and JPEG allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
});

export default router;
