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

async function fixProductionSchema() {
  let connection;
  
  try {
    console.log('Connecting to production database...');
    connection = await mysql.createConnection(PRODUCTION_DB);
    console.log('✓ Connected to production database');
    
    // Check if scans_today column exists
    console.log('\nChecking users table columns...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'defaultdb' 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('scans_today', 'scans_reset_date')
    `);
    
    const existingColumns = columns.map(row => row.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Add scans_today if missing
    if (!existingColumns.includes('scans_today')) {
      console.log('\nAdding scans_today column...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN scans_today INT DEFAULT 0
      `);
      console.log('✓ Added scans_today column');
    } else {
      console.log('✓ scans_today column already exists');
    }
    
    // Add scans_reset_date if missing
    if (!existingColumns.includes('scans_reset_date')) {
      console.log('\nAdding scans_reset_date column...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN scans_reset_date DATE DEFAULT NULL
      `);
      console.log('✓ Added scans_reset_date column');
    } else {
      console.log('✓ scans_reset_date column already exists');
    }
    
    // Verify changes
    console.log('\nVerifying changes...');
    const [finalColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'defaultdb' 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n=================================');
    console.log('✅ USERS TABLE SCHEMA:');
    console.log('=================================');
    finalColumns.forEach(col => {
      console.log(`${col.COLUMN_NAME.padEnd(25)} ${col.DATA_TYPE.padEnd(15)} ${col.IS_NULLABLE} ${col.COLUMN_DEFAULT || ''}`);
    });
    console.log('=================================\n');
    
    console.log('✅ Production schema fixed successfully!');
    console.log('\nYou can now try scanning again.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nDatabase connection closed.');
    }
    process.exit(0);
  }
}

fixProductionSchema();
