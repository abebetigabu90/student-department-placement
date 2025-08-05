import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {
  runPlacement,
  getPlacementResults,
  clearPlacements
} from '../controllers/placementController.js';

const Router = express.Router();

// POST /api/placement/run - Run the placement algorithm (admin only)
Router.post('/run', adminAuth, runPlacement);

// GET /api/placement/results - Get placement results
Router.get('/results', getPlacementResults);

// POST /api/placement/clear - Clear all placements (admin only)
Router.post('/clear', adminAuth, clearPlacements);

export default Router;