const EMERGING = new Set(['Afar','Benishangul-Gumuz','Gambella','Somali']);
export const CONFIG = {
  finalDepartments: new Set(['Medicine','Pharmacy','Computer Science','IT','Law']),
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
        'Computational Science': ['Biology','Chemistry','Mathematics','Physics','Sports Science','Statistics'],
        'Other Health':            ['Anesthesia','Nursing','Midwifery'],
        Agriculture:               ['Animal Science','Plant Science']
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
export function computeBonus({ gender, disabled, region }) {
  let b = 0;
  if (gender === 'female') b += 5;
  if (disabled)         b += 5;
  if (gender === 'female' && EMERGING.has(region)) b += 10;
  if (disabled && EMERGING.has(region))         b += 10;
  return b;
}

/** Compute total score: GPA(50%) + entrance(20%) + bonus */
export function computeTotal({ gpa, entranceScore, entranceMax, bonus }) {
  const gpaScore  = (gpa / 4) * 50;
  const examScore = (entranceScore / entranceMax) * 20;
  return gpaScore + examScore + bonus;
}

/** Determine placement for one student */
export function runPlacement(student) {
  const bonus = computeBonus(student);
  student.bonusPoints = bonus;

  if (student.semester1GPA == null) {
    return { placed: false, reason: 'Waiting Sem1 GPA' };
  }

  // Phase 1: direct final department
  if (CONFIG.finalDepartments.has(student.initialPreference)) {
    const score = computeTotal({
      gpa: student.semester1GPA,
      entranceScore: student.entranceScore,
      entranceMax: student.entranceMax,
      bonus
    });
    return { placed: true, stage: 'after-sem1', department: student.initialPreference, score };
  }

  // Phase 2: stream students need Sem2 and preferences
  if (student.semester2GPA == null || !student.secondPreference || !student.preferences?.length) {
    return { placed: false, reason: 'Waiting Sem2 data or preferences' };
  }

  const cfg = CONFIG.streams[student.initialPreference];
  if (!cfg) return { placed: false, reason: 'Invalid initial stream' };

  let finalList;
  if (cfg.nextStep === 'final') {
    finalList = cfg.departments;
  } else {
    finalList = cfg.sub[student.secondPreference] || [];
  }

  const chosen = student.preferences.find(d => finalList.includes(d));
  if (!chosen) return { placed: false, reason: 'No matching preference' };

  const cumGPA = (student.semester1GPA + student.semester2GPA) / 2;
  const score = computeTotal({
    gpa: cumGPA,
    entranceScore: student.entranceScore,
    entranceMax: student.entranceMax,
    bonus
  });

  return { placed: true, stage: 'after-sem2', department: chosen, score };
}
