import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import {GenplacementForFirstSemNatural,femaleQuota_AdjustmentForNaturalSem1,placementForUnplacedFirstSemNatural} from '../controllers/runFirstSemNatPlacement.js'
import {GenplacementForFirstSemSocial,femaleQuota_AdjustmentForSocialSem1,placementForUnplacedFirstSemSocial} from '../controllers/runFirstSemSocialPlacement.js'
import {GenplacementForPreEng,femaleQuota_AdjustmentForPreEng,placementForUnplacedPreEng} from '../controllers/runNatSecSemPreEng.js'
import {GenplacementForOtherNat,femaleQuota_AdjustmentForOtherNat,placementForUnplacedOtherNat} from '../controllers/runSecSemOtherNatural.js'
import {GenplacementForOtherSocial,femaleQuota_AdjustmentForOtherSocial,placementForUnplacedOtherSocial} from '../controllers/runSecSemOtherSocial.js'
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
      message: 'placement operations of Natural Science First Semister Students completed successfully',
      
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
//the ff is used to run placement for social first semister students
Router.post('/runSocialFirstSem', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Run all three functions
    const placementResult = await GenplacementForFirstSemSocial();
    console.log('✅ Placement generation completed');
    
    const quotaResult = await femaleQuota_AdjustmentForSocialSem1();
    console.log('✅ Female quota adjustment completed');
    
    const unplacedResult = await placementForUnplacedFirstSemSocial();
    console.log('✅ Unplaced students placement completed');
    
    // Send response matching EXACT return structures
    res.json({
      success: true,
      message: 'placement operations of First Semister Social Science Students completed successfully',
      
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
//the ff is used to run placement for PreEngineering second semister students
Router.post('/runPreEngineeringPlacement', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Run all three functions
    const placementResult = await GenplacementForPreEng();
    console.log('✅ Placement generation completed');
    
    const quotaResult = await femaleQuota_AdjustmentForPreEng();
    console.log('✅ Female quota adjustment completed');
    
    const unplacedResult = await placementForUnplacedPreEng();
    console.log('✅ Unplaced students placement completed');
    
    // Send response matching EXACT return structures
    res.json({
      success: true,
      message: 'placement operations of PreEngineering Category Departments Placement completed successfully',
      
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

//the ff is used to run placement for other natural second semister students
Router.post('/runOtherNaturalPlacement', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Run all three functions
    const placementResult = await GenplacementForOtherNat();
    console.log('✅ Placement generation completed');
    
    const quotaResult = await femaleQuota_AdjustmentForOtherNat();
    console.log('✅ Female quota adjustment completed');
    
    const unplacedResult = await placementForUnplacedOtherNat();
    console.log('✅ Unplaced students placement completed');
    
    // Send response matching EXACT return structures
    res.json({
      success: true,
      message: 'placement operations of Other Natural Category Departments Placement completed successfully',
      
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
//the ff is used to run placement for othe social second semister students
Router.post('/runOtherSocialPlacement', async (req, res) => {
  try {
    console.log('🚀 Starting placement generation...');
    
    // Run all three functions
    const placementResult = await GenplacementForOtherSocial();
    console.log('✅ Placement generation completed');
    
    const quotaResult = await femaleQuota_AdjustmentForOtherSocial();
    console.log('✅ Female quota adjustment completed');
    
    const unplacedResult = await placementForUnplacedOtherSocial();
    console.log('✅ Unplaced students placement completed');
    
    // Send response matching EXACT return structures
    res.json({
      success: true,
      message: 'placement operations of Other Social Category Departments Placement completed successfully',
      
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