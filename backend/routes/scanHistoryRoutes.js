/**
 * Scan History Routes - API endpoints for scan history management
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getRecentScans,
  getFilteredHistory,
  getScanById
} from '../utils/scanHistoryManager.js';
import db from '../db.js';

const router = express.Router();

/**
 * GET /api/scan-history/recent
 * Get recent scans for the authenticated user
 */
router.get('/scan-history/recent', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const scans = await getRecentScans(req.user.id, limit);
    
    res.json({
      success: true,
      scans,
      count: scans.length
    });
  } catch (error) {
    console.error('Error fetching recent scans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scan history.'
    });
  }
});

/**
 * GET /api/scan-history
 * Get filtered scan history for the authenticated user
 * Query params: types, searchQuery, startDate, endDate
 */
router.get('/scan-history', authenticate, async (req, res) => {
  try {
    // Get user's plan
    const [userRows] = await db.execute(
      'SELECT plan FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!userRows.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const plan = userRows[0].plan;

    // Build filter object
    const filter = {};

    // Parse scan types filter
    if (req.query.types) {
      filter.types = req.query.types.split(',').map(t => t.trim().toUpperCase());
    }

    // Parse search query
    if (req.query.searchQuery) {
      filter.searchQuery = req.query.searchQuery;
    }

    // Parse date range
    if (req.query.startDate) {
      filter.startDate = new Date(req.query.startDate);
    }

    if (req.query.endDate) {
      filter.endDate = new Date(req.query.endDate);
    }

    // Get filtered history
    const scans = await getFilteredHistory(req.user.id, filter, plan);

    res.json({
      success: true,
      scans,
      count: scans.length,
      plan,
      filter
    });
  } catch (error) {
    console.error('Error fetching filtered history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scan history.'
    });
  }
});

/**
 * GET /api/scan-history/:id
 * Get a specific scan by ID
 */
router.get('/scan-history/:id', authenticate, async (req, res) => {
  try {
    const scanId = parseInt(req.params.id);

    if (isNaN(scanId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scan ID.'
      });
    }

    const scan = await getScanById(scanId, req.user.id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found or access denied.'
      });
    }

    res.json({
      success: true,
      scan
    });
  } catch (error) {
    console.error('Error fetching scan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching scan details.'
    });
  }
});

export default router;
