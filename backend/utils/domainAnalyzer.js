/**
 * Domain Analyzer - Analyzes domain age and registration info
 * Uses WHOIS lookup with timeout handling and fallback
 */

import { extractDomain } from './blacklistManager.js';

// Cache for domain info
const domainCache = new Map();
const CACHE_TTL = 86400000; // 24 hours in milliseconds
const WHOIS_TIMEOUT = 2000; // 2 seconds timeout for WHOIS lookups

/**
 * Analyze domain and check if it's newly registered
 * @param {string} url - URL to analyze
 * @returns {Promise<Object>} - { domain, age, isNew, registrar }
 */
export async function analyzeDomain(url) {
  const domain = extractDomain(url);
  
  if (!domain) {
    return {
      domain: null,
      age: null,
      isNew: false,
      registrar: null
    };
  }

  // Check cache first
  const cached = domainCache.get(domain);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  try {
    // For now, use a simple heuristic approach
    // In production, you would integrate with a WHOIS API service
    const domainInfo = await fetchDomainInfo(domain);
    
    // Cache the result
    domainCache.set(domain, {
      data: domainInfo,
      timestamp: Date.now()
    });

    return domainInfo;
  } catch (error) {
    console.error('Domain analysis error:', error);
    // Return safe defaults on error
    return {
      domain,
      age: null,
      isNew: false,
      registrar: null
    };
  }
}

/**
 * Fetch domain information (with timeout)
 * This is a placeholder - in production, integrate with WHOIS API
 * @param {string} domain - Domain to lookup
 * @returns {Promise<Object>} - Domain information
 */
async function fetchDomainInfo(domain) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      // Timeout - return null data
      resolve({
        domain,
        age: null,
        isNew: false,
        registrar: null
      });
    }, WHOIS_TIMEOUT);

    // Placeholder: In production, make actual WHOIS API call here
    // For now, we'll use heuristics based on TLD
    
    // Suspicious TLDs are often used for new phishing sites
    const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.top', '.club', '.work'];
    const hasSuspiciousTLD = suspiciousTLDs.some(tld => domain.endsWith(tld));
    
    // Well-known domains are likely old
    const wellKnownDomains = [
      'google.com', 'github.com', 'microsoft.com', 'amazon.com', 
      'facebook.com', 'twitter.com', 'linkedin.com', 'youtube.com',
      'apple.com', 'netflix.com', 'instagram.com', 'reddit.com',
      'openai.com', 'stackoverflow.com', 'wikipedia.org'
    ];
    const isWellKnown = wellKnownDomains.includes(domain);

    clearTimeout(timeout);

    if (isWellKnown) {
      // Well-known domains are old
      resolve({
        domain,
        age: 365 * 10, // Assume 10+ years
        isNew: false,
        registrar: 'Known Registrar'
      });
    } else if (hasSuspiciousTLD) {
      // Suspicious TLDs are often new
      resolve({
        domain,
        age: 30, // Assume less than 90 days
        isNew: true,
        registrar: null
      });
    } else {
      // Unknown - don't penalize
      resolve({
        domain,
        age: null,
        isNew: false,
        registrar: null
      });
    }
  });
}

/**
 * Calculate domain age in days from creation date
 * @param {Date} creationDate - Domain creation date
 * @returns {number} - Age in days
 */
export function calculateAge(creationDate) {
  if (!creationDate || !(creationDate instanceof Date)) {
    return null;
  }

  const now = new Date();
  const ageMs = now - creationDate;
  const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
  
  return ageDays;
}

/**
 * Check if domain is newly registered (less than 90 days)
 * @param {number} age - Domain age in days
 * @returns {boolean} - True if domain is new (<90 days)
 */
export function isNewDomain(age) {
  if (age === null || age === undefined) {
    return false; // Don't penalize if age is unknown
  }
  
  return age < 90;
}

/**
 * Clear the domain cache
 */
export function clearCache() {
  domainCache.clear();
}

export default {
  analyzeDomain,
  calculateAge,
  isNewDomain,
  clearCache
};
