import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {GenplacementForFirstSemNatural,femaleQuota_AdjustmentForNaturalSem1} from '../controllers/runPlacement.js'
import clearPlacements from '../controllers/clearPlacement.js'
const Router = express.Router();

// POST /api/placement/run - Run the placement algorithm (admin only)
// Router.post('/run', adminAuth, runPlacement);


Router.post('/runNaturaFirstSem', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Step 1: Run first function and wait for it to complete
    const placementResult = await GenplacementForFirstSemNatural();
    console.log('✅ Placement generation completed');
    
    // Step 2: AFTER first function finishes, run second function
    console.log('🎯 Starting female quota adjustment...');
    const quotaResult = await femaleQuota_AdjustmentForNaturalSem1();
    console.log('✅ Female quota adjustment completed');
    
    // Step 3: Send final response after BOTH complete
    res.json({
      success: true,
      message: 'Both operations completed sequentially',
      placementResult: placementResult,
      quotaResult: quotaResult
    });
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Operation failed', 
      details: error.message
    });
  }
});



// Add this to your Express routes
Router.delete('/clear-placements', async (req, res) => {
    const result = await clearPlacements();
    res.json(result);
});
// // GET /api/placement/results - Get placement results
// Router.get('/results', getPlacementResults);

// // POST /api/placement/clear - Clear all placements (admin only)
// Router.post('/clear', adminAuth, clearPlacements);

export default Router;