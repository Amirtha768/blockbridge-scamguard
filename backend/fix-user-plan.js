// Run this script to reset users to FREE plan
// Usage: node fix-user-plan.js

import mysql from 'mysql2/promise';

async function fixUserPlans() {
  const db = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'mysql123',
    database: 'blockbridge',
  });

  try {
    console.log('Connecting to database...');
    
    // Show current users
    const [users] = await db.execute('SELECT id, name, email, plan, subscription_status FROM users');
    console.log('\n📊 Current Users:');
    console.table(users);
    
    // Reset all users to FREE plan
    const [result] = await db.execute(`
      UPDATE users 
      SET plan = 'FREE', 
          subscription_status = 'NONE', 
          expiry_date = NULL,
          scans_today = 0,
          scans_reset_date = CURDATE()
      WHERE id > 0
    `);
    
    console.log(`\n✅ Reset ${result.affectedRows} user(s) to FREE plan`);
    
    // Show updated users
    const [updatedUsers] = await db.execute('SELECT id, name, email, plan, subscription_status, scans_today FROM users');
    console.log('\n📊 Updated Users:');
    console.table(updatedUsers);
    
    console.log('\n✅ Done! All users are now on FREE plan with 0 scans today.');
    console.log('💡 Tip: Clear browser localStorage and login again:\n');
    console.log('   1. Open browser console (F12)');
    console.log('   2. Type: localStorage.clear()');
    console.log('   3. Refresh page and login\n');
    
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await db.end();
    process.exit(1);
  }
}

fixUserPlans();
