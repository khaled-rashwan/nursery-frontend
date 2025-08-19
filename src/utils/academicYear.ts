/**
 * Academic Year Utility Functions
 * 
 * Academic year runs from August to July:
 * - August 2025 to July 2026 = "2025-2026"
 * - August 2026 to July 2027 = "2026-2027"
 */

/**
 * Get the current academic year based on current date
 * @returns string in format "YYYY-YYYY" (e.g., "2025-2026")
 */
export function getCurrentAcademicYear(): string {
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
export function generateAcademicYears(yearsBack: number = 2, yearsForward: number = 1): string[] {
  const currentAcademicYear = getCurrentAcademicYear();
  const currentStartYear = parseInt(currentAcademicYear.split('-')[0]);
  
  const years: string[] = [];
  
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
 * Check if a given academic year is the current academic year
 * @param academicYear Academic year string (e.g., "2025-2026")
 * @returns boolean
 */
export function isCurrentAcademicYear(academicYear: string): boolean {
  return academicYear === getCurrentAcademicYear();
}

/**
 * Format academic year for display
 * @param academicYear Academic year string (e.g., "2025-2026")
 * @param locale Locale for formatting (default: "en-US")
 * @returns Formatted academic year string
 */
export function formatAcademicYear(academicYear: string, locale: string = "en-US"): string {
  if (locale === 'ar-SA') {
    return `العام الدراسي ${academicYear}`;
  }
  return `Academic Year ${academicYear}`;
}

/**
 * Parse academic year string and get start/end years as numbers
 * @param academicYear Academic year string (e.g., "2025-2026")
 * @returns Object with startYear and endYear as numbers
 */
export function parseAcademicYear(academicYear: string): { startYear: number; endYear: number } {
  const [startYear, endYear] = academicYear.split('-').map(year => parseInt(year));
  return { startYear, endYear };
}

/**
 * Get academic year from a specific date
 * @param date Date object or date string
 * @returns Academic year string
 */
export function getAcademicYearFromDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  
  const startYear = month >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}
