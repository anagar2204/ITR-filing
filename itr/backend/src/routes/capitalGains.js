const express = require('express');
const { computeCapitalGains } = require('../calc/capitalGains');
const { insertCapitalGains } = require('../config/database');

const router = express.Router();

// POST /api/capital-gains
router.post('/', async (req, res) => {
  try {
    // Extract user_id from request (could be from auth middleware)
    const userId = req.body.user_id || req.user?.id || null;
    
    // Validate required fields
    const { assetType, purchaseDate, saleDate, purchasePrice, salePrice } = req.body;
    
    if (!assetType || !purchaseDate || !saleDate || purchasePrice === undefined || salePrice === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: assetType, purchaseDate, saleDate, purchasePrice, salePrice'
      });
    }

    // Compute capital gains
    const result = computeCapitalGains(req.body);
    
    // Store in database atomically
    try {
      const dbResult = insertCapitalGains(userId, req.body, result);
      
      // Add database info to response
      result.dbId = dbResult.id;
      result.createdAt = dbResult.created_at;
      
      // Log successful calculation (no PII)
      console.log(`Capital gains calculated successfully. DB ID: ${dbResult.id}, Asset: ${assetType}`);
      
      res.status(200).json(result);
    } catch (dbError) {
      console.error('Database error during capital gains storage:', dbError);
      res.status(500).json({
        error: 'Failed to store calculation results'
      });
    }
    
  } catch (error) {
    console.error('Capital gains calculation error:', error.stack);
    
    // Return safe error message
    res.status(400).json({
      error: 'Invalid input data for capital gains calculation'
    });
  }
});

// GET /api/capital-gains (optional - for retrieving user's calculations)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // This would require implementing a query function
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching capital gains:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
