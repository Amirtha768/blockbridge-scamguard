-- Activation Key Subscription System Schema

USE blockbridge;

-- Table for payment requests (user uploads proof)
CREATE TABLE IF NOT EXISTS payment_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  screenshot_url VARCHAR(500) DEFAULT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  admin_notes TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME DEFAULT NULL,
  verified_by INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id)
);

-- Table for activation keys
CREATE TABLE IF NOT EXISTS activation_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activation_key VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  plan ENUM('PRO', 'BUSINESS') NOT NULL,
  payment_request_id INT DEFAULT NULL,
  status ENUM('UNUSED', 'USED', 'EXPIRED', 'REVOKED') DEFAULT 'UNUSED',
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated_at DATETIME DEFAULT NULL,
  expiry_date DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id) ON DELETE SET NULL,
  INDEX idx_key (activation_key),
  INDEX idx_status (status),
  INDEX idx_user_id (user_id)
);

-- Update users table to add activation tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS activation_date DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activation_key VARCHAR(20) DEFAULT NULL;

-- Create admin users table (for admin dashboard access)
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
