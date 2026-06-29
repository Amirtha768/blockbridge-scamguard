-- Migration: Add contact messages and scam reports tables

-- Table for contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'replied', 'archived') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Table for scam reports
CREATE TABLE IF NOT EXISTS scam_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT,
  whatsapp_message TEXT,
  email_content TEXT,
  reporter_email VARCHAR(255),
  status ENUM('pending', 'reviewed', 'archived') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
