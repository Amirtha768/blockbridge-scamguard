import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Production database credentials
const PRODUCTION_DB = {
  host: 'mysql-396690a7-amirthamurugakannan622-b852.l.aivencloud.com',
  port: 25763,
  user: 'avnadmin',
  password: process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD,
  database: 'defaultdb',
  ssl: { rejectUnauthorized: false }
};

async function createProductionAdmin() {
  let connection;
  
  try {
    console.log('Connecting to production database...');
    connection = await mysql.createConnection(PRODUCTION_DB);
    console.log('✓ Connected to production database');
    
    // Admin credentials
    const adminEmail = 'admin@blockbridge.com';
    const adminPassword = 'admin'; // Simple password for now
    
    // Check if admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );
    
    let userId;
    
    if (existingUsers.length === 0) {
      // Create admin user
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, plan, subscription_status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        ['Admin User', adminEmail, hashedPassword, 'FREE', 'NONE']
      );
      userId = result.insertId;
      console.log('✓ Admin user created in users table');
    } else {
      userId = existingUsers[0].id;
      console.log('✓ Admin user already exists in users table (ID:', userId, ')');
      
      // Update password to ensure it's correct
      console.log('Updating admin password...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      console.log('✓ Admin password updated');
    }
    
    // Check if admin_users entry exists
    const [existingAdmin] = await connection.execute(
      'SELECT * FROM admin_users WHERE user_id = ?',
      [userId]
    );
    
    if (existingAdmin.length === 0) {
      // Create admin_users entry
      console.log('Creating admin_users entry...');
      await connection.execute(
        'INSERT INTO admin_users (user_id, role, created_at) VALUES (?, ?, NOW())',
        [userId, 'SUPER_ADMIN']
      );
      console.log('✓ Admin entry created in admin_users table');
    } else {
      console.log('✓ Admin entry already exists in admin_users table');
    }
    
    console.log('\n=================================');
    console.log('✅ ADMIN ACCOUNT READY!');
    console.log('=================================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role: SUPER_ADMIN');
    console.log('\nYou can now login at:');
    console.log('https://blockbridge-scamguard2028.vercel.app/#/admin/login');
    console.log('=================================\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to database. Check credentials.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

createProductionAdmin();
