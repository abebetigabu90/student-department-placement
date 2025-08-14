const EMERGING = new Set(['Afar', 'Benishangul-Gumuz', 'Gambella', 'Somali']);

// Configuration for streams and departments
export const CONFIG = {
  // Final departments that can be chosen directly in Semester 1
  finalDepartments: new Set(['Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law']),
  
  // Semester 1 streams and their Semester 2 final departments
  streams: {
    Engineering: {
      nextStep: 'final',
      departments: [
        'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
        'Chemical Engineering', 'Computer Engineering', 'Hydraulic Engineering',
        'Water Resource Engineering'
      ]
    },
    'Other Natural Science': {
      nextStep: 'sub',
      sub: {
        'Computational Science': ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Sports Science', 'Statistics'],
        'Other Health': ['Anesthesia', 'Nursing', 'Midwifery'],
        'Agriculture and Statistics': ['Animal Science', 'Plant Science', 'Agro-economics', 'Statistics']
      }
    },
    'Other Social Science': {
      nextStep: 'sub',
      sub: {
        FBE: ['Accounting & Finance', 'Economics', 'Management', 'Tourism & Hotel Management'],
        'Social Science & Humanities': [
          'Geography & Environmental Studies', 'Sociology', 'Psychology', 'Civics',
          'Early Childhood', 'Special Needs', 'English & Amharic Literature',
          'History & Heritage', 'Theatre Arts'
        ]
      }
    }
  }
};

/** Compute bonus points based on gender, disability, and region */
export function computeBonus({ gender, disability, disabilityVerified, region }) {
  return (
    (gender === 'Female' ? 5 : 0) +
    (disability && disability !== 'None' && disabilityVerified ? 5 : 0) +
    (EMERGING.has(region) ? 5 : 0)
  );
}

/** Compute total score: GPA/CGPA(50%) + entrance(20%) + bonus */
export function computeTotal({ gpa, entranceScore, entranceMax, bonus }) {
  const gpaScore = (gpa / 4.0) * 50;
  const examScore = (entranceScore / entranceMax) * 20;
  return Math.round((gpaScore + examScore + bonus) * 100) / 100;
}

/** Determine if a student can be placed in Semester 1 (uses GPA) */
export function canPlaceSemester1(student) {
  return (
    student.gpa != null &&
    Array.isArray(student.preferences) &&
    student.preferences.length > 0
  );
}

/** Determine if a student can be placed in Semester 2 (uses CGPA) */
export function canPlaceSemester2(student) {
  return (
    student.cgpa != null &&
    Array.isArray(student.preferences) &&
    student.preferences.length > 0
  );
}

/** Get available departments for a student based on their stream */
export function getAvailableDepartments(student, placementStage) {
  if (placementStage === 'after-sem1') {
    return Array.isArray(student.preferences) && student.preferences.length > 0
      ? student.preferences
      : [];
  }
  if (placementStage !== 'after-sem2') return [];
  if (!Array.isArray(student.preferences) || student.preferences.length === 0) return [];
  const semester1Choice = student.preferences[0];
  if (CONFIG.finalDepartments.has(semester1Choice)) return [];
  const streamConfig = CONFIG.streams[semester1Choice];
  if (!streamConfig) return [];
  if (streamConfig.nextStep === 'final') return streamConfig.departments;
  const allDepartments = [];
  Object.values(streamConfig.sub).forEach(depts => allDepartments.push(...depts));
  return allDepartments;
}

/** Validate preferences for a student */
export function validatePreferences(student, placementStage) {
  if (!Array.isArray(student.preferences) || student.preferences.length === 0) {
    return { valid: false, reason: 'No preferences provided' };
  }
  if (placementStage === 'after-sem1') {
    const allChoices = [
      'Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law',
      'Engineering', 'Other Health', 'Agriculture and Statistics', 'Other Natural Science',
      'Other Social Science'
    ];
    const invalid = student.preferences.filter(pref => !allChoices.includes(pref));
    if (invalid.length > 0) {
      return { valid: false, reason: `Invalid preferences: ${invalid.join(', ')}` };
    }
  }
  if (placementStage === 'after-sem2') {
    const available = getAvailableDepartments(student, placementStage);
    const invalid = student.preferences.filter(pref => !available.includes(pref));
    if (invalid.length > 0) {
      return { valid: false, reason: `Invalid preferences for your stream: ${invalid.join(', ')}` };
    }
  }
  return { valid: true };
}
