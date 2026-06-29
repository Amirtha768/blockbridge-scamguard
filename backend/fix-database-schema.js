import db from './db.js';

async function fixDatabaseSchema() {
  console.log('Fixing database schema...');
  
  try {
    // Check if scans_today column exists
    const [columns] = await db.execute(`
      SHOW COLUMNS FROM users LIKE 'scans_today'
    `);
    
    if (columns.length === 0) {
      console.log('Adding missing columns to users table...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN scans_today INT DEFAULT 0,
        ADD COLUMN scans_reset_date DATE DEFAULT NULL
      `);
      console.log('✅ Added scans_today and scans_reset_date columns');
    } else {
      console.log('✅ scans_today column already exists');
    }
    
    // Create contact_messages table
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
    console.log('✅ contact_messages table ready');
    
    // Create scam_reports table
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
    console.log('✅ scam_reports table ready');
    
    console.log('✅ Database schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
}

fixDatabaseSchema();
