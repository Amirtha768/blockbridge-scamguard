-- Migration: Add scan_history and blacklist_domains tables
-- Date: 2026-06-28

-- Create scan_history table
CREATE TABLE IF NOT EXISTS scan_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  scan_type ENUM('URL', 'EMAIL', 'WHATSAPP', 'QR', 'SCREENSHOT', 'JOB', 'INVESTMENT') NOT NULL,
  input TEXT NOT NULL,
  result VARCHAR(50) NOT NULL,
  risk_score INT NOT NULL,
  risk_details JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_scan_type (scan_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create blacklist_domains table
CREATE TABLE IF NOT EXISTS blacklist_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  pattern VARCHAR(255) DEFAULT NULL,
  category ENUM('PHISHING', 'MALWARE', 'SCAM', 'SPAM') NOT NULL,
  added_by INT DEFAULT NULL,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (added_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  INDEX idx_domain (domain),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed initial blacklist data
INSERT INTO blacklist_domains (domain, category, notes) VALUES
('bit.ly', 'SCAM', 'Short URL service often used in phishing'),
('tinyurl.com', 'SCAM', 'Short URL service often used in phishing'),
('goo.gl', 'SCAM', 'Short URL service often used in phishing'),
('paytm-login.xyz', 'PHISHING', 'Fake Paytm login page'),
('paytm-secure-login.xyz', 'PHISHING', 'Fake Paytm login page'),
('google-login-free.xyz', 'PHISHING', 'Fake Google login page'),
('free-money-win.com', 'SCAM', 'Money scam site'),
('prize-winner.com', 'SCAM', 'Prize scam site')
ON DUPLICATE KEY UPDATE domain = domain;

-- Remove Razorpay columns if they exist (cleanup)
-- Note: We keep payment_requests table for manual payment system
-- No Razorpay columns exist in current schema, so this is a no-op
