import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {GenplacementForFirstSemNatural} from '../controllers/runPlacement.js'
import clearPlacements from '../controllers/clearPlacement.js'
const Router = express.Router();

// POST /api/placement/run - Run the placement algorithm (admin only)
// Router.post('/run', adminAuth, runPlacement);

Router.post('/runNaturaFirstSem', async (req, res) => {
  try {
    const result = await GenplacementForFirstSemNatural();
    res.json(result);
  } catch (error) {
    console.error('Placement error:', error);
    res.status(500).json({ 
      error: 'Placement failed', 
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