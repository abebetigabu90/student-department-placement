const EMERGING = new Set(['Afar','Benishangul-Gumuz','Gambella','Somali']);

// Configuration for streams and departments
export const CONFIG = {
  // Final departments that can be chosen directly in Semester 1
  finalDepartments: new Set(['Medicine','Pharmacy','Computer Science','IT','Law']),
  
  // Semester 1 streams and their Semester 2 final departments
  streams: {
    'Engineering': {
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
        'Computational Science': ['Biology','Chemistry','Mathematics','Physics','Sports Science','Statistics'],
        'Other Health': ['Anesthesia','Nursing','Midwifery'],
        'Agriculture and Statistics': ['Animal Science','Plant Science','Agro-economics','Statistics']
      }
    },
    'Other Social Science': {
      nextStep: 'sub',
      sub: {
        'FBE': ['Accounting & Finance','Economics','Management','Tourism & Hotel Management'],
        'Social Science & Humanities': [
          'Geography & Environmental Studies','Sociology','Psychology','Civics',
          'Early Childhood','Special Needs','English & Amharic Literature',
          'History & Heritage','Theatre Arts'
        ]
      }
    }
  }
};

/** Compute bonus points based on gender, disability, and region */
export function computeBonus({ gender, disability, disabilityVerified, region }) {
  let bonus = 0;
  
  // Female bonus: +5 points
  if (gender === 'Female') {
    bonus += 5;
  }
  
  // Disability bonus: +5 points
  if (disability && disability !== 'None' && disabilityVerified) {
    bonus += 5;
  }
  
  // Emerging region bonus: +5 points
  if (EMERGING.has(region)) {
    bonus += 5;
  }
  
  return bonus;
}

/** Compute total score: GPA/CGPA(50%) + entrance(20%) + bonus */
export function computeTotal({ gpa, entranceScore, entranceMax, bonus }) {
  const gpaScore = (gpa / 4.0) * 50;
  const examScore = (entranceScore / entranceMax) * 20;
  return Math.round((gpaScore + examScore + bonus) * 100) / 100;
}

/** Determine if a student can be placed in Semester 1 */
export function canPlaceSemester1(student) {
  return student.semester1GPA != null && student.preferences && student.preferences.length > 0;
}

/** Determine if a student can be placed in Semester 2 */
export function canPlaceSemester2(student) {
  return student.semester2GPA != null && student.cgpa != null && student.preferences && student.preferences.length > 0;
}

/** Get available departments for a student based on their stream */
export function getAvailableDepartments(student, placementStage) {
  if (placementStage === 'after-sem1') {
    // For Semester 1, return all possible choices
    if (student.preferences && student.preferences.length > 0) {
      return student.preferences;
    }
    return [];
  }
  
  if (placementStage === 'after-sem2') {
    // For Semester 2, need to determine based on their Semester 1 choice
    if (!student.preferences || student.preferences.length === 0) {
      return [];
    }
    
    const semester1Choice = student.preferences[0]; // Their first choice from Semester 1
    
    // If they chose a final department in Semester 1, they're already placed
    if (CONFIG.finalDepartments.has(semester1Choice)) {
      return [];
    }
    
    // If they chose a stream, get the available departments for that stream
    const streamConfig = CONFIG.streams[semester1Choice];
    if (!streamConfig) {
      return [];
    }
    
    if (streamConfig.nextStep === 'final') {
      return streamConfig.departments;
    } else {
      // For sub-streams, we need to know which sub-stream they chose
      // This would be stored in their preferences or we need to determine it
      // For now, return all possible departments from all sub-streams
      const allDepartments = [];
      Object.values(streamConfig.sub).forEach(departments => {
        allDepartments.push(...departments);
      });
      return allDepartments;
    }
  }
  
  return [];
}

/** Validate preferences for a student */
export function validatePreferences(student, placementStage) {
  if (!student.preferences || student.preferences.length === 0) {
    return { valid: false, reason: 'No preferences provided' };
  }
  
  if (placementStage === 'after-sem1') {
    // For Semester 1, validate against all possible choices
    const allChoices = [
      'Medicine', 'Pharmacy', 'Computer Science', 'IT', 'Law',
      'Engineering', 'Other Health', 'Agriculture and Statistics', 'Other Natural Science',
      'Other Social Science'
    ];
    
    const invalidPreferences = student.preferences.filter(pref => 
      !allChoices.includes(pref)
    );
    
    if (invalidPreferences.length > 0) {
      return { valid: false, reason: `Invalid preferences: ${invalidPreferences.join(', ')}` };
    }
  }
  
  if (placementStage === 'after-sem2') {
    // For Semester 2, validate against available departments for their stream
    const availableDepartments = getAvailableDepartments(student, placementStage);
    const invalidPreferences = student.preferences.filter(pref => 
      !availableDepartments.includes(pref)
    );
    
    if (invalidPreferences.length > 0) {
      return { valid: false, reason: `Invalid preferences for your stream: ${invalidPreferences.join(', ')}` };
    }
  }
  
  return { valid: true };
}
