import express from 'express';
// import Razorpay from 'razorpay'; // REMOVED: Razorpay integration
// import crypto from 'crypto'; // REMOVED: Used only for Razorpay
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// REMOVED: Razorpay initialization
// Manual payment system with activation keys is now used instead
// See paymentRequestRoutes.js for the new payment flow

/*
// DEPRECATED: Razorpay integration removed
// Keeping commented code for reference only

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

const PLAN_AMOUNTS = {
  PRO: 19900,      // ₹199 in paise
  BUSINESS: 49900, // ₹499 in paise
};

// POST /api/payment/create-order - DEPRECATED
router.post('/create-order', authenticate, async (req, res) => {
  res.status(410).json({ 
    message: 'Razorpay integration removed. Please use manual payment submission.',
    redirectTo: '/pricing'
  });
});

// POST /api/payment/verify - DEPRECATED
router.post('/verify', authenticate, async (req, res) => {
  res.status(410).json({ 
    message: 'Razorpay integration removed. Please use manual payment submission.',
    redirectTo: '/pricing'
  });
});

// POST /api/payment/webhook - DEPRECATED
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  res.status(410).json({ message: 'Webhook endpoint deprecated.' });
});
*/

// All Razorpay endpoints have been removed
// Use /api/payment-requests for manual payment submission
// Use /api/activation for activation key redemption

export default router;
