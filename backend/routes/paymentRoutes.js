import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLAN_AMOUNTS = {
  PRO: 19900,      // ₹199 in paise
  BUSINESS: 49900, // ₹499 in paise
};

// POST /api/payment/create-order
router.post('/create-order', authenticate, async (req, res) => {
  const { plan } = req.body;
  const amount = PLAN_AMOUNTS[plan?.toUpperCase()];

  if (!amount)
    return res.status(400).json({ message: 'Invalid plan selected.' });

  // If Razorpay keys are not configured, return a stub response
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  if (!keyId || keyId.startsWith('rzp_test_placeholder')) {
    return res.status(503).json({ message: 'Payment gateway not configured yet. Please add Razorpay keys to .env to enable payments.' });
  }

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `user_${req.user.id}_${Date.now()}`,
      notes: { user_id: req.user.id, plan },
    });

    // Store pending payment
    await db.execute(
      'INSERT INTO payments (user_id, razorpay_order_id, amount, plan, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, order.id, amount, plan.toUpperCase(), 'PENDING']
    );

    res.json({ order_id: order.id, amount, currency: 'INR', key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
});

// POST /api/payment/verify  (called by frontend after checkout)
router.post('/verify', authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature)
    return res.status(400).json({ message: 'Payment verification failed.' });

  try {
    await db.execute(
      `UPDATE users SET plan = ?, subscription_status = 'ACTIVE',
       expiry_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?`,
      [plan.toUpperCase(), req.user.id]
    );

    await db.execute(
      `UPDATE payments SET razorpay_payment_id = ?, status = 'SUCCESS'
       WHERE razorpay_order_id = ?`,
      [razorpay_payment_id, razorpay_order_id]
    );

    res.json({ success: true, message: 'Subscription activated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to activate subscription.' });
  }
});

// POST /api/payment/webhook  (called by Razorpay server-side)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = req.body.toString();

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== signature)
    return res.status(400).json({ message: 'Invalid webhook signature.' });

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const userId = payment.notes?.user_id;
    const plan = payment.notes?.plan?.toUpperCase();

    if (userId && plan) {
      try {
        await db.execute(
          `UPDATE users SET plan = ?, subscription_status = 'ACTIVE',
           expiry_date = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?`,
          [plan, userId]
        );
        await db.execute(
          `UPDATE payments SET razorpay_payment_id = ?, status = 'SUCCESS'
           WHERE razorpay_order_id = ?`,
          [payment.id, payment.order_id]
        );
      } catch (err) {
        console.error('Webhook DB error:', err);
      }
    }
  }

  res.json({ received: true });
});

export default router;
