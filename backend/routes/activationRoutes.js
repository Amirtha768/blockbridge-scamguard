import express from 'express';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { isValidKeyFormat, calculateExpiryDate } from '../utils/keyGenerator.js';

const router = express.Router();

// POST /api/activation/activate - Activate subscription with key
router.post('/activate', authenticate, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { activationKey } = req.body;
    const userId = req.user.userId;

    // Validate key format
    if (!activationKey || !isValidKeyFormat(activationKey)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activation key format'
      });
    }

    await connection.beginTransaction();

    // Check if key exists
    const [keys] = await connection.execute(
      `SELECT id, user_id, plan, status FROM activation_keys WHERE activation_key = ?`,
      [activationKey]
    );

    if (keys.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Invalid activation key'
      });
    }

    const key = keys[0];

    // Verify key belongs to this user
    if (key.user_id !== userId) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'This key is not valid for your account'
      });
    }

    // Check key status
    if (key.status === 'USED') {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'This key has already been used'
      });
    }

    if (key.status === 'REVOKED') {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'This key has been revoked'
      });
    }

    if (key.status === 'EXPIRED') {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'This key has expired'
      });
    }

    // Calculate activation and expiry dates
    const activationDate = new Date();
    const expiryDate = calculateExpiryDate(key.plan);

    // Update user subscription
    await connection.execute(
      `UPDATE users 
       SET plan = ?, 
           subscription_status = 'ACTIVE', 
           activation_date = ?, 
           expiry_date = ?,
           last_activation_key = ?
       WHERE id = ?`,
      [key.plan, activationDate, expiryDate, activationKey, userId]
    );

    // Mark key as used
    await connection.execute(
      `UPDATE activation_keys 
       SET status = 'USED', activated_at = ? 
       WHERE id = ?`,
      [activationDate, key.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: {
        plan: key.plan,
        activatedAt: activationDate.toISOString(),
        expiryDate: expiryDate.toISOString()
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error activating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate subscription'
    });
  } finally {
    connection.release();
  }
});

// GET /api/activation/status - Get subscription status
router.get('/status', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await db.execute(
      `SELECT plan, subscription_status, activation_date, expiry_date, last_activation_key
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Check if subscription has expired
    if (user.subscription_status === 'ACTIVE' && user.expiry_date) {
      const now = new Date();
      const expiry = new Date(user.expiry_date);
      
      if (now > expiry) {
        // Subscription has expired - update user
        await db.execute(
          `UPDATE users 
           SET plan = 'FREE', subscription_status = 'EXPIRED' 
           WHERE id = ?`,
          [userId]
        );
        
        user.plan = 'FREE';
        user.subscription_status = 'EXPIRED';
      }
    }

    // Calculate days remaining
    let daysRemaining = null;
    if (user.subscription_status === 'ACTIVE' && user.expiry_date) {
      const now = new Date();
      const expiry = new Date(user.expiry_date);
      const diffTime = expiry - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      success: true,
      subscription: {
        plan: user.plan,
        status: user.subscription_status,
        activationDate: user.activation_date,
        expiryDate: user.expiry_date,
        daysRemaining,
        lastActivationKey: user.last_activation_key
      }
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status'
    });
  }
});

export default router;
