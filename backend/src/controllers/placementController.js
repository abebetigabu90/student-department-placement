import Student from '../models/Student.js';
import Department from '../models/Department.js';

// Helper function to determine if region is emerging
const isEmergingRegion = (region) => {
  const emergingRegions = ['Afar', 'Benishangul-Gumuz', 'Gambella', 'Somali'];
  return emergingRegions.includes(region);
};

// Helper function to calculate total score
const calculateTotalScore = (student) => {
  // GPA Score (0-50 points)
  const gpaScore = (student.gpa / 4.0) * 50;
  
  // Entrance Score (0-20 points)
  const entranceScore = (student.entranceScore / student.entranceMax) * 20;
  
  // Affirmative Action Points (cumulative)
  let affirmativePoints = 0;
  
  // Female bonus: +5 points
  if (student.gender === 'Female') {
    affirmativePoints += 5;
  }
  
  // Disability bonus: +5 points
  if (student.disability && student.disability !== 'None' && student.disabilityVerified) {
    affirmativePoints += 5;
  }
  
  // Emerging region bonus: +5 points
  if (isEmergingRegion(student.region)) {
    affirmativePoints += 5;
  }
  
  const totalScore = gpaScore + entranceScore + affirmativePoints;
  
  return {
    gpaScore: Math.round(gpaScore * 100) / 100,
    entranceScore: Math.round(entranceScore * 100) / 100,
    affirmativePoints,
    totalScore: Math.round(totalScore * 100) / 100
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
    
    // Debug: Log student data
    console.log('👥 Students found:');
    students.forEach(student => {
      console.log(`- ${student.fullName}: preferences = [${student.preferences?.join(', ') || 'NONE'}]`);
    });
    
    // Debug: Log department data
    console.log('🏢 Departments found:');
    departments.forEach(dept => {
      console.log(`- ${dept.name}: capacity = ${dept.capacity}`);
    });
    
    // Create department name mapping for case-insensitive lookup
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.name.toLowerCase()] = dept.name;
    });
    
    console.log('🗺️ Department mapping:', departmentMap);
    
    // Phase 1: Calculate scores and prepare for placement
    const studentsWithScores = students.map(student => {
      const scores = calculateTotalScore(student);
      
      // Convert preferences to proper department names (case-insensitive)
      const validPreferences = (student.preferences || [])
        .map(pref => {
          const normalizedPref = pref.toLowerCase();
          const mappedDept = departmentMap[normalizedPref];
          console.log(`🔍 Mapping preference "${pref}" -> "${mappedDept}"`);
          return mappedDept || null;
        })
        .filter(pref => pref !== null);
      
      console.log(`📋 ${student.fullName}: Valid preferences = [${validPreferences.join(', ')}]`);
      
      return {
        ...student.toObject(),
        ...scores,
        preferences: validPreferences,
        placed: false,
        assignedDepartment: null
      };
    });
    
    // Sort students by total score (highest first)
    studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
    
    console.log('🏆 Students ranked by score:');
    studentsWithScores.forEach((student, index) => {
      console.log(`${index + 1}. ${student.fullName}: ${student.totalScore} points, preferences: [${student.preferences.join(', ')}]`);
    });
    
    // Initialize department tracking
    const departmentPlacements = {};
    departments.forEach(dept => {
      departmentPlacements[dept.name] = {
        capacity: dept.capacity,
        students: [],
        maleCount: 0,
        femaleCount: 0
      };
    });
    
    console.log('📋 Phase 1: Regular merit-based placement...');
    
    // Phase 1: Regular placement based on merit and preferences
    for (const student of studentsWithScores) {
      if (student.placed) continue;
      
      console.log(`\n🎯 Trying to place: ${student.fullName} (Score: ${student.totalScore})`);
      console.log(`   Preferences: [${student.preferences.join(', ')}]`);
      
      // Try to place student in their preferred departments
      for (const deptName of student.preferences) {
        const deptPlacement = departmentPlacements[deptName];
        
        console.log(`   Checking ${deptName}: ${deptPlacement?.students.length || 0}/${deptPlacement?.capacity || 0} filled`);
        
        if (deptPlacement && deptPlacement.students.length < deptPlacement.capacity) {
          // Place student in this department
          deptPlacement.students.push(student);
          if (student.gender === 'Male') {
            deptPlacement.maleCount++;
          } else {
            deptPlacement.femaleCount++;
          }
          
          student.placed = true;
          student.assignedDepartment = deptName;
          console.log(`✅ Placed ${student.fullName} in ${deptName} (Score: ${student.totalScore})`);
          break;
        } else {
          console.log(`   ❌ ${deptName} is full or doesn't exist`);
        }
      }
      
      if (!student.placed) {
        console.log(`   ⚠️ Could not place ${student.fullName} - no available spots in preferred departments`);
      }
    }
    
    console.log('👩 Phase 2: Female quota enforcement (20% rule)...');
    
    // Phase 2: Female quota enforcement
    for (const [deptName, deptPlacement] of Object.entries(departmentPlacements)) {
      const totalPlaced = deptPlacement.students.length;
      
      if (totalPlaced === 0) continue; // Skip empty departments
      
      const femaleRatio = deptPlacement.femaleCount / totalPlaced;
      const targetFemales = Math.ceil(totalPlaced * 0.20); // At least 20%
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
        
        // Sort available females by total score (highest first)
        availableFemales.sort((a, b) => b.totalScore - a.totalScore);
        
        console.log(`👥 Found ${availableFemales.length} unplaced females who wanted ${deptName}`);
        
        if (availableFemales.length === 0) {
          console.log(`⚠️ No unplaced females available who wanted ${deptName}`);
          continue;
        }
        
        // Get males in this department sorted by score (lowest first)
        const malesInDept = deptPlacement.students.filter(s => s.gender === 'Male');
        malesInDept.sort((a, b) => a.totalScore - b.totalScore); // lowest first
        
        console.log(`👨 Males in ${deptName}:`, malesInDept.map(m => `${m.fullName}(${m.totalScore})`));
        
        // Rebalancing: Replace lowest-scoring males with highest-scoring available females
        let femalesAdded = 0;
        const replacementsNeeded = Math.min(neededFemales, availableFemales.length, malesInDept.length);
        
        for (let i = 0; i < replacementsNeeded; i++) {
          const femaleToAdd = availableFemales[i];
          const maleToRemove = malesInDept[i]; // Take lowest scoring male
          
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
        
        // Update final counts
        const finalFemaleRatio = deptPlacement.femaleCount / deptPlacement.students.length;
        console.log(`📈 ${deptName} final: ${deptPlacement.femaleCount}/${deptPlacement.students.length} females (${Math.round(finalFemaleRatio * 100)}%)`);
      } else {
        console.log(`✅ ${deptName} already meets 20% female quota`);
      }
    }
    
    console.log('💾 Saving placement results to database...');
    
    // Save results to database
    const updatePromises = studentsWithScores.map(student => 
      Student.findOneAndUpdate(
        { studentId: student.studentId },
        {
          totalScore: student.totalScore,
          assignedDepartment: student.assignedDepartment,
          placementStage: student.placed ? 'placed' : 'after-sem2'
        },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Generate summary statistics
    const placementSummary = {
      totalStudents: students.length,
      placedStudents: studentsWithScores.filter(s => s.placed).length,
      unplacedStudents: studentsWithScores.filter(s => !s.placed).length,
      departments: Object.entries(departmentPlacements).map(([name, data]) => ({
        name,
        capacity: data.capacity,
        filled: data.students.length,
        males: data.maleCount,
        females: data.femaleCount,
        femalePercentage: data.students.length > 0 ? Math.round((data.femaleCount / data.students.length) * 100) : 0
      }))
    };
    
    console.log('🎉 Placement algorithm completed successfully!');
    console.log('📊 Final Summary:', JSON.stringify(placementSummary, null, 2));
    
    res.status(200).json({
      message: 'Placement algorithm completed successfully',
      summary: placementSummary
    });
    
  } catch (error) {
    console.error('❌ Placement algorithm error:', error);
    res.status(500).json({ 
      message: 'Placement algorithm failed', 
      error: error.message 
    });
  }
};

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
          entranceScore: student.entranceScore,
          disability: student.disability,
          disabilityVerified: student.disabilityVerified
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
          placementStage: 'after-sem2'
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