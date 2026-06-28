/**
 * Blacklist Manager - Checks domains against blacklist database
 * Implements caching for performance optimization
 */

import db from '../db.js';

// In-memory cache for blacklist domains
const blacklistCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Check if a domain is in the blacklist
 * @param {string} domain - Domain to check (e.g., 'example.com')
 * @returns {Promise<boolean>} - True if domain is blacklisted
 */
export async function checkBlacklist(domain) {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Normalize domain (lowercase, remove www prefix)
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  // Check cache first
  const cached = blacklistCache.get(normalizedDomain);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.isBlacklisted;
  }

  try {
    // Query database for exact domain match
    const [rows] = await db.execute(
      'SELECT domain FROM blacklist_domains WHERE domain = ? LIMIT 1',
      [normalizedDomain]
    );

    const isBlacklisted = rows.length > 0;

    // Cache the result
    blacklistCache.set(normalizedDomain, {
      isBlacklisted,
      timestamp: Date.now()
    });

    return isBlacklisted;
  } catch (error) {
    console.error('Blacklist check error:', error);
    // On error, default to not blacklisted (fail-safe)
    return false;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL string
 * @returns {string|null} - Extracted domain or null if invalid
 */
export function extractDomain(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Add protocol if missing for URL parsing
    let urlToParse = url.trim();
    if (!urlToParse.match(/^https?:\/\//i)) {
      urlToParse = 'http://' + urlToParse;
    }

    const urlObj = new URL(urlToParse);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    // If URL parsing fails, try simple regex extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i);
    return match ? match[1].toLowerCase() : null;
  }
}

/**
 * Clear the blacklist cache (useful for testing or manual refresh)
 */
export function clearCache() {
  blacklistCache.clear();
}

/**
 * Add domain to blacklist (admin function)
 * @param {string} domain - Domain to blacklist
 * @param {string} category - Category: 'PHISHING', 'MALWARE', 'SCAM', 'SPAM'
 * @param {number} adminId - Admin user ID (optional)
 * @param {string} notes - Additional notes (optional)
 * @returns {Promise<boolean>} - True if successfully added
 */
export async function addToBlacklist(domain, category = 'SCAM', adminId = null, notes = '') {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  try {
    await db.execute(
      `INSERT INTO blacklist_domains (domain, category, added_by, notes) 
       VALUES (?, ?, ?, ?)`,
      [normalizedDomain, category, adminId, notes]
    );

    // Clear cache for this domain
    blacklistCache.delete(normalizedDomain);

    return true;
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return false;
  }
}

export default {
  checkBlacklist,
  extractDomain,
  clearCache,
  addToBlacklist
};
