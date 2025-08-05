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
    const students = await Student.find().populate('preferences');
    const departments = await Department.find();
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students found' });
    }
    
    if (departments.length === 0) {
      return res.status(400).json({ message: 'No departments found' });
    }
    
    console.log(`📊 Processing ${students.length} students for ${departments.length} departments`);
    
    // Phase 1: Calculate scores and prepare for placement
    const studentsWithScores = students.map(student => {
      const scores = calculateTotalScore(student);
      return {
        ...student.toObject(),
        ...scores,
        placed: false,
        assignedDepartment: null
      };
    });
    
    // Sort students by total score (highest first)
    studentsWithScores.sort((a, b) => b.totalScore - a.totalScore);
    
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
      
      // Try to place student in their preferred departments
      for (const prefDept of student.preferences) {
        const deptName = prefDept.name;
        const deptPlacement = departmentPlacements[deptName];
        
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
          break;
        }
      }
    }
    
    console.log('👩 Phase 2: Female quota check (20% rule)...');
    
    // Phase 2: Female quota adjustment
    for (const [deptName, deptPlacement] of Object.entries(departmentPlacements)) {
      const totalPlaced = deptPlacement.students.length;
      const femaleRatio = totalPlaced > 0 ? deptPlacement.femaleCount / totalPlaced : 0;
      
      console.log(`📊 ${deptName}: ${deptPlacement.femaleCount}/${totalPlaced} females (${Math.round(femaleRatio * 100)}%)`);
      
      if (femaleRatio < 0.20 && totalPlaced > 0) {
        const neededFemales = Math.ceil(totalPlaced * 0.20) - deptPlacement.femaleCount;
        console.log(`🎯 ${deptName} needs ${neededFemales} more females for 20% quota`);
        
        // Find unplaced females who wanted this department
        const availableFemales = studentsWithScores.filter(student => 
          !student.placed && 
          student.gender === 'Female' &&
          student.preferences.some(pref => pref.name === deptName)
        );
        
        // Sort available females by total score (highest first)
        availableFemales.sort((a, b) => b.totalScore - a.totalScore);
        
        // Phase 3: Rebalancing - replace lowest scoring males with highest scoring females
        let femalesAdded = 0;
        for (let i = 0; i < Math.min(neededFemales, availableFemales.length); i++) {
          const femaleToAdd = availableFemales[i];
          
          // Find lowest scoring male in this department
          const malesInDept = deptPlacement.students.filter(s => s.gender === 'Male');
          if (malesInDept.length > 0) {
            malesInDept.sort((a, b) => a.totalScore - b.totalScore); // lowest first
            const lowestMale = malesInDept[0];
            
            // Only replace if female has higher score than lowest male
            if (femaleToAdd.totalScore > lowestMale.totalScore) {
              // Remove male
              const maleIndex = deptPlacement.students.findIndex(s => s.studentId === lowestMale.studentId);
              deptPlacement.students.splice(maleIndex, 1);
              deptPlacement.maleCount--;
              
              // Mark male as unplaced
              const originalMale = studentsWithScores.find(s => s.studentId === lowestMale.studentId);
              originalMale.placed = false;
              originalMale.assignedDepartment = null;
              
              // Add female
              deptPlacement.students.push(femaleToAdd);
              deptPlacement.femaleCount++;
              femaleToAdd.placed = true;
              femaleToAdd.assignedDepartment = deptName;
              
              femalesAdded++;
              console.log(`🔄 Replaced ${lowestMale.fullName} (${lowestMale.totalScore}) with ${femaleToAdd.fullName} (${femaleToAdd.totalScore}) in ${deptName}`);
            }
          }
        }
        
        console.log(`✅ Added ${femalesAdded} females to ${deptName} via rebalancing`);
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
      .populate('preferences')
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
          entranceScore: student.entranceScore
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