import bcrypt from 'bcryptjs';
import db from './db.js';
import { initDB } from './db.js';

async function createAdminAccount() {
  try {
    // Initialize database first
    await initDB();
    
    // Check if admin already exists
    const [existingAdmin] = await db.execute(
      'SELECT * FROM admin_users LIMIT 1'
    );
    
    if (existingAdmin.length > 0) {
      console.log('Admin account already exists!');
      process.exit(0);
    }
    
    // Get admin credentials from environment or use defaults
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123!';
    
    // Check if a user with email admin@blockbridge.com exists
    let [users] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@blockbridge.com']
    );
    
    let userId;
    
    if (users.length === 0) {
      // Create admin user in users table
      const hashedPassword = await bcrypt.hash(password, 12);
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, plan) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@blockbridge.com', hashedPassword, 'FREE']
      );
      userId = result.insertId;
      console.log('Created admin user in users table');
    } else {
      userId = users[0].id;
      console.log('Admin user already exists in users table');
    }
    
    // Create admin entry in admin_users table
    await db.execute(
      'INSERT INTO admin_users (user_id, role) VALUES (?, ?)',
      [userId, 'SUPER_ADMIN']
    );
    
    console.log('\n=================================');
    console.log('Admin account created successfully!');
    console.log('=================================');
    console.log('Email:', 'admin@blockbridge.com');
    console.log('Password:', password);
    console.log('Role: SUPER_ADMIN');
    console.log('\n⚠️  IMPORTANT: Change the admin password immediately in production!');
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
