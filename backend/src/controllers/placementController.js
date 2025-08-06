import Student from '../models/Student.js';
import Department from '../models/Department.js';
import { 
  computeBonus, 
  computeTotal, 
  canPlaceSemester1, 
  canPlaceSemester2,
  validatePreferences,
  CONFIG 
} from '../services/placementService.js';

// Helper function to determine if region is emerging
const isEmergingRegion = (region) => {
  const emergingRegions = ['Afar', 'Benishangul-Gumuz', 'Gambella', 'Somali'];
  return emergingRegions.includes(region);
};

// Helper function to calculate total score based on placement stage
const calculateTotalScore = (student, placementStage) => {
  let gpaToUse;
  
  if (placementStage === 'after-sem1') {
    gpaToUse = student.semester1GPA;
  } else if (placementStage === 'after-sem2') {
    gpaToUse = student.cgpa;
  } else {
    gpaToUse = student.gpa; // fallback
  }
  
  const bonus = computeBonus({
    gender: student.gender,
    disability: student.disability,
    disabilityVerified: student.disabilityVerified,
    region: student.region
  });
  
  const scores = computeTotal({
    gpa: gpaToUse,
    entranceScore: student.entranceScore,
    entranceMax: student.entranceMax,
    bonus
  });
  
  return {
    gpaScore: Math.round((gpaToUse / 4.0) * 50 * 100) / 100,
    entranceScore: Math.round((student.entranceScore / student.entranceMax) * 20 * 100) / 100,
    affirmativePoints: bonus,
    totalScore: scores
  };
};

// Main placement algorithm
export const runPlacement = async (req, res) => {
  try {
    console.log('🚀 Starting placement algorithm...');
    
    // Get all students and departments
    const students = await Student.find();
    const departments = await Department.find();
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found' });
    }
    
    if (departments.length === 0) {
      return res.status(400).json({ message: 'No departments found' });
    }
    
    console.log(`📊 Processing ${students.length} students for ${departments.length} departments`);
    
    // Create department name mapping for case-insensitive lookup
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.name.toLowerCase()] = dept.name;
    });
    
    // Phase 1: Process Semester 1 students
    console.log('📋 Phase 1: Processing Semester 1 students...');
    const semester1Students = students.filter(student => 
      canPlaceSemester1(student) && student.placementStage === 'admitted'
    );
    
    const semester1Results = await processSemester1Placement(semester1Students, departmentMap);
    
    // Phase 2: Process Semester 2 students
    console.log('📋 Phase 2: Processing Semester 2 students...');
    const semester2Students = students.filter(student => 
      canPlaceSemester2(student) && student.placementStage === 'after-sem1'
    );
    
    const semester2Results = await processSemester2Placement(semester2Students, departmentMap);
    
    // Combine results
    const totalPlaced = semester1Results.placed + semester2Results.placed;
    const totalUnplaced = semester1Results.unplaced + semester2Results.unplaced;
    
    console.log('🎉 Placement algorithm completed successfully!');
    console.log(`📊 Final Summary: ${totalPlaced} placed, ${totalUnplaced} unplaced`);
    
    res.status(200).json({
      message: 'Placement algorithm completed successfully',
      summary: {
        totalStudents: students.length,
        placedStudents: totalPlaced,
        unplacedStudents: totalUnplaced,
        semester1Results,
        semester2Results
      }
    });
    
  } catch (error) {
    console.error('❌ Placement algorithm error:', error);
    res.status(500).json({ 
      message: 'Placement algorithm failed', 
      error: error.message 
    });
  }
};

// Process Semester 1 placement
async function processSemester1Placement(students, departmentMap) {
  console.log(`👥 Processing ${students.length} Semester 1 students`);
  
  // Get departments from database for capacity information
  const departments = await Department.find();
  const departmentData = {};
  departments.forEach(dept => {
    departmentData[dept.name] = dept;
  });
  
  const studentsWithScores = students.map(student => {
    const scores = calculateTotalScore(student, 'after-sem1');
    
    // Validate preferences
    const validation = validatePreferences(student, 'after-sem1');
    if (!validation.valid) {
      console.log(`⚠️ ${student.fullName}: ${validation.reason}`);
      return null;
    }
    
    // Convert preferences to proper department names (case-insensitive)
    const validPreferences = student.preferences
      .map(pref => {
        const normalizedPref = pref.toLowerCase();
        const mappedDept = departmentMap[normalizedPref];
        return mappedDept || null;
      })
      .filter(pref => pref !== null);
    
    return {
      ...student.toObject(),
      ...scores,
      preferences: validPreferences,
      placed: false,
      assignedDepartment: null
    };
  }).filter(student => student !== null);
  
  // Sort students by total score (highest first)
  studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
  
  // Initialize department tracking
  const departmentPlacements = {};
  Object.values(departmentMap).forEach(deptName => {
    const dept = departmentData[deptName];
    departmentPlacements[deptName] = {
      capacity: dept ? dept.capacity : 50, // Use actual capacity or default
      students: [],
      maleCount: 0,
      femaleCount: 0
    };
  });
  
  // Priority-based placement for Semester 1
  for (const student of studentsWithScores) {
    if (student.placed) continue;
    
    console.log(`\n🎯 Trying to place: ${student.fullName} (Score: ${student.totalScore})`);
    console.log(`   Preferences: [${student.preferences.join(', ')}]`);
    
    // Try each priority in order
    for (let i = 0; i < student.preferences.length; i++) {
      const deptName = student.preferences[i];
      const deptPlacement = departmentPlacements[deptName];
      
      if (!deptPlacement) {
        console.log(`   ❌ ${deptName} not found in departments`);
        continue;
      }
      
      console.log(`   Checking Priority ${i + 1}: ${deptName} (${deptPlacement.students.length}/${deptPlacement.capacity})`);
      
      if (deptPlacement.students.length < deptPlacement.capacity) {
        // Place student in this department
        deptPlacement.students.push(student);
        if (student.gender === 'Male') {
          deptPlacement.maleCount++;
        } else {
          deptPlacement.femaleCount++;
        }
        
        student.placed = true;
        student.assignedDepartment = deptName;
        student.placementStage = 'after-sem1';
        console.log(`✅ Placed ${student.fullName} in ${deptName} (Priority ${i + 1})`);
        break;
      } else {
        console.log(`   ❌ ${deptName} is full`);
      }
    }
    
    if (!student.placed) {
      console.log(`   ⚠️ Could not place ${student.fullName} - no available spots in any preferred department`);
    }
  }
  
  // Apply female quota enforcement
  applyFemaleQuota(departmentPlacements, studentsWithScores);
  
  // Save results to database
  await savePlacementResults(studentsWithScores);
  
  return {
    placed: studentsWithScores.filter(s => s.placed).length,
    unplaced: studentsWithScores.filter(s => !s.placed).length,
    departments: Object.entries(departmentPlacements).map(([name, data]) => ({
      name,
      capacity: data.capacity,
      filled: data.students.length,
      males: data.maleCount,
      females: data.femaleCount,
      femalePercentage: data.students.length > 0 ? Math.round((data.femaleCount / data.students.length) * 100) : 0
    }))
  };
}

// Process Semester 2 placement
async function processSemester2Placement(students, departmentMap) {
  console.log(`👥 Processing ${students.length} Semester 2 students`);
  
  // Get departments from database for capacity information
  const departments = await Department.find();
  const departmentData = {};
  departments.forEach(dept => {
    departmentData[dept.name] = dept;
  });
  
  const studentsWithScores = students.map(student => {
    const scores = calculateTotalScore(student, 'after-sem2');
    
    // Validate preferences
    const validation = validatePreferences(student, 'after-sem2');
    if (!validation.valid) {
      console.log(`⚠️ ${student.fullName}: ${validation.reason}`);
      return null;
    }
    
    // Convert preferences to proper department names (case-insensitive)
    const validPreferences = student.preferences
      .map(pref => {
        const normalizedPref = pref.toLowerCase();
        const mappedDept = departmentMap[normalizedPref];
        return mappedDept || null;
      })
      .filter(pref => pref !== null);
    
    return {
      ...student.toObject(),
      ...scores,
      preferences: validPreferences,
      placed: false,
      assignedDepartment: null
    };
  }).filter(student => student !== null);
  
  // Sort students by total score (highest first)
  studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
  
  // Initialize department tracking
  const departmentPlacements = {};
  Object.values(departmentMap).forEach(deptName => {
    const dept = departmentData[deptName];
    departmentPlacements[deptName] = {
      capacity: dept ? dept.capacity : 50, // Use actual capacity or default
      students: [],
      maleCount: 0,
      femaleCount: 0
    };
  });
  
  // Priority-based placement for Semester 2
  for (const student of studentsWithScores) {
    if (student.placed) continue;
    
    console.log(`\n🎯 Trying to place: ${student.fullName} (Score: ${student.totalScore})`);
    console.log(`   Preferences: [${student.preferences.join(', ')}]`);
    
    // Try each priority in order
    for (let i = 0; i < student.preferences.length; i++) {
      const deptName = student.preferences[i];
      const deptPlacement = departmentPlacements[deptName];
      
      if (!deptPlacement) {
        console.log(`   ❌ ${deptName} not found in departments`);
        continue;
      }
      
      console.log(`   Checking Priority ${i + 1}: ${deptName} (${deptPlacement.students.length}/${deptPlacement.capacity})`);
      
      if (deptPlacement.students.length < deptPlacement.capacity) {
        // Place student in this department
        deptPlacement.students.push(student);
        if (student.gender === 'Male') {
          deptPlacement.maleCount++;
        } else {
          deptPlacement.femaleCount++;
        }
        
        student.placed = true;
        student.assignedDepartment = deptName;
        student.placementStage = 'placed';
        console.log(`✅ Placed ${student.fullName} in ${deptName} (Priority ${i + 1})`);
        break;
      } else {
        console.log(`   ❌ ${deptName} is full`);
      }
    }
    
    if (!student.placed) {
      console.log(`   ⚠️ Could not place ${student.fullName} - no available spots in any preferred department`);
    }
  }
  
  // Apply female quota enforcement
  applyFemaleQuota(departmentPlacements, studentsWithScores);
  
  // Save results to database
  await savePlacementResults(studentsWithScores);
  
  return {
    placed: studentsWithScores.filter(s => s.placed).length,
    unplaced: studentsWithScores.filter(s => !s.placed).length,
    departments: Object.entries(departmentPlacements).map(([name, data]) => ({
      name,
      capacity: data.capacity,
      filled: data.students.length,
      males: data.maleCount,
      females: data.femaleCount,
      femalePercentage: data.students.length > 0 ? Math.round((data.femaleCount / data.students.length) * 100) : 0
    }))
  };
}

// Apply female quota enforcement (20% rule)
function applyFemaleQuota(departmentPlacements, studentsWithScores) {
  console.log('👩 Applying female quota enforcement (20% rule)...');
  
  for (const [deptName, deptPlacement] of Object.entries(departmentPlacements)) {
    const totalPlaced = deptPlacement.students.length;
    
    if (totalPlaced === 0) continue;
    
    const femaleRatio = deptPlacement.femaleCount / totalPlaced;
    const targetFemales = Math.ceil(totalPlaced * 0.20);
    const currentFemales = deptPlacement.femaleCount;
    
    console.log(`📊 ${deptName}: ${currentFemales}/${totalPlaced} females (${Math.round(femaleRatio * 100)}%), Target: ${targetFemales}`);
    
    if (currentFemales < targetFemales) {
      const neededFemales = targetFemales - currentFemales;
      console.log(`🎯 ${deptName} needs ${neededFemales} more females for 20% quota`);
      
      // Find unplaced females who wanted this department
      const availableFemales = studentsWithScores.filter(student => 
        !student.placed && 
        student.gender === 'Female' &&
        student.preferences.includes(deptName)
      );
      
      if (availableFemales.length === 0) {
        console.log(`⚠️ No unplaced females available who wanted ${deptName}`);
        continue;
      }
      
      // Sort available females by total score (highest first)
      availableFemales.sort((a, b) => b.totalScore - a.totalScore);
      
      // Get males in this department sorted by score (lowest first)
      const malesInDept = deptPlacement.students.filter(s => s.gender === 'Male');
      malesInDept.sort((a, b) => a.totalScore - b.totalScore);
      
      // Rebalancing: Replace lowest-scoring males with highest-scoring available females
      let femalesAdded = 0;
      const replacementsNeeded = Math.min(neededFemales, availableFemales.length, malesInDept.length);
      
      for (let i = 0; i < replacementsNeeded; i++) {
        const femaleToAdd = availableFemales[i];
        const maleToRemove = malesInDept[i];
        
        // Remove male from department
        const maleIndex = deptPlacement.students.findIndex(s => s.studentId === maleToRemove.studentId);
        deptPlacement.students.splice(maleIndex, 1);
        deptPlacement.maleCount--;
        
        // Mark male as unplaced in main array
        const originalMale = studentsWithScores.find(s => s.studentId === maleToRemove.studentId);
        originalMale.placed = false;
        originalMale.assignedDepartment = null;
        
        // Add female to department
        deptPlacement.students.push(femaleToAdd);
        deptPlacement.femaleCount++;
        femaleToAdd.placed = true;
        femaleToAdd.assignedDepartment = deptName;
        
        femalesAdded++;
        console.log(`🔄 Replaced ${maleToRemove.fullName} (${maleToRemove.totalScore}) with ${femaleToAdd.fullName} (${femaleToAdd.totalScore}) in ${deptName}`);
      }
      
      console.log(`✅ Added ${femalesAdded} females to ${deptName} via quota enforcement`);
    } else {
      console.log(`✅ ${deptName} already meets 20% female quota`);
    }
  }
}

// Save placement results to database
async function savePlacementResults(studentsWithScores) {
  console.log('💾 Saving placement results to database...');
  
  const updatePromises = studentsWithScores.map(student => 
    Student.findOneAndUpdate(
      { studentId: student.studentId },
      {
        totalScore: student.totalScore,
        assignedDepartment: student.assignedDepartment,
        placementStage: student.placementStage
      },
      { new: true }
    )
  );
  
  await Promise.all(updatePromises);
}

// Get placement results
export const getPlacementResults = async (req, res) => {
  try {
    const students = await Student.find({ assignedDepartment: { $ne: null } })
      .sort({ totalScore: -1 });
    
    const departments = await Department.find();
    
    // Group students by department
    const departmentResults = {};
    departments.forEach(dept => {
      departmentResults[dept.name] = {
        capacity: dept.capacity,
        students: []
      };
    });
    
    students.forEach(student => {
      if (student.assignedDepartment && departmentResults[student.assignedDepartment]) {
        departmentResults[student.assignedDepartment].students.push({
          studentId: student.studentId,
          fullName: student.fullName,
          gender: student.gender,
          region: student.region,
          totalScore: student.totalScore,
          gpa: student.gpa,
          semester1GPA: student.semester1GPA,
          semester2GPA: student.semester2GPA,
          cgpa: student.cgpa,
          entranceScore: student.entranceScore,
          disability: student.disability,
          disabilityVerified: student.disabilityVerified,
          placementStage: student.placementStage
        });
      }
    });
    
    res.status(200).json({
      totalPlaced: students.length,
      departments: departmentResults
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching placement results', 
      error: error.message 
    });
  }
};

// Clear all placements
export const clearPlacements = async (req, res) => {
  try {
    await Student.updateMany(
      {},
      {
        $unset: { 
          assignedDepartment: 1,
          totalScore: 1
        },
        $set: {
          placementStage: 'admitted'
        }
      }
    );
    
    res.status(200).json({ message: 'All placements cleared successfully' });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error clearing placements', 
      error: error.message 
    });
  }
};