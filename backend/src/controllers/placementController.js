import Student from '../models/student.js';
import Department from '../models/Department.js';
import { computeBonus, computeTotal, canPlaceSemester1, canPlaceSemester2, validatePreferences, CONFIG } from '../services/placementService.js';

// Calculate total score details
const calculateTotalScore = (student, placementStage) => {
  const gpaToUse = placementStage === 'after-sem1' ? student.gpa : student.cgpa;
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

// Run placement for Sem1 and Sem2
export const runPlacement = async (req, res) => {
  try {
    const students = await Student.find();
    const departments = await Department.find();
    if (!students.length) return res.status(400).json({ message: 'No students found' });
    if (!departments.length) return res.status(400).json({ message: 'No departments found' });

    const semester1Students = students.filter(s => canPlaceSemester1(s) && s.placementStage === 'admitted');
    const semester2Students = students.filter(s => canPlaceSemester2(s) && s.placementStage === 'after-sem1');

    const semester1Results = await processPlacement(semester1Students, departments, 'after-sem1');
    const semester2Results = await processPlacement(semester2Students, departments, 'after-sem2');

    res.status(200).json({
      message: 'Placement algorithm completed',
      summary: { semester1Results, semester2Results }
    });
  } catch (error) {
    res.status(500).json({ message: 'Placement algorithm failed', error: error.message });
  }
};

// Process placement
async function processPlacement(students, departments, placementStage) {
  const studentsWithScores = students
    .map(student => {
      const validation = validatePreferences(student, placementStage);
      if (!validation.valid) return { ...student.toObject(), placed: false, reason: validation.reason };

      const scoreDetails = calculateTotalScore(student, placementStage);
      return { ...student.toObject(), ...scoreDetails, placed: false, assignedDepartment: null, assignedSubStream: null };
    })
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  // Setup buckets for streams, substreams, final departments
  const buckets = {};

  // Streams
  Object.entries(CONFIG.streams).forEach(([name, config]) => {
    buckets[name] = { capacity: config.capacity, students: [], maleCount: 0, femaleCount: 0 };
    if (config.nextStep === 'sub') {
      Object.entries(config.sub).forEach(([subName, subConfig]) => {
        buckets[subName] = { capacity: subConfig.capacity, students: [], maleCount: 0, femaleCount: 0 };
      });
    }
  });

  // Final departments
  departments.forEach(d => {
    buckets[d.name] = { capacity: d.capacity, students: [], maleCount: 0, femaleCount: 0 };
  });

  // Placement loop
  for (const student of studentsWithScores) {
    if (student.placed) continue;
    let placed = false;

    for (const pref of student.preferences) {
      const bucket = buckets[pref];
      if (!bucket || bucket.students.length >= bucket.capacity) continue;

      // Assign student
      bucket.students.push(student);
      student.gender === 'Male' ? bucket.maleCount++ : bucket.femaleCount++;
      student.placed = true;

      // Track substream if applicable
      if (CONFIG.streams[pref]?.nextStep === 'sub') student.assignedSubStream = pref;

      // Assign department (final department or temporary substream)
      student.assignedDepartment = placementStage === 'after-sem2' && student.assignedSubStream
        ? student.assignedSubStream
        : pref;

      placed = true;
      break;
    }

    if (!placed && !student.reason) student.reason = 'All preferred streams/departments full';
  }

  // Apply female quota per bucket
  applyFemaleQuota(buckets, studentsWithScores);

  // Save placement results to DB
  await Promise.all(
    studentsWithScores.map(s =>
      Student.findOneAndUpdate(
        { studentId: s.studentId },
        {
          totalScore: s.totalScore,
          assignedDepartment: s.assignedDepartment,
          assignedSubStream: s.assignedSubStream,
          placementStage: placementStage === 'after-sem1' ? 'after-sem1' : 'placed'
        },
        { new: true }
      )
    )
  );

  return {
    placed: studentsWithScores.filter(s => s.placed).length,
    unplaced: studentsWithScores.filter(s => !s.placed).length,
    unplacedDetails: studentsWithScores.filter(s => !s.placed).map(s => ({ studentId: s.studentId, fullName: s.fullName, reason: s.reason }))
  };
}

// Apply female quota
function applyFemaleQuota(buckets, studentsWithScores) {
  Object.entries(buckets).forEach(([bucketName, bucket]) => {
    const targetFemales = Math.ceil(bucket.students.length * 0.2);
    if (bucket.femaleCount >= targetFemales) return;

    const neededFemales = targetFemales - bucket.femaleCount;
    const availableFemales = studentsWithScores
      .filter(s => !s.placed && s.gender === 'Female' && s.preferences.includes(bucketName))
      .sort((a, b) => b.totalScore - a.totalScore);
    const malesInBucket = bucket.students.filter(s => s.gender === 'Male').sort((a, b) => a.totalScore - b.totalScore);

    const replacements = Math.min(neededFemales, availableFemales.length, malesInBucket.length);
    for (let i = 0; i < replacements; i++) {
      const female = availableFemales[i];
      const male = malesInBucket[i];
      const maleIndex = bucket.students.findIndex(s => s.studentId === male.studentId);
      bucket.students.splice(maleIndex, 1);
      bucket.maleCount--;
      const originalMale = studentsWithScores.find(s => s.studentId === male.studentId);
      originalMale.placed = false;
      originalMale.assignedDepartment = null;

      bucket.students.push(female);
      bucket.femaleCount++;
      female.placed = true;
      female.assignedDepartment = bucketName;
    }
  });
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
        $unset: { assignedDepartment: 1, assignedSubStream: 1, totalScore: 1 },
        $set: { placementStage: 'admitted' }
      }
    );
    res.status(200).json({ message: 'All placements cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing placements', error: error.message });
  }
};
