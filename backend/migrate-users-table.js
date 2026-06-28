import db from './db.js';

async function migrateUsersTable() {
  try {
    console.log('Checking users table for missing columns...\n');
    
    // Get current table structure
    const [columns] = await db.execute('DESCRIBE users');
    const columnNames = columns.map(col => col.Field);
    
    // Check and add activation_date if missing
    if (!columnNames.includes('activation_date')) {
      console.log('Adding activation_date column...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN activation_date DATETIME DEFAULT NULL 
        AFTER expiry_date
      `);
      console.log('✓ activation_date column added');
    } else {
      console.log('✓ activation_date column already exists');
    }
    
    // Check and add last_activation_key if missing
    if (!columnNames.includes('last_activation_key')) {
      console.log('Adding last_activation_key column...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN last_activation_key VARCHAR(20) DEFAULT NULL 
        AFTER activation_date
      `);
      console.log('✓ last_activation_key column added');
    } else {
      console.log('✓ last_activation_key column already exists');
    }
    
    console.log('\n=================================');
    console.log('Migration completed successfully!');
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateUsersTable();
