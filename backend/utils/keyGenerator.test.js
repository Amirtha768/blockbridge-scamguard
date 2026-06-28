import { describe, test, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { generateActivationKey, isValidKeyFormat, generateUniqueKey } from './keyGenerator.js';

// Feature: activation-key-subscription, Property 7: Activation Key Format
// **Validates: Requirements 5.1**
describe('Activation Key Format Property Tests', () => {
  test('Property 7: Generated keys match regex pattern and exclude ambiguous characters', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 99 }), () => {
        // Generate a key
        const key = generateActivationKey();
        
        // Property 1: Key matches format BBSG-XXXX-XXXX-XXXX
        expect(key).toMatch(/^BBSG-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
        
        // Property 2: Key is valid according to validator function
        expect(isValidKeyFormat(key)).toBe(true);
        
        // Property 3: Key does not contain ambiguous characters (0, O, 1, I, L)
        const ambiguousChars = ['0', 'O', '1', 'I', 'L'];
        ambiguousChars.forEach(char => {
          expect(key).not.toContain(char);
        });
        
        // Property 4: Key has correct length (19 characters including dashes)
        expect(key.length).toBe(19);
        
        // Property 5: Key starts with BBSG-
        expect(key.startsWith('BBSG-')).toBe(true);
      }),
      { numRuns: 100 } // Run 100 iterations as specified in design
    );
  });

  test('Validator correctly rejects invalid formats', () => {
    const invalidKeys = [
      'BBSG-1234-5678-9ABC', // Contains ambiguous characters
      'BBSG-ABC-DEF-GHJ',     // Segments too short
      'BBSG-ABCD-EFGH-IJK',   // Contains 'I' 
      'BBSG-ABCD-EFGH-0123',  // Contains '0'
      'INVALID-ABCD-EFGH-JKMN', // Wrong prefix
      'BBSG-ABCD-EFGH',       // Missing segment
      'BBSG-ABCD-EFGH-JKMN-PQRS', // Too many segments
      ''                       // Empty string
    ];

    invalidKeys.forEach(key => {
      expect(isValidKeyFormat(key)).toBe(false);
    });
  });
});

// Feature: activation-key-subscription, Property 8: Activation Key Uniqueness
// **Validates: Requirements 5.3, 5.4**
describe('Activation Key Uniqueness Property Tests', () => {
  test('Property 8: Collision detection and retry logic works correctly', async () => {
    // Mock database that returns collisions for first 3 attempts, then succeeds
    let attemptCount = 0;
    const mockDb = {
      execute: async (query, params) => {
        attemptCount++;
        if (attemptCount <= 3) {
          // Simulate collision - return existing key
          return [[{ id: 1 }]];
        } else {
          // No collision - return empty array
          return [[]];
        }
      }
    };

    const key = await generateUniqueKey(mockDb);
    
    // Property 1: Eventually generates a key after retries
    expect(key).toBeDefined();
    expect(isValidKeyFormat(key)).toBe(true);
    
    // Property 2: Retry logic was exercised (4 attempts = 3 collisions + 1 success)
    expect(attemptCount).toBe(4);
  });

  test('Throws error after maximum retry attempts', async () => {
    // Mock database that always returns collisions
    const mockDb = {
      execute: async () => {
        // Always return a collision
        return [[{ id: 1 }]];
      }
    };

    // Should throw error after 10 attempts
    await expect(generateUniqueKey(mockDb)).rejects.toThrow(
      'Failed to generate unique activation key after maximum attempts'
    );
  });

  test('Property: Generated keys are unique in practice', () => {
    // Generate many keys and check for duplicates
    const keys = new Set();
    const numKeys = 1000;
    
    for (let i = 0; i < numKeys; i++) {
      const key = generateActivationKey();
      keys.add(key);
    }
    
    // All keys should be unique (extremely high probability with 31^12 possible combinations)
    expect(keys.size).toBe(numKeys);
  });
});
