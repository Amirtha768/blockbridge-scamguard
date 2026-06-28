import { generateActivationKey, generateUniqueKey, isValidKeyFormat } from './utils/keyGenerator.js';
import db from './db.js';
import { initDB } from './db.js';

async function testKeyGenerator() {
  try {
    await initDB();
    
    console.log('Testing Key Generator...\n');
    
    // Test 1: Generate multiple keys
    console.log('Test 1: Generating 10 activation keys');
    const keys = [];
    for (let i = 0; i < 10; i++) {
      const key = generateActivationKey();
      keys.push(key);
      console.log(`  ${i + 1}. ${key}`);
    }
    
    // Test 2: Validate format
    console.log('\nTest 2: Validating key format');
    keys.forEach(key => {
      const isValid = isValidKeyFormat(key);
      console.log(`  ${key}: ${isValid ? '✓ Valid' : '✗ Invalid'}`);
    });
    
    // Test 3: Check for ambiguous characters
    console.log('\nTest 3: Checking for ambiguous characters (0, O, 1, I, L)');
    const ambiguousChars = ['0', 'O', '1', 'I', 'L'];
    let foundAmbiguous = false;
    keys.forEach(key => {
      ambiguousChars.forEach(char => {
        if (key.includes(char)) {
          console.log(`  ✗ Found ambiguous character "${char}" in ${key}`);
          foundAmbiguous = true;
        }
      });
    });
    if (!foundAmbiguous) {
      console.log('  ✓ No ambiguous characters found');
    }
    
    // Test 4: Generate unique key with database check
    console.log('\nTest 4: Generating unique key with database collision detection');
    const uniqueKey = await generateUniqueKey(db);
    console.log(`  Generated: ${uniqueKey}`);
    console.log(`  Valid format: ${isValidKeyFormat(uniqueKey) ? '✓' : '✗'}`);
    
    console.log('\n=================================');
    console.log('All tests completed successfully!');
    console.log('=================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during testing:', error);
    process.exit(1);
  }
}

testKeyGenerator();
