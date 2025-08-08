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

// Compute total score details for a given placement stage
const calculateTotalScore = (student, placementStage) => {
  const gpaToUse = placementStage === 'after-sem1' ? student.semester1GPA
                   : placementStage === 'after-sem2' ? student.cgpa
                   : student.gpa;
  const bonus = computeBonus({
    gender: student.gender,
    disability: student.disability,
    disabilityVerified: student.disabilityVerified,
    region: student.region
  });
  const totalScore = computeTotal({
    gpa: gpaToUse,
    entranceScore: student.entranceScore,
    entranceMax: student.entranceMax,
    bonus
  });
  return {
    gpaScore: Math.round((gpaToUse / 4.0) * 50 * 100) / 100,
    entranceScore: Math.round((student.entranceScore / student.entranceMax) * 20 * 100) / 100,
    affirmativePoints: bonus,
    totalScore
  };
};

// Main placement algorithm
export const runPlacement = async (req, res) => {
  try {
    const students = await Student.find();
    const departments = await Department.find();
    if (students.length === 0) return res.status(400).json({ message: 'No students found' });
    if (departments.length === 0) return res.status(400).json({ message: 'No departments found' });

    // case-insensitive name -> canonical name
    const departmentMap = Object.fromEntries(departments.map(d => [d.name.toLowerCase(), d.name]));
    // canonical name -> Department doc
    const departmentData = Object.fromEntries(departments.map(d => [d.name, d]));

    const semester1Students = students.filter(s => canPlaceSemester1(s) && s.placementStage === 'admitted');
    const semester2Students = students.filter(s => canPlaceSemester2(s) && s.placementStage === 'after-sem1');

    const semester1Results = await processPlacement(semester1Students, departmentMap, departmentData, 'after-sem1', 'after-sem1');
    const semester2Results = await processPlacement(semester2Students, departmentMap, departmentData, 'after-sem2', 'placed');

    const totalPlaced = semester1Results.placed + semester2Results.placed;
    const totalUnplaced = semester1Results.unplaced + semester2Results.unplaced;

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
    res.status(500).json({ message: 'Placement algorithm failed', error: error.message });
  }
};

// Shared placement processor for both semesters
async function processPlacement(students, departmentMap, departmentData, scoreStage, placedStage) {
  const studentsWithScores = students
    .map(student => {
      const validation = validatePreferences(student, scoreStage);
      if (!validation.valid) return null;
      const validPreferences = student.preferences
        .map(pref => departmentMap[pref.toLowerCase()] || null)
        .filter(Boolean);
      return {
        ...student.toObject(),
        ...calculateTotalScore(student, scoreStage),
        preferences: validPreferences,
        placed: false,
        assignedDepartment: null
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.totalScore - a.totalScore);

  const departmentPlacements = {};
  Object.values(departmentMap).forEach(name => {
    const dept = departmentData[name];
    departmentPlacements[name] = { capacity: dept ? dept.capacity : 50, students: [], maleCount: 0, femaleCount: 0 };
  });

  for (const student of studentsWithScores) {
    if (student.placed) continue;
    for (let i = 0; i < student.preferences.length; i++) {
      const deptName = student.preferences[i];
      const deptPlacement = departmentPlacements[deptName];
      if (!deptPlacement) continue;
      if (deptPlacement.students.length < deptPlacement.capacity) {
        deptPlacement.students.push(student);
        student.gender === 'Male' ? deptPlacement.maleCount++ : deptPlacement.femaleCount++;
        student.placed = true;
        student.assignedDepartment = deptName;
        student.placementStage = placedStage;
        break;
      }
    }
  }

  applyFemaleQuota(departmentPlacements, studentsWithScores);
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
  for (const [deptName, deptPlacement] of Object.entries(departmentPlacements)) {
    const totalPlaced = deptPlacement.students.length;
    if (totalPlaced === 0) continue;
    const targetFemales = Math.ceil(totalPlaced * 0.20);
    if (deptPlacement.femaleCount >= targetFemales) continue;

    const neededFemales = targetFemales - deptPlacement.femaleCount;
    const availableFemales = studentsWithScores
      .filter(s => !s.placed && s.gender === 'Female' && s.preferences.includes(deptName))
      .sort((a, b) => b.totalScore - a.totalScore);
    const malesInDept = deptPlacement.students
      .filter(s => s.gender === 'Male')
      .sort((a, b) => a.totalScore - b.totalScore);

    const replacementsNeeded = Math.min(neededFemales, availableFemales.length, malesInDept.length);
    for (let i = 0; i < replacementsNeeded; i++) {
      const femaleToAdd = availableFemales[i];
      const maleToRemove = malesInDept[i];
      const maleIndex = deptPlacement.students.findIndex(s => s.studentId === maleToRemove.studentId);
      deptPlacement.students.splice(maleIndex, 1);
      deptPlacement.maleCount--;
      const originalMale = studentsWithScores.find(s => s.studentId === maleToRemove.studentId);
      originalMale.placed = false;
      originalMale.assignedDepartment = null;
      deptPlacement.students.push(femaleToAdd);
      deptPlacement.femaleCount++;
      femaleToAdd.placed = true;
      femaleToAdd.assignedDepartment = deptName;
    }
  }
}

// Save placement results to database
async function savePlacementResults(studentsWithScores) {
  await Promise.all(
    studentsWithScores.map(student =>
      Student.findOneAndUpdate(
        { studentId: student.studentId },
        {
          totalScore: student.totalScore,
          assignedDepartment: student.assignedDepartment,
          placementStage: student.placementStage
        },
        { new: true }
      )
    )
  );
}

// Get placement results
export const getPlacementResults = async (req, res) => {
  try {
    const students = await Student.find({ assignedDepartment: { $ne: null } }).sort({ totalScore: -1 });
    const departments = await Department.find();
    const departmentResults = Object.fromEntries(
      departments.map(d => [d.name, { capacity: d.capacity, students: [] }])
    );
    students.forEach(s => {
      const bucket = departmentResults[s.assignedDepartment];
      if (!bucket) return;
      bucket.students.push({
        studentId: s.studentId,
        fullName: s.fullName,
        gender: s.gender,
        region: s.region,
        totalScore: s.totalScore,
        gpa: s.gpa,
        semester1GPA: s.semester1GPA,
        semester2GPA: s.semester2GPA,
        cgpa: s.cgpa,
        entranceScore: s.entranceScore,
        disability: s.disability,
        disabilityVerified: s.disabilityVerified,
        placementStage: s.placementStage
      });
    });
    res.status(200).json({ totalPlaced: students.length, departments: departmentResults });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching placement results', error: error.message });
  }
};

// Clear all placements
export const clearPlacements = async (req, res) => {
  try {
    await Student.updateMany(
      {},
      {
        $unset: { assignedDepartment: 1, totalScore: 1 },
        $set: { placementStage: 'admitted' }
      }
    );
    res.status(200).json({ message: 'All placements cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing placements', error: error.message });
  }
};