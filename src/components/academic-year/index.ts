/**
 * Academic Year System Exports
 * 
 * Centralized exports for the academic year system components and utilities
 */

// Context and Hooks
export { AcademicYearProvider, useAcademicYear, withAcademicYear } from '../../contexts/AcademicYearContext';

// Components
export { 
  AcademicYearSelector, 
  CompactAcademicYearSelector, 
  MinimalAcademicYearSelector 
} from '../common/AcademicYearSelector';

// Utilities
export {
  getCurrentAcademicYear,
  generateAcademicYears,
  isCurrentAcademicYear,
  formatAcademicYear,
  parseAcademicYear,
  getAcademicYearFromDate
} from '../../utils/academicYear';

// Types
export interface AcademicYearContextType {
  selectedAcademicYear: string;
  availableYears: string[];
  isCurrentYear: boolean;
  setSelectedAcademicYear: (year: string) => void;
  resetToCurrentYear: () => void;
  getCurrentYear: () => string;
  formatYear: (year: string, locale?: string) => string;
}
