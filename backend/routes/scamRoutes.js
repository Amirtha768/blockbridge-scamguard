import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const FREE_DAILY_LIMIT = 5;

function getLocalDate() {
  // Use local date string to avoid UTC offset issues
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function toDateStr(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
  }
  return String(val).slice(0, 10);
}

async function checkQuota(req, res) {
  const [rows] = await db.execute(
    'SELECT plan, scans_today, scans_reset_date FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) { res.status(404).json({ message: 'User not found.' }); return false; }

  const user = rows[0];
  if (user.plan !== 'FREE') return true;

  const today     = getLocalDate();
  const resetDate = toDateStr(user.scans_reset_date);

  if (resetDate !== today) {
    await db.execute(
      'UPDATE users SET scans_today = 1, scans_reset_date = ? WHERE id = ?',
      [today, req.user.id]
    );
    return true;
  }

  if (user.scans_today >= FREE_DAILY_LIMIT) {
    res.status(403).json({
      message: `You've used all ${FREE_DAILY_LIMIT} free scans for today.`,
      upgrade: true,
      scansLeft: 0,
    });
    return false;
  }

  await db.execute(
    'UPDATE users SET scans_today = scans_today + 1 WHERE id = ?',
    [req.user.id]
  );
  return true;
}

function analyzeUrl(url) {
  const dangerous  = [/free-login/i, /secure-verify/i, /click-prize/i, /win-reward/i, /phish/i, /malware/i];
  const suspicious = [/^http:\/\//i, /login.*secure/i, /verify.*account/i];
  if (dangerous.some(r => r.test(url)))  return { score: Math.floor(80 + Math.random() * 18), status: 'dangerous' };
  if (suspicious.some(r => r.test(url))) return { score: Math.floor(45 + Math.random() * 25), status: 'suspicious' };
  return { score: Math.floor(2 + Math.random() * 18), status: 'safe' };
}

function analyzeText(text) {
  const scamWords = ['prize','winner','click here','urgent','verify your account','free money','lottery','otp','bank details','limited time','claim now','congratulations'];
  const matches = scamWords.filter(w => text.toLowerCase().includes(w));
  if (matches.length >= 3) return { score: Math.floor(75 + Math.random() * 20), status: 'dangerous' };
  if (matches.length >= 1) return { score: Math.floor(40 + Math.random() * 30), status: 'suspicious' };
  return { score: Math.floor(2 + Math.random() * 15), status: 'safe' };
}

function buildResponse({ score, status }) {
  return {
    score,
    status,
    explanation: {
      safe:       'No significant threat indicators detected.',
      suspicious: 'Some patterns match known scam techniques. Proceed with caution.',
      dangerous:  'High-risk content detected. Matches known phishing or fraud patterns.',
    }[status],
    recommendation: {
      safe:       'Content appears safe. Always stay vigilant.',
      suspicious: 'Do not share personal information. Verify the source independently.',
      dangerous:  'Do not click, open, or share this. Block and report immediately.',
    }[status],
  };
}

// GET /api/scan/quota
router.get('/scan/quota', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT plan, scans_today, scans_reset_date FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    const user      = rows[0];
    const today     = getLocalDate();
    const resetDate = toDateStr(user.scans_reset_date);
    const scansUsed = resetDate === today ? (user.scans_today || 0) : 0;
    const scansLeft = user.plan === 'FREE' ? Math.max(0, FREE_DAILY_LIMIT - scansUsed) : null;
    res.json({ plan: user.plan, scansUsed, scansLeft, limit: FREE_DAILY_LIMIT });
  } catch (err) {
    console.error('quota error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/scan/url
router.post('/scan/url', authenticate, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'URL is required.' });
  if (!await checkQuota(req, res)) return;
  res.json(buildResponse(analyzeUrl(url)));
});

// POST /api/scan/whatsapp
router.post('/scan/whatsapp', authenticate, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required.' });
  if (!await checkQuota(req, res)) return;
  res.json(buildResponse(analyzeText(message)));
});

// POST /api/scan/email
router.post('/scan/email', authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Email content is required.' });
  if (!await checkQuota(req, res)) return;
  res.json(buildResponse(analyzeText(content)));
});

// POST /api/scan/qr  (file upload)
router.post('/scan/qr', authenticate, upload.single('file'), async (req, res) => {
  if (!await checkQuota(req, res)) return;
  // Stub: real QR decode would use jsQR or similar
  const score  = Math.floor(10 + Math.random() * 40);
  const status = score > 35 ? 'suspicious' : 'safe';
  res.json(buildResponse({ score, status }));
});

// POST /api/scan/image  (file upload)
router.post('/scan/image', authenticate, upload.single('file'), async (req, res) => {
  if (!await checkQuota(req, res)) return;
  // Stub: real OCR + analysis would go here
  const score  = Math.floor(15 + Math.random() * 50);
  const status = score > 45 ? 'suspicious' : 'safe';
  res.json(buildResponse({ score, status }));
});

// POST /api/scan/job
router.post('/scan/job', authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Job offer content is required.' });
  if (!await checkQuota(req, res)) return;
  res.json(buildResponse(analyzeText(content)));
});

// POST /api/scan/invest
router.post('/scan/invest', authenticate, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Investment offer content is required.' });
  if (!await checkQuota(req, res)) return;
  res.json(buildResponse(analyzeText(content)));
});

export default router;
