import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'blockbridge',
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : false,
});

export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      plan ENUM('FREE','PRO','BUSINESS') DEFAULT 'FREE',
      subscription_status ENUM('ACTIVE','EXPIRED','NONE') DEFAULT 'NONE',
      expiry_date DATETIME DEFAULT NULL,
      activation_date DATETIME DEFAULT NULL,
      last_activation_key VARCHAR(20) DEFAULT NULL,
      scans_today INT DEFAULT 0,
      scans_reset_date DATE DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      razorpay_order_id VARCHAR(100) NOT NULL,
      razorpay_payment_id VARCHAR(100) DEFAULT NULL,
      amount INT NOT NULL,
      plan ENUM('PRO','BUSINESS') NOT NULL,
      status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
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
      FOREIGN KEY (payment_request_id) REFERENCES payment_requests(id) ON DELETE SET NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      role ENUM('ADMIN', 'SUPER_ADMIN') DEFAULT 'ADMIN',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // NEW: Scan history table
  await db.execute(`
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
    )
  `);

  // NEW: Blacklist domains table
  await db.execute(`
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
    )
  `);

  // Seed initial blacklist data
  await db.execute(`
    INSERT IGNORE INTO blacklist_domains (domain, category, notes) VALUES
    ('paytm-login.xyz', 'PHISHING', 'Fake Paytm login page'),
    ('paytm-secure-login.xyz', 'PHISHING', 'Fake Paytm login page'),
    ('google-login-free.xyz', 'PHISHING', 'Fake Google login page'),
    ('free-money-win.com', 'SCAM', 'Money scam site'),
    ('prize-winner.com', 'SCAM', 'Prize scam site')
  `);

  // NEW: Contact messages table
  await db.execute(`
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
    )
  `);

  // NEW: Scam reports table
  await db.execute(`
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
    )
  `);

  console.log('Database tables ready.');
}

export default db;
