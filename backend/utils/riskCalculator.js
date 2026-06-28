/**
 * Risk Calculator - Calculates risk scores based on multiple indicators
 * Implements deterministic scoring algorithm with specific risk factors
 */

import { checkBlacklist, extractDomain } from './blacklistManager.js';
import { analyzeDomain, isNewDomain } from './domainAnalyzer.js';
import { countRedirects, hasExcessiveRedirects } from './redirectAnalyzer.js';

// Suspicious keywords for scam detection
const SUSPICIOUS_KEYWORDS = [
  'win', 'free', 'click', 'urgent', 'otp', 'verify', 'account',
  'prize', 'winner', 'claim', 'congratulations', 'blocked',
  'expired', 'suspended', 'immediately', 'act now', 'limited time'
];

// Short URL services
const SHORT_URL_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co',
  'is.gd', 'buff.ly', 'tiny.cc', 'short.link'
];

/**
 * Calculate risk score and analyze input
 * @param {string} input - Input to analyze (URL, email content, or message)
 * @param {string} type - Input type: 'URL', 'EMAIL', or 'MESSAGE'
 * @returns {Promise<Object>} - { score, status, indicators, explanation, recommendation }
 */
export async function calculateRisk(input, type) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input provided');
  }

  // Start with base score of 50
  let score = 50;
  
  const indicators = {
    hasHTTPS: false,
    isBlacklisted: false,
    suspiciousKeywords: [],
    isShortURL: false,
    domainAge: null,
    redirectCount: 0,
    isNewDomain: false
  };

  try {
    // Analyze based on type
    if (type === 'URL') {
      await analyzeURL(input, score, indicators);
    } else {
      // For EMAIL and MESSAGE, analyze text content
      analyzeText(input, score, indicators);
    }

    // Apply scoring rules
    score = applyScoring(score, indicators);

    // Clamp score between 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine status
    const status = getStatus(score);

    // Generate explanation and recommendation
    const explanation = generateExplanation(indicators, type);
    const recommendation = generateRecommendation(status, type);

    return {
      score,
      status,
      indicators,
      explanation,
      recommendation
    };
  } catch (error) {
    console.error('Risk calculation error:', error);
    
    // Return safe default on error
    return {
      score: 50,
      status: 'SUSPICIOUS',
      indicators,
      explanation: 'Unable to perform complete analysis. Please exercise caution.',
      recommendation: 'If you\'re unsure, do not proceed. Verify through official channels.'
    };
  }
}

/**
 * Analyze URL-specific indicators
 * @param {string} url - URL to analyze
 * @param {number} baseScore - Current score
 * @param {Object} indicators - Indicators object to populate
 */
async function analyzeURL(url, baseScore, indicators) {
  // Check HTTPS
  if (url.trim().toLowerCase().startsWith('https://')) {
    indicators.hasHTTPS = true;
  }

  // Extract domain
  const domain = extractDomain(url);
  if (!domain) {
    return;
  }

  // Check blacklist
  indicators.isBlacklisted = await checkBlacklist(domain);

  // Check if short URL
  indicators.isShortURL = SHORT_URL_DOMAINS.some(shortDomain => 
    domain.includes(shortDomain)
  );

  // Analyze domain age
  const domainInfo = await analyzeDomain(url);
  indicators.domainAge = domainInfo.age;
  indicators.isNewDomain = domainInfo.isNew || isNewDomain(domainInfo.age);

  // Count redirects (with timeout protection)
  try {
    indicators.redirectCount = await countRedirects(url);
  } catch (error) {
    console.error('Redirect count error:', error);
    indicators.redirectCount = 0;
  }

  // Also check URL for suspicious keywords
  analyzeText(url, baseScore, indicators);
}

/**
 * Analyze text content for suspicious keywords
 * @param {string} text - Text to analyze
 * @param {number} baseScore - Current score
 * @param {Object} indicators - Indicators object to populate
 */
function analyzeText(text, baseScore, indicators) {
  const lowerText = text.toLowerCase();
  
  // Detect suspicious keywords (count unique occurrences)
  const foundKeywords = new Set();
  
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      foundKeywords.add(keyword);
    }
  }
  
  indicators.suspiciousKeywords = Array.from(foundKeywords);
}

/**
 * Apply scoring rules based on indicators
 * @param {number} baseScore - Starting score
 * @param {Object} indicators - Risk indicators
 * @returns {number} - Calculated score
 */
function applyScoring(baseScore, indicators) {
  let score = baseScore;

  // HTTPS bonus: -10 points
  if (indicators.hasHTTPS) {
    score -= 10;
  }

  // Blacklisted domain: +40 points
  if (indicators.isBlacklisted) {
    score += 40;
  }

  // Suspicious keywords: +20 points each
  score += indicators.suspiciousKeywords.length * 20;

  // Short URL: +10 points
  if (indicators.isShortURL) {
    score += 10;
  }

  // New domain (<90 days): +25 points
  if (indicators.isNewDomain) {
    score += 25;
  }

  // Multiple redirects (>2): +15 points
  if (hasExcessiveRedirects(indicators.redirectCount)) {
    score += 15;
  }

  return score;
}

/**
 * Determine status based on score
 * @param {number} score - Risk score (0-100)
 * @returns {string} - Status: 'SAFE', 'LOW RISK', 'SUSPICIOUS', 'DANGEROUS'
 */
function getStatus(score) {
  if (score <= 25) return 'SAFE';
  if (score <= 50) return 'LOW RISK';
  if (score <= 75) return 'SUSPICIOUS';
  return 'DANGEROUS';
}

/**
 * Generate explanation based on indicators
 * @param {Object} indicators - Risk indicators
 * @param {string} type - Input type
 * @returns {string} - Human-readable explanation
 */
function generateExplanation(indicators, type) {
  const reasons = [];

  if (indicators.hasHTTPS) {
    reasons.push('Uses secure HTTPS connection');
  }

  if (indicators.isBlacklisted) {
    reasons.push('Domain is on known scam blacklist');
  }

  if (indicators.suspiciousKeywords.length > 0) {
    reasons.push(`Contains suspicious keywords: ${indicators.suspiciousKeywords.join(', ')}`);
  }

  if (indicators.isShortURL) {
    reasons.push('Uses URL shortening service');
  }

  if (indicators.isNewDomain) {
    reasons.push('Domain was recently registered');
  }

  if (hasExcessiveRedirects(indicators.redirectCount)) {
    reasons.push(`Multiple redirects detected (${indicators.redirectCount})`);
  }

  if (reasons.length === 0) {
    return 'No significant risk indicators detected.';
  }

  return reasons.join('. ') + '.';
}

/**
 * Generate recommendation based on status
 * @param {string} status - Risk status
 * @param {string} type - Input type
 * @returns {string} - Recommendation message
 */
function generateRecommendation(status, type) {
  switch (status) {
    case 'SAFE':
      return 'This appears to be safe. However, always verify before sharing sensitive information.';
    
    case 'LOW RISK':
      return 'Exercise caution. Verify the source before proceeding.';
    
    case 'SUSPICIOUS':
      return 'High risk detected. Do not share personal information or click links unless you can verify authenticity.';
    
    case 'DANGEROUS':
      return 'DANGER: This is likely a scam. Do not interact, share information, or send money. Report this to authorities.';
    
    default:
      return 'Please exercise caution and verify before proceeding.';
  }
}

/**
 * Detect suspicious keywords in text
 * @param {string} text - Text to analyze
 * @returns {string[]} - Array of detected keywords
 */
export function detectSuspiciousKeywords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lowerText = text.toLowerCase();
  const foundKeywords = [];

  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

export default {
  calculateRisk,
  detectSuspiciousKeywords,
  getStatus
};
