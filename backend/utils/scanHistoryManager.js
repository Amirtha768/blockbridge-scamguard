/**
 * Scan History Manager - Manages scan history storage and retrieval
 * Implements plan-based access restrictions
 */

import db from '../db.js';

// Plan-based restrictions
const PLAN_RESTRICTIONS = {
  FREE: {
    maxScans: 10,
    retentionDays: 7
  },
  PRO: {
    maxScans: null, // Unlimited
    retentionDays: 30
  },
  BUSINESS: {
    maxScans: null, // Unlimited
    retentionDays: 90
  }
};

/**
 * Save a scan to history
 * @param {Object} scan - Scan data to save
 * @param {number} scan.userId - User ID
 * @param {string} scan.scanType - Type of scan (URL, EMAIL, WHATSAPP, QR, SCREENSHOT, JOB, INVESTMENT)
 * @param {string} scan.input - Input that was scanned
 * @param {string} scan.result - Result status (SAFE, LOW_RISK, SUSPICIOUS, DANGEROUS)
 * @param {number} scan.riskScore - Risk score (0-100)
 * @param {Object} scan.riskDetails - Risk indicators and details (optional)
 * @returns {Promise<number>} - ID of inserted scan
 */
export async function saveScan(scan) {
  try {
    const { userId, scanType, input, result, riskScore, riskDetails = null } = scan;

    // Validate required fields
    if (!userId || !scanType || !input || !result || riskScore === undefined) {
      throw new Error('Missing required scan fields');
    }

    // Convert riskDetails to JSON string if provided
    const riskDetailsJson = riskDetails ? JSON.stringify(riskDetails) : null;

    const [result_db] = await db.execute(
      `INSERT INTO scan_history (user_id, scan_type, input, result, risk_score, risk_details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, scanType, input, result, riskScore, riskDetailsJson]
    );

    return result_db.insertId;
  } catch (error) {
    console.error('Error saving scan to history:', error);
    throw error;
  }
}

/**
 * Get recent scans for a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of scans to retrieve (default 10)
 * @returns {Promise<Array>} - Array of recent scan records
 */
export async function getRecentScans(userId, limit = 10) {
  try {
    const [rows] = await db.execute(
      `SELECT id, scan_type, input, result, risk_score, risk_details, created_at
       FROM scan_history
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    // Parse risk_details JSON
    return rows.map(row => ({
      ...row,
      risk_details: row.risk_details ? JSON.parse(row.risk_details) : null
    }));
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    return [];
  }
}

/**
 * Get filtered scan history for a user with plan-based restrictions
 * @param {number} userId - User ID
 * @param {Object} filter - Filter options
 * @param {string[]} filter.types - Scan types to filter (optional)
 * @param {string} filter.searchQuery - Search term to match in input (optional)
 * @param {Date} filter.startDate - Start date for date range (optional)
 * @param {Date} filter.endDate - End date for date range (optional)
 * @param {string} plan - User's plan (FREE, PRO, BUSINESS)
 * @returns {Promise<Array>} - Array of filtered scan records
 */
export async function getFilteredHistory(userId, filter = {}, plan = 'FREE') {
  try {
    // Get plan restrictions
    const restrictions = PLAN_RESTRICTIONS[plan] || PLAN_RESTRICTIONS.FREE;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - restrictions.retentionDays);

    // Build query
    let query = `SELECT id, scan_type, input, result, risk_score, risk_details, created_at
                 FROM scan_history
                 WHERE user_id = ? AND created_at >= ?`;
    
    const params = [userId, retentionDate];

    // Add type filter
    if (filter.types && filter.types.length > 0) {
      const placeholders = filter.types.map(() => '?').join(',');
      query += ` AND scan_type IN (${placeholders})`;
      params.push(...filter.types);
    }

    // Add search query filter
    if (filter.searchQuery) {
      query += ` AND input LIKE ?`;
      params.push(`%${filter.searchQuery}%`);
    }

    // Add date range filters
    if (filter.startDate) {
      query += ` AND created_at >= ?`;
      params.push(filter.startDate);
    }

    if (filter.endDate) {
      query += ` AND created_at <= ?`;
      params.push(filter.endDate);
    }

    // Order by most recent first
    query += ` ORDER BY created_at DESC`;

    // Apply max scans limit for FREE plan
    if (restrictions.maxScans) {
      query += ` LIMIT ?`;
      params.push(restrictions.maxScans);
    }

    const [rows] = await db.execute(query, params);

    // Parse risk_details JSON
    return rows.map(row => ({
      ...row,
      risk_details: row.risk_details ? JSON.parse(row.risk_details) : null
    }));
  } catch (error) {
    console.error('Error fetching filtered history:', error);
    return [];
  }
}

/**
 * Get a specific scan by ID
 * @param {number} scanId - Scan ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} - Scan record or null if not found
 */
export async function getScanById(scanId, userId) {
  try {
    const [rows] = await db.execute(
      `SELECT id, scan_type, input, result, risk_score, risk_details, created_at
       FROM scan_history
       WHERE id = ? AND user_id = ?`,
      [scanId, userId]
    );

    if (rows.length === 0) {
      return null;
    }

    const scan = rows[0];
    return {
      ...scan,
      risk_details: scan.risk_details ? JSON.parse(scan.risk_details) : null
    };
  } catch (error) {
    console.error('Error fetching scan by ID:', error);
    return null;
  }
}

/**
 * Get retention days for a plan
 * @param {string} plan - User plan (FREE, PRO, BUSINESS)
 * @returns {number} - Number of retention days
 */
export function getRetentionDays(plan) {
  return PLAN_RESTRICTIONS[plan]?.retentionDays || PLAN_RESTRICTIONS.FREE.retentionDays;
}

/**
 * Get max scans allowed for a plan
 * @param {string} plan - User plan (FREE, PRO, BUSINESS)
 * @returns {number|null} - Max scans or null for unlimited
 */
export function getMaxScans(plan) {
  return PLAN_RESTRICTIONS[plan]?.maxScans || PLAN_RESTRICTIONS.FREE.maxScans;
}

/**
 * Delete old scans beyond retention period (cleanup function)
 * @param {number} userId - User ID
 * @param {string} plan - User plan
 * @returns {Promise<number>} - Number of deleted scans
 */
export async function deleteOldScans(userId, plan = 'FREE') {
  try {
    const restrictions = PLAN_RESTRICTIONS[plan] || PLAN_RESTRICTIONS.FREE;
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - restrictions.retentionDays);

    const [result] = await db.execute(
      `DELETE FROM scan_history WHERE user_id = ? AND created_at < ?`,
      [userId, retentionDate]
    );

    return result.affectedRows || 0;
  } catch (error) {
    console.error('Error deleting old scans:', error);
    return 0;
  }
}

export default {
  saveScan,
  getRecentScans,
  getFilteredHistory,
  getScanById,
  getRetentionDays,
  getMaxScans,
  deleteOldScans
};
