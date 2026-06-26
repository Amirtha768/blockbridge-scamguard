import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scamRoutes from './routes/scamRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Webhook needs raw body — register before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', scamRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'BlockBridge backend running', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`BlockBridge backend listening on http://localhost:${port}`);
});
