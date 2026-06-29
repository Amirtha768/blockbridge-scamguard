import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure email transporter with better settings for Render
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use port 587 instead of 465
  secure: false, // Use STARTTLS instead of SSL
  auth: {
    user: process.env.EMAIL_USER || 'blockbridgescamguardai@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// POST /api/contact
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
    
    // Prepare email content
    const emailContent = `
New Contact Form Submission - BlockBridge ScamGuard

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}

Message:
${message}

---
Reply to this email to respond directly to the user.
For WhatsApp contact, use: ${phone || 'No phone provided'}
    `.trim();
    
    // Send email to yourself
    const mailOptions = {
      from: process.env.EMAIL_USER || 'blockbridgescamguardai@gmail.com',
      to: 'blockbridgescamguardai@gmail.com', // Your email
      subject: `[BlockBridge Contact] ${subject}`,
      text: emailContent,
      replyTo: email // User can be reached at this email
    };
    
    await transporter.sendMail(mailOptions);
    
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

// POST /api/contact/report-scam
router.post('/contact/report-scam', async (req, res) => {
  try {
    const { url, whatsapp, emailContent, reporterEmail } = req.body;
    
    // At least one field must be provided
    if (!url && !whatsapp && !emailContent) {
      return res.status(400).json({ message: 'Please provide at least one suspicious item to report.' });
    }
    
    // Prepare email content
    const reportContent = `
New Scam Report - BlockBridge ScamGuard

Reporter Email: ${reporterEmail || 'Anonymous'}

Suspicious URL: ${url || 'Not provided'}
WhatsApp Message: ${whatsapp || 'Not provided'}
Email Content: ${emailContent || 'Not provided'}

---
This report has been logged for AI analysis.
    `.trim();
    
    // Send email to yourself
    const mailOptions = {
      from: process.env.EMAIL_USER || 'blockbridgescamguardai@gmail.com',
      to: 'blockbridgescamguardai@gmail.com',
      subject: '[BlockBridge Scam Report] New Suspicious Activity',
      text: reportContent,
      replyTo: reporterEmail || process.env.EMAIL_USER
    };
    
    await transporter.sendMail(mailOptions);
    
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
