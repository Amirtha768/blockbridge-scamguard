import db from './db.js';
import { initDB } from './db.js';

async function verifySchema() {
  try {
    await initDB();
    
    console.log('Verifying database schema...\n');
    
    // Check users table
    const [usersDesc] = await db.execute('DESCRIBE users');
    console.log('✓ users table exists with columns:', usersDesc.map(col => col.Field).join(', '));
    
    // Check payment_requests table
    const [paymentReqDesc] = await db.execute('DESCRIBE payment_requests');
    console.log('✓ payment_requests table exists with columns:', paymentReqDesc.map(col => col.Field).join(', '));
    
    // Check activation_keys table
    const [activationKeysDesc] = await db.execute('DESCRIBE activation_keys');
    console.log('✓ activation_keys table exists with columns:', activationKeysDesc.map(col => col.Field).join(', '));
    
    // Check admin_users table
    const [adminUsersDesc] = await db.execute('DESCRIBE admin_users');
    console.log('✓ admin_users table exists with columns:', adminUsersDesc.map(col => col.Field).join(', '));
    
    // Check admin account
    const [admins] = await db.execute('SELECT user_id, role FROM admin_users');
    console.log(`\n✓ Found ${admins.length} admin account(s)`);
    
    console.log('\n=================================');
    console.log('All database tables verified successfully!');
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying schema:', error);
    process.exit(1);
  }
}

verifySchema();
