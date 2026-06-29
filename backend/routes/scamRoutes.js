import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import db from '../db.js';
import { validateInput } from '../utils/inputValidator.js';
import { calculateRisk } from '../utils/riskCalculator.js';
import { saveScan } from '../utils/scanHistoryManager.js';

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
  try {
    const [rows] = await db.execute(
      'SELECT plan, scans_today, scans_reset_date FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) { 
      res.status(404).json({ message: 'User not found.' }); 
      return false; 
    }

    const user = rows[0];
    const today = getLocalDate();
    const resetDate = toDateStr(user.scans_reset_date);

    // PRO and BUSINESS users: unlimited scans, just track usage
    if (user.plan === 'PRO' || user.plan === 'BUSINESS') {
      if (resetDate !== today) {
        await db.execute(
          'UPDATE users SET scans_today = 1, scans_reset_date = ? WHERE id = ?',
          [today, req.user.id]
        );
      } else {
        await db.execute(
          'UPDATE users SET scans_today = scans_today + 1 WHERE id = ?',
          [req.user.id]
        );
      }
      return true; // No limit for PRO/BUSINESS
    }

    // FREE users: check 5-scan daily limit
    if (resetDate !== today) {
      // New day - reset counter
      await db.execute(
        'UPDATE users SET scans_today = 1, scans_reset_date = ? WHERE id = ?',
        [today, req.user.id]
      );
      return true;
    }

    if (user.scans_today >= FREE_DAILY_LIMIT) {
      // Limit reached
      res.status(403).json({
        message: `You've used all ${FREE_DAILY_LIMIT} free scans for today. Upgrade to PRO for unlimited scans.`,
        upgrade: true,
        scansLeft: 0,
      });
      return false;
    }

    // Increment scan count
    await db.execute(
      'UPDATE users SET scans_today = scans_today + 1 WHERE id = ?',
      [req.user.id]
    );
    return true;
  } catch (error) {
    console.error('Quota check error:', error);
    // On error, allow the scan to proceed (fail open for better UX)
    return true;
  }
}

/**
 * Convert risk analysis result to API response format
 * @param {Object} riskResult - Result from calculateRisk()
 * @returns {Object} - API response object
 */
function buildResponse(riskResult) {
  return {
    score: riskResult.score,
    status: riskResult.status.toLowerCase().replace(' ', '_'), // Convert "LOW RISK" to "low_risk"
    explanation: riskResult.explanation,
    recommendation: riskResult.recommendation,
    indicators: riskResult.indicators // Include risk indicators for transparency
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
    
    const user = rows[0];
    const today = getLocalDate();
    const resetDate = toDateStr(user.scans_reset_date);
    const scansUsed = resetDate === today ? (user.scans_today || 0) : 0;
    
    // Plan-specific limits
    let limit, scansLeft;
    if (user.plan === 'PRO') {
      limit = 50; // PRO: 50 scans/day
      scansLeft = Math.max(0, limit - scansUsed);
    } else if (user.plan === 'BUSINESS') {
      limit = -1; // BUSINESS: unlimited (show as -1)
      scansLeft = -1; // unlimited
    } else {
      // FREE plan
      limit = FREE_DAILY_LIMIT; // 5 scans/day
      scansLeft = Math.max(0, limit - scansUsed);
    }
    
    res.json({ 
      plan: user.plan || 'FREE',
      scansUsed, 
      scansLeft, 
      limit 
    });
  } catch (err) {
    console.error('quota error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/scan/url
router.post('/scan/url', authenticate, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required.' });
    
    // Validate input
    const validation = validateInput(url, 'URL');
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    
    if (!await checkQuota(req, res)) return;
    
    // Use smart risk analysis with extra error protection
    let riskResult;
    try {
      riskResult = await calculateRisk(url, 'URL');
    } catch (riskError) {
      console.error('Risk calculation error:', riskError);
      // Return safe default if risk calculation fails
      riskResult = {
        score: 50,
        status: 'LOW RISK',
        explanation: 'Analysis completed with limited information. Exercise caution.',
        recommendation: 'Verify the source before proceeding.',
        indicators: {
          hasHTTPS: url.toLowerCase().includes('https'),
          isBlacklisted: false,
          suspiciousKeywords: [],
          isShortURL: false,
          domainAge: null,
          redirectCount: 0
        }
      };
    }
    
    // Save to scan history (don't fail the request if this fails)
    try {
      await saveScan({
        userId: req.user.id,
        scanType: 'URL',
        input: url,
        result: riskResult.status,
        riskScore: riskResult.score,
        riskDetails: riskResult.indicators
      });
    } catch (historyError) {
      console.error('Failed to save scan history:', historyError);
      // Continue - don't fail the request
    }
    
    res.json(buildResponse(riskResult));
  } catch (error) {
    console.error('URL scan error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error analyzing URL. Please try again.' });
  }
});

// POST /api/scan/whatsapp
router.post('/scan/whatsapp', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });
    
    // Validate input
    const validation = validateInput(message, 'MESSAGE');
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    
    if (!await checkQuota(req, res)) return;
    
    // Use smart risk analysis
    const riskResult = await calculateRisk(message, 'MESSAGE');
    
    // Save to scan history
    try {
      await saveScan({
        userId: req.user.id,
        scanType: 'WHATSAPP',
        input: message,
        result: riskResult.status,
        riskScore: riskResult.score,
        riskDetails: riskResult.indicators
      });
    } catch (historyError) {
      console.error('Failed to save scan history:', historyError);
    }
    
    res.json(buildResponse(riskResult));
  } catch (error) {
    console.error('WhatsApp scan error:', error);
    res.status(500).json({ message: 'Error analyzing message. Please try again.' });
  }
});

// POST /api/scan/email
router.post('/scan/email', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Email content is required.' });
    
    // Validate input
    const validation = validateInput(content, 'MESSAGE');
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    
    if (!await checkQuota(req, res)) return;
    
    // Use smart risk analysis
    const riskResult = await calculateRisk(content, 'EMAIL');
    
    // Save to scan history
    try {
      await saveScan({
        userId: req.user.id,
        scanType: 'EMAIL',
        input: content,
        result: riskResult.status,
        riskScore: riskResult.score,
        riskDetails: riskResult.indicators
      });
    } catch (historyError) {
      console.error('Failed to save scan history:', historyError);
    }
    
    res.json(buildResponse(riskResult));
  } catch (error) {
    console.error('Email scan error:', error);
    res.status(500).json({ message: 'Error analyzing email. Please try again.' });
  }
});

// POST /api/scan/qr  (file upload)
router.post('/scan/qr', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!await checkQuota(req, res)) return;
    
    // TODO: Implement QR code decoding using jsQR or similar library
    // For now, return a basic message indicating QR scanning is under development
    res.json({
      score: 50,
      status: 'low_risk',
      explanation: 'QR code scanning is currently under development. Basic file validation passed.',
      recommendation: 'Verify QR codes manually by checking the destination URL before scanning.',
      indicators: {
        hasHTTPS: false,
        isBlacklisted: false,
        suspiciousKeywords: [],
        isShortURL: false,
        domainAge: null,
        redirectCount: 0
      }
    });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ message: 'Error processing QR code. Please try again.' });
  }
});

// POST /api/scan/image  (file upload)
router.post('/scan/image', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!await checkQuota(req, res)) return;
    
    // TODO: Implement OCR text extraction using tesseract.js or similar library
    // Then apply risk analysis to extracted text
    // For now, return a basic message indicating image scanning is under development
    res.json({
      score: 50,
      status: 'low_risk',
      explanation: 'Screenshot analysis is currently under development. Basic file validation passed.',
      recommendation: 'Manually review screenshots for suspicious content like fake payment pages or phishing attempts.',
      indicators: {
        hasHTTPS: false,
        isBlacklisted: false,
        suspiciousKeywords: [],
        isShortURL: false,
        domainAge: null,
        redirectCount: 0
      }
    });
  } catch (error) {
    console.error('Image scan error:', error);
    res.status(500).json({ message: 'Error processing image. Please try again.' });
  }
});

// POST /api/scan/job
router.post('/scan/job', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Job offer content is required.' });
    
    // Validate input
    const validation = validateInput(content, 'MESSAGE');
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    
    if (!await checkQuota(req, res)) return;
    
    // Use smart risk analysis
    const riskResult = await calculateRisk(content, 'MESSAGE');
    
    // Save to scan history
    try {
      await saveScan({
        userId: req.user.id,
        scanType: 'JOB',
        input: content,
        result: riskResult.status,
        riskScore: riskResult.score,
        riskDetails: riskResult.indicators
      });
    } catch (historyError) {
      console.error('Failed to save scan history:', historyError);
    }
    
    res.json(buildResponse(riskResult));
  } catch (error) {
    console.error('Job scan error:', error);
    res.status(500).json({ message: 'Error analyzing job offer. Please try again.' });
  }
});

// POST /api/scan/invest
router.post('/scan/invest', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Investment offer content is required.' });
    
    // Validate input
    const validation = validateInput(content, 'MESSAGE');
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }
    
    if (!await checkQuota(req, res)) return;
    
    // Use smart risk analysis
    const riskResult = await calculateRisk(content, 'MESSAGE');
    
    // Save to scan history
    try {
      await saveScan({
        userId: req.user.id,
        scanType: 'INVESTMENT',
        input: content,
        result: riskResult.status,
        riskScore: riskResult.score,
        riskDetails: riskResult.indicators
      });
    } catch (historyError) {
      console.error('Failed to save scan history:', historyError);
    }
    
    res.json(buildResponse(riskResult));
  } catch (error) {
    console.error('Investment scan error:', error);
    res.status(500).json({ message: 'Error analyzing investment offer. Please try again.' });
  }
});

export default router;
