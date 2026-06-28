import crypto from 'crypto';

// Character set excluding ambiguous characters (0, O, 1, I, L)
const KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 31 chars

/**
 * Generate a secure activation key in format: BBSG-XXXX-XXXX-XXXX
 * Uses cryptographically secure random characters
 * Excludes ambiguous characters: 0, O, 1, I, L
 */
export function generateActivationKey() {
  const segments = [];
  
  // Generate 3 segments of 4 characters each
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      const randomIndex = crypto.randomInt(0, KEY_ALPHABET.length);
      segment += KEY_ALPHABET[randomIndex];
    }
    segments.push(segment);
  }
  
  return `BBSG-${segments.join('-')}`;
}

/**
 * Generate a unique activation key with database collision detection
 * Retries up to 10 times if a collision is detected
 * @param {object} db - Database pool connection
 * @returns {Promise<string>} Unique activation key
 * @throws {Error} If unable to generate unique key after max attempts
 */
export async function generateUniqueKey(db) {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const key = generateActivationKey();
    
    // Check if key already exists in database
    const [existing] = await db.execute(
      'SELECT id FROM activation_keys WHERE activation_key = ?',
      [key]
    );
    
    if (existing.length === 0) {
      return key;
    }
    
    console.warn(`Key collision detected on attempt ${attempt + 1}, regenerating...`);
  }
  
  throw new Error('Failed to generate unique activation key after maximum attempts');
}

/**
 * Validate activation key format
 * Format: BBSG-XXXX-XXXX-XXXX (excluding ambiguous chars 0, O, 1, I, L)
 */
export function isValidKeyFormat(key) {
  const pattern = /^BBSG-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
  return pattern.test(key);
}

/**
 * Calculate expiry date based on plan
 */
export function calculateExpiryDate(plan) {
  const now = new Date();
  if (plan === 'PRO') {
    // 30 days for Pro
    return new Date(now.setDate(now.getDate() + 30));
  } else if (plan === 'BUSINESS') {
    // 180 days for Business
    return new Date(now.setDate(now.getDate() + 180));
  }
  return null;
}
