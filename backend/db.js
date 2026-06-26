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

  console.log('Database tables ready.');
}

export default db;
