// This script resets ALL users to FREE plan
// Deploy this to production and run ONCE to fix the database

import db from './db.js';

async function resetAllUsersToFree() {
  try {
    console.log('🔧 Starting database reset...');
    
    // Reset ALL users to FREE plan
    const [result] = await db.execute(`
      UPDATE users 
      SET plan = 'FREE', 
          subscription_status = 'NONE', 
          expiry_date = NULL,
          scans_today = 0,
          scans_reset_date = CURDATE()
      WHERE id > 0
    `);
    
    console.log(`✅ Successfully reset ${result.affectedRows} user(s) to FREE plan`);
    console.log('📊 All users are now on FREE plan with fresh scan counts');
    console.log('💡 Users need to logout and login again to see changes\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting users:', error.message);
    process.exit(1);
  }
}

resetAllUsersToFree();
