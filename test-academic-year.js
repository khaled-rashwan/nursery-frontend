// Test the academic year utility functions

/**
 * Get the current academic year based on current date
 * @returns string in format "YYYY-YYYY" (e.g., "2025-2026")
 */
function getCurrentAcademicYear() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  const currentYear = now.getFullYear();

  // If we're in August or later (months 8-12), the academic year starts this year
  // If we're in January-July (months 1-7), the academic year started last year
  const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const endYear = startYear + 1;

  return `${startYear}-${endYear}`;
}

/**
 * Generate a list of academic years (current and surrounding years)
 * @param yearsBack Number of years before current to include (default: 2)
 * @param yearsForward Number of years after current to include (default: 1)
 * @returns Array of academic year strings
 */
function generateAcademicYears(yearsBack = 2, yearsForward = 1) {
  const currentAcademicYear = getCurrentAcademicYear();
  const currentStartYear = parseInt(currentAcademicYear.split('-')[0]);
  
  const years = [];
  
  // Add previous years
  for (let i = yearsBack; i > 0; i--) {
    const startYear = currentStartYear - i;
    years.push(`${startYear}-${startYear + 1}`);
  }
  
  // Add current year
  years.push(currentAcademicYear);
  
  // Add future years
  for (let i = 1; i <= yearsForward; i++) {
    const startYear = currentStartYear + i;
    years.push(`${startYear}-${startYear + 1}`);
  }
  
  return years;
}

/**
 * Get academic year from a specific date
 * @param date Date object or date string
 * @returns Academic year string
 */
function getAcademicYearFromDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

console.log('=== Academic Year Utility Test ===');
console.log('Current date:', new Date().toISOString().split('T')[0]);
console.log('Current academic year:', getCurrentAcademicYear());
console.log('Generated academic years:', generateAcademicYears(2, 1));

// Test specific dates
const testDates = [
  '2025-07-31', // July 31, 2025 - should be 2024-2025
  '2025-08-01', // August 1, 2025 - should be 2025-2026
  '2026-07-31', // July 31, 2026 - should be 2025-2026
  '2026-08-01', // August 1, 2026 - should be 2026-2027
];

console.log('\n=== Date Test Cases ===');
testDates.forEach(date => {
  const academicYear = getAcademicYearFromDate(new Date(date));
  console.log(`${date} -> ${academicYear}`);
});

console.log('\n=== Current Date Academic Year ===');
console.log(`Today (${new Date().toISOString().split('T')[0]}) -> ${getCurrentAcademicYear()}`);
