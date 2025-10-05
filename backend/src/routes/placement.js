import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {GenplacementForFirstSemNatural,femaleQuota_AdjustmentForNaturalSem1,placementForUnplacedFirstSemNatural} from '../controllers/runPlacement.js'
import clearPlacements from '../controllers/clearPlacement.js'
const Router = express.Router();

// POST /api/placement/run - Run the placement algorithm (admin only)
// Router.post('/run', adminAuth, runPlacement);


Router.post('/runNaturaFirstSem', async (req, res) => {
  try {
    console.log('Starting Natural Science placement...');
    
    // Run all three functions in sequence
    const result1 = await GenplacementForFirstSemNatural();
    console.log('First placement done');
    
    const result2 = await femaleQuota_AdjustmentForNaturalSem1();
    console.log('Female quota done');
    
    const result3 = await placementForUnplacedFirstSemNatural();
    console.log('Unplaced students placement completely done');
    
    res.json({
      success: true,
      message: 'Placement process completed',
      results: {
        initial: result1,
        femaleQuota: result2,
        unplaced: result3
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
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