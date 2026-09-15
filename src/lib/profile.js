export const PROFILE_STORAGE_KEY = 'learnivo_student_profile';

export const DEFAULT_AVATARS = [
  { id: 1, src: '/assets/images/avatar-1.png', alt: 'Male Hoodie Avatar' },
  { id: 2, src: '/assets/images/avatar-2.png', alt: 'Female Ponytail Avatar' },
  { id: 3, src: '/assets/images/avatar-3.png', alt: 'Male Glasses Avatar' },
  { id: 4, src: '/assets/images/avatar-4.png', alt: 'Female Braids Avatar' },
  { id: 5, src: '/assets/images/avatar-5.png', alt: 'Male Cap Avatar' },
  { id: 6, src: '/assets/images/avatar-6.png', alt: 'Female Cardigan Avatar' }
];

export const DEFAULT_COURSES = [
  {
    name: 'Mathematics',
    code: 'MAT101',
    units: [
      { name: 'Matrices & Determinants', topics: ['Types of Matrices', 'Matrix Operations', 'Determinants', 'Inverse Matrix'] },
      { name: 'Differential Calculus', topics: ['Limits Intro', 'Derivatives Rules', 'Chain Rule', 'Implicit Differentiation'] },
      { name: 'Integral Calculus', topics: ['Indefinite Integrals', 'Definite Integrals', 'Integration by Parts'] },
      { name: 'Vector Algebra', topics: ['Vector Operations', 'Dot Product', 'Cross Product'] },
      { name: 'Linear Systems', topics: ['2x2 Linear Systems', 'Gaussian Elimination', 'Cramer Rule'] }
    ]
  },
  {
    name: 'Physics',
    code: 'PHY101',
    units: [
      { name: 'Mechanics', topics: ['Kinematics', 'Newton Laws of Motion', 'Work & Energy', 'Momentum'] },
      { name: 'Thermodynamics', topics: ['Thermal Expansion', 'Heat Capacity', 'First Law of Thermodynamics'] },
      { name: 'Waves & Oscillations', topics: ['Simple Harmonic Motion', 'Sound Waves', 'Wave Interference'] },
      { name: 'Electromagnetism', topics: ['Electric Field', 'Gauss Law', 'Magnetic Force'] }
    ]
  },
  {
    name: 'Chemistry',
    code: 'CHM101',
    units: [
      { name: 'Atomic Structure', topics: ['Bohr Model', 'Quantum Numbers', 'Electron Configuration'] },
      { name: 'Chemical Bonding', topics: ['Ionic Bonds', 'Covalent Bonds', 'VSEPR Theory'] },
      { name: 'Thermodynamics & Kinetics', topics: ['Enthalpy', 'Rate Laws', 'Chemical Equilibrium'] }
    ]
  }
];

export function getStoredStudent() {
  if (typeof window === 'undefined') {
    return {
      id: 'S001',
      name: 'Alex Morgan',
      grade: 'Grade 11',
      avatar: '/assets/images/avatar-1.png',
      completedOnboarding: true,
      courses: DEFAULT_COURSES
    };
  }

  try {
    let raw = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem('learnivo_student');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.avatar) parsed.avatar = '/assets/images/avatar-1.png';
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored profile, using defaults:', e);
  }

  return {
    id: 'S001',
    name: 'Alex Morgan',
    grade: 'Grade 11',
    avatar: '/assets/images/avatar-1.png',
    completedOnboarding: true,
    courses: DEFAULT_COURSES,
    xp: 1240,
    streak: 12,
    accuracy: '78%',
    questionsSolved: 142,
    modulesCompleted: 18
  };
}

export function saveStoredStudent(profile) {
  if (typeof window === 'undefined' || !profile) return;
  try {
    const jsonStr = JSON.stringify(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, jsonStr);
    localStorage.setItem('learnivo_student', jsonStr);
  } catch (e) {
    console.error('Failed to save student profile:', e);
  }
}
