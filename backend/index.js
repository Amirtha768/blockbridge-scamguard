import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scamRoutes from './routes/scamRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import paymentRequestRoutes from './routes/paymentRequestRoutes.js';
import activationRoutes from './routes/activationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scanHistoryRoutes from './routes/scanHistoryRoutes.js';
import { initDB } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Webhook needs raw body — register before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Configure CORS - Allow all origins for now (simplify debugging)
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);
app.use('/api/activation', activationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', scanHistoryRoutes);
app.use('/api', scamRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'BlockBridge backend running', uptime: process.uptime() });
});

initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`BlockBridge backend listening on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
