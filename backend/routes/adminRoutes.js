import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { generateUniqueKey } from '../utils/keyGenerator.js';

const router = express.Router();

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is an admin
    const [admins] = await db.execute(
      'SELECT user_id, role FROM admin_users WHERE user_id = ?',
      [decoded.userId]
    );

    if (admins.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.user = { id: decoded.userId, role: admins[0].role };
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token'
    });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user
    const [users] = await db.execute(
      'SELECT id, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const user = users[0];

    // Check if user is an admin
    const [admins] = await db.execute(
      'SELECT role FROM admin_users WHERE user_id = ?',
      [user.id]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Generate JWT token (24 hours expiry for admin)
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: user.id,
        email: user.email,
        role: admins[0].role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// GET /api/admin/payment-requests - Get all payment requests
router.get('/payment-requests', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT pr.*, u.name as user_name, u.email as user_email
      FROM payment_requests pr
      JOIN users u ON pr.user_id = u.id
    `;

    const params = [];
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      query += ' WHERE pr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY pr.created_at DESC';

    const [requests] = await db.execute(query, params);

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

// GET /api/admin/payment-request/:id - Get single payment request
router.get('/payment-request/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [requests] = await db.execute(
      `SELECT pr.*, u.name as user_name, u.email as user_email
       FROM payment_requests pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.id = ?`,
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    res.json({
      success: true,
      request: requests[0]
    });
  } catch (error) {
    console.error('Error fetching payment request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment request'
    });
  }
});

// POST /api/admin/verify-payment - Verify payment and generate key
router.post('/verify-payment', authenticateAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { requestId } = req.body;
    const adminUserId = req.user.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    await connection.beginTransaction();

    // Get payment request
    const [requests] = await connection.execute(
      'SELECT * FROM payment_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    const request = requests[0];

    if (request.status !== 'PENDING') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Payment request is already ${request.status}`
      });
    }

    // Generate unique activation key
    const activationKey = await generateUniqueKey(connection);

    // Create activation key record
    await connection.execute(
      `INSERT INTO activation_keys (activation_key, user_id, plan, payment_request_id, status)
       VALUES (?, ?, ?, ?, 'UNUSED')`,
      [activationKey, request.user_id, request.plan, requestId]
    );

    // Update payment request status
    await connection.execute(
      `UPDATE payment_requests 
       SET status = 'APPROVED', verified_at = NOW(), verified_by = ?
       WHERE id = ?`,
      [adminUserId, requestId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Payment verified and activation key generated',
      activationKey
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  } finally {
    connection.release();
  }
});

// POST /api/admin/reject-payment - Reject payment request
router.post('/reject-payment', authenticateAdmin, async (req, res) => {
  try {
    const { requestId, notes } = req.body;
    const adminUserId = req.user.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Get payment request
    const [requests] = await db.execute(
      'SELECT status FROM payment_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    if (requests[0].status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Payment request is already ${requests[0].status}`
      });
    }

    // Update payment request
    await db.execute(
      `UPDATE payment_requests 
       SET status = 'REJECTED', verified_at = NOW(), verified_by = ?, admin_notes = ?
       WHERE id = ?`,
      [adminUserId, notes || null, requestId]
    );

    res.json({
      success: true,
      message: 'Payment request rejected'
    });
  } catch (error) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment'
    });
  }
});

// GET /api/admin/activation-keys - Get all activation keys
router.get('/activation-keys', authenticateAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT ak.*, u.email as user_email, u.name as user_name
      FROM activation_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status && ['UNUSED', 'USED', 'REVOKED', 'EXPIRED'].includes(status)) {
      query += ' AND ak.status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (ak.activation_key LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY ak.generated_at DESC';

    const [keys] = await db.execute(query, params);

    res.json({
      success: true,
      keys
    });
  } catch (error) {
    console.error('Error fetching activation keys:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activation keys'
    });
  }
});

// POST /api/admin/revoke-key - Revoke an unused activation key
router.post('/revoke-key', authenticateAdmin, async (req, res) => {
  try {
    const { keyId } = req.body;

    if (!keyId) {
      return res.status(400).json({
        success: false,
        message: 'Key ID is required'
      });
    }

    // Get key
    const [keys] = await db.execute(
      'SELECT status FROM activation_keys WHERE id = ?',
      [keyId]
    );

    if (keys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activation key not found'
      });
    }

    if (keys[0].status !== 'UNUSED') {
      return res.status(400).json({
        success: false,
        message: 'Only unused keys can be revoked'
      });
    }

    // Revoke key
    await db.execute(
      'UPDATE activation_keys SET status = \'REVOKED\' WHERE id = ?',
      [keyId]
    );

    res.json({
      success: true,
      message: 'Activation key revoked'
    });
  } catch (error) {
    console.error('Error revoking key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke key'
    });
  }
});

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get pending payment requests count
    const [pendingRequests] = await db.execute(
      'SELECT COUNT(*) as count FROM payment_requests WHERE status = \'PENDING\''
    );

    // Get active subscriptions count
    const [activeSubscriptions] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE subscription_status = \'ACTIVE\''
    );

    // Get total revenue (approved payments)
    const [revenue] = await db.execute(
      'SELECT SUM(amount) as total FROM payment_requests WHERE status = \'APPROVED\''
    );

    // Get recent activity (last 10 approved payments)
    const [recentActivity] = await db.execute(
      `SELECT pr.id, pr.plan, pr.amount, pr.verified_at, u.email as user_email
       FROM payment_requests pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.status = 'APPROVED'
       ORDER BY pr.verified_at DESC
       LIMIT 10`
    );

    // Get total users count
    const [totalUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users'
    );

    // Get PRO users count
    const [proUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE plan = \'PRO\''
    );

    // Get BUSINESS users count
    const [businessUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE plan = \'BUSINESS\''
    );

    // Get today's scans count
    const today = new Date().toISOString().split('T')[0];
    const [todayScans] = await db.execute(
      'SELECT COUNT(*) as count FROM scan_history WHERE DATE(created_at) = ?',
      [today]
    );

    res.json({
      success: true,
      stats: {
        pendingPayments: pendingRequests[0].count,
        activeSubscriptions: activeSubscriptions[0].count,
        totalRevenue: revenue[0].total || 0,
        totalUsers: totalUsers[0].count,
        proUsers: proUsers[0].count,
        businessUsers: businessUsers[0].count,
        todayScans: todayScans[0].count,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { search, plan } = req.query;

    let query = `
      SELECT id, name, email, plan, subscription_status, 
             subscription_start, subscription_end, created_at
      FROM users
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (plan && ['FREE', 'PRO', 'BUSINESS'].includes(plan)) {
      query += ' AND plan = ?';
      params.push(plan);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await db.execute(query, params);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/admin/screenshots/:filename - Serve payment screenshot
router.get('/screenshots/:filename', authenticateAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const uploadDir = path.join(process.cwd(), 'uploads', 'payment_screenshots');
    const filePath = path.join(uploadDir, filename);

    // Security check - ensure file is in upload directory
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving screenshot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file'
    });
  }
});

export default router;


// GET /api/admin/contact-messages - Get all contact messages
router.get('/contact-messages', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM contact_messages';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [messages] = await db.execute(query, params);
    
    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages'
    });
  }
});

// PATCH /api/admin/contact-messages/:id/status - Update message status
router.patch('/contact-messages/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, replied, or archived'
      });
    }
    
    await db.execute(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({
      success: true,
      message: 'Message status updated'
    });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
});

// GET /api/admin/scam-reports - Get all scam reports
router.get('/scam-reports', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM scam_reports';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [reports] = await db.execute(query, params);
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Get scam reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scam reports'
    });
  }
});
