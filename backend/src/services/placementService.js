const EMERGING = new Set(['Afar', 'Benishangul-Gumuz', 'Gambella', 'Somali']);

export const CONFIG = {
  finalDepartments: new Set(['Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law']),

  streams: {
    Engineering: {
      nextStep: 'final',
      capacity: 50,
      departments: [
        'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
        'Chemical Engineering', 'Computer Engineering', 'Hydraulic Engineering',
        'Water Resource Engineering'
      ]
    },
    'Other Natural Science': {
      nextStep: 'sub',
      capacity: 60,
      sub: {
        'Computational Science': { capacity: 30, departments: ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Sports Science', 'Statistics'] },
        'Other Health': { capacity: 20, departments: ['Anesthesia', 'Nursing', 'Midwifery'] },
        'Agriculture and Statistics': { capacity: 25, departments: ['Animal Science', 'Plant Science', 'Agro-economics', 'Statistics'] }
      }
    },
    'Other Social Science': {
      nextStep: 'sub',
      capacity: 40,
      sub: {
        FBE: { capacity: 25, departments: ['Accounting & Finance', 'Economics', 'Management', 'Tourism & Hotel Management'] },
        'Social Science & Humanities': { capacity: 20, departments: ['Geography & Environmental Studies', 'Sociology', 'Psychology', 'Civics',
        'Early Childhood', 'Special Needs', 'English & Amharic Literature', 'History & Heritage', 'Theatre Arts'] }
      }
    }
  }
};

// Bonus computation
export function computeBonus({ gender, disability, disabilityVerified, region }) {
  return (gender === 'Female' ? 5 : 0) +
         (disability && disability !== 'None' && disabilityVerified ? 5 : 0) +
         (EMERGING.has(region) ? 5 : 0);
}

// Total score
export function computeTotal({ gpa, entranceScore, entranceMax, bonus }) {
  const gpaScore = (gpa / 4.0) * 50;
  const examScore = (entranceScore / entranceMax) * 20;
  return Math.round((gpaScore + examScore + bonus) * 100) / 100;
}

// Eligibility
export function canPlaceSemester1(student) {
  return student.gpa != null && Array.isArray(student.preferences) && student.preferences.length > 0;
}
export function canPlaceSemester2(student) {
  return student.cgpa != null && Array.isArray(student.preferences) && student.preferences.length > 0;
}

// Get available departments
export function getAvailableDepartments(student, placementStage) {
  if (placementStage === 'after-sem1') return student.preferences || [];
  if (placementStage !== 'after-sem2') return [];

  const sem1Choice = student.preferences[0];
  if (CONFIG.finalDepartments.has(sem1Choice)) return [];
  const streamConfig = CONFIG.streams[sem1Choice];
  if (!streamConfig) return [];

  if (streamConfig.nextStep === 'final') return streamConfig.departments;
  const allDepartments = [];
  Object.values(streamConfig.sub).forEach(sub => allDepartments.push(...sub.departments));
  return allDepartments;
}

// Validate preferences
export function validatePreferences(student, placementStage) {
  if (!Array.isArray(student.preferences) || student.preferences.length === 0) return { valid: false, reason: 'No preferences provided' };

  if (placementStage === 'after-sem1') {
    const allChoices = [...CONFIG.finalDepartments, ...Object.keys(CONFIG.streams)];
    const invalid = student.preferences.filter(pref => !allChoices.includes(pref));
    if (invalid.length > 0) return { valid: false, reason: `Invalid preferences: ${invalid.join(', ')}` };
  }
  if (placementStage === 'after-sem2') {
    const available = getAvailableDepartments(student, placementStage);
    const invalid = student.preferences.filter(pref => !available.includes(pref));
    if (invalid.length > 0) return { valid: false, reason: `Invalid preferences for your stream: ${invalid.join(', ')}` };
  }
  return { valid: true };
}
