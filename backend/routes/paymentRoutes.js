import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Payment routes — Razorpay not configured
// These return a friendly message until a payment gateway is added

router.post('/create-order', authenticate, (req, res) => {
  res.status(503).json({ message: 'Payments are not enabled yet. Please contact support to upgrade your plan.' });
});

router.post('/verify', authenticate, (req, res) => {
  res.status(503).json({ message: 'Payments are not enabled yet.' });
});

router.post('/webhook', (req, res) => {
  res.json({ received: true });
});

export default router;
