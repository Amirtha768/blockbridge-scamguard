import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/contact - Save contact form submission to database
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields except phone are required.' });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    
    // Phone validation (optional)
    if (phone && !/^[+\d\s()-]{10,}$/.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }
    
    // Save to database
    await db.execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [name, email, phone || null, subject, message]
    );
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully. We will get back to you within 24-48 hours.' 
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      message: 'Failed to send message. Please try emailing us directly at blockbridgescamguardai@gmail.com' 
    });
  }
});

// POST /api/contact/report-scam - Save scam report to database
router.post('/contact/report-scam', async (req, res) => {
  try {
    const { url, whatsapp, emailContent, reporterEmail } = req.body;
    
    // At least one field must be provided
    if (!url && !whatsapp && !emailContent) {
      return res.status(400).json({ message: 'Please provide at least one suspicious item to report.' });
    }
    
    // Combine all report data
    const reportData = {
      url: url || null,
      whatsapp: whatsapp || null,
      email_content: emailContent || null,
      reporter_email: reporterEmail || 'Anonymous'
    };
    
    // Save to database
    await db.execute(
      `INSERT INTO scam_reports (url, whatsapp_message, email_content, reporter_email, status, created_at) 
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [reportData.url, reportData.whatsapp, reportData.email_content, reportData.reporter_email]
    );
    
    res.json({ 
      success: true, 
      message: 'Report submitted successfully. Thank you for helping keep the internet safer.' 
    });
    
  } catch (error) {
    console.error('Scam report error:', error);
    res.status(500).json({ 
      message: 'Failed to submit report. Please try again later.' 
    });
  }
});

export default router;
