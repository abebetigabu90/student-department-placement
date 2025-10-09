import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {GenplacementForFirstSemNatural,femaleQuota_AdjustmentForNaturalSem1,placementForUnplacedFirstSemNatural} from '../controllers/runPlacement.js'
import clearPlacements from '../controllers/clearPlacement.js'
const Router = express.Router();

// POST /api/placement/run - Run the placement algorithm (admin only)
// Router.post('/run', adminAuth, runPlacement);

Router.post('/runNaturaFirstSem', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Run all three functions
    const placementResult = await GenplacementForFirstSemNatural();
    console.log('✅ Placement generation completed');
    
    const quotaResult = await femaleQuota_AdjustmentForNaturalSem1();
    console.log('✅ Female quota adjustment completed');
    
    const unplacedResult = await placementForUnplacedFirstSemNatural();
    console.log('✅ Unplaced students placement completed');
    
    // Send response matching EXACT return structures
    res.json({
      success: true,
      message: 'All placement operations completed successfully',
      
      // Match exact return structures from your functions
      placementResult: placementResult, // Has: message, placements
      quotaResult: quotaResult,         // Has: success, processed, skipped, errors, message  
      unplacedResult: unplacedResult,   // Has: success, placed, total, message
      
      // Add calculated totals for easy display
      totals: {
        totalInitialPlacements: placementResult.placements ? placementResult.placements.length : 0,
        totalQuotaReplacements: quotaResult.processed || 0,
        totalUnplacedPlaced: unplacedResult.placed || 0,
        overallStudentsPlaced: (placementResult.placements ? placementResult.placements.length : 0) + (unplacedResult.placed || 0)
      }
    });
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Placement process failed', 
      details: error.message
    });
  }
});


// Add this to your Express routes
Router.delete('/ClearPlacements', async (req, res) => {
    const result = await clearPlacements();
    res.json(result);
});
// // GET /api/placement/results - Get placement results
// Router.get('/results', getPlacementResults);

// // POST /api/placement/clear - Clear all placements (admin only)
// Router.post('/clear', adminAuth, clearPlacements);

export default Router;