/**
 * Academic Year Context Provider
 * 
 * Provides global state management for academic year selection across all portals.
 * This context allows any component to:
 * - Get the currently selected academic year
 * - Change the selected academic year
 * - Get available academic year options
 * - Check if current year is selected
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentAcademicYear, generateAcademicYears } from '../utils/academicYear';

interface AcademicYearContextType {
  // Current state
  selectedAcademicYear: string;
  availableYears: string[];
  isCurrentYear: boolean;
  
  // Actions
  setSelectedAcademicYear: (year: string) => void;
  resetToCurrentYear: () => void;
  
  // Utilities
  getCurrentYear: () => string;
  formatYear: (year: string, locale?: string) => string;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

interface AcademicYearProviderProps {
  children: ReactNode;
  defaultYearsBack?: number;
  defaultYearsForward?: number;
}

export function AcademicYearProvider({ 
  children, 
  defaultYearsBack = 3, 
  defaultYearsForward = 2 
}: AcademicYearProviderProps) {
  const currentYear = getCurrentAcademicYear();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(currentYear);
  const [availableYears] = useState<string[]>(generateAcademicYears(defaultYearsBack, defaultYearsForward));

  console.log(`🏫 AcademicYearProvider - currentYear: ${currentYear}, selectedAcademicYear: ${selectedAcademicYear}`);

  // Check if selected year is the current year
  const isCurrentYear = selectedAcademicYear === currentYear;

  // Reset to current year
  const resetToCurrentYear = () => {
    setSelectedAcademicYear(currentYear);
  };

  // Get current year (utility)
  const getCurrentYear = () => currentYear;

  // Format year for display
  const formatYear = (year: string, locale: string = 'en-US') => {
    if (locale === 'ar-SA') {
      return `العام الدراسي ${year}`;
    }
    return year;
  };

  // Store selected year in localStorage for persistence
  useEffect(() => {
    const savedYear = localStorage.getItem('selectedAcademicYear');
    console.log(`🔄 Loading from localStorage: ${savedYear}`);
    if (savedYear && availableYears.includes(savedYear)) {
      console.log(`✅ Setting academic year from localStorage: ${savedYear}`);
      setSelectedAcademicYear(savedYear);
    }
  }, [availableYears]);

  useEffect(() => {
    console.log(`💾 Saving to localStorage: ${selectedAcademicYear}`);
    localStorage.setItem('selectedAcademicYear', selectedAcademicYear);
  }, [selectedAcademicYear]);

  const value: AcademicYearContextType = {
    selectedAcademicYear,
    availableYears,
    isCurrentYear,
    setSelectedAcademicYear: (year: string) => {
      console.log(`🎯 AcademicYearContext: setSelectedAcademicYear called with: ${year}`);
      console.log(`🎯 Previous value was: ${selectedAcademicYear}`);
      setSelectedAcademicYear(year);
    },
    resetToCurrentYear,
    getCurrentYear,
    formatYear
  };

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
}

/**
 * Hook to use academic year context
 * Must be used within AcademicYearProvider
 */
export function useAcademicYear(): AcademicYearContextType {
  const context = useContext(AcademicYearContext);
  if (context === undefined) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
}

/**
 * HOC to wrap components with academic year context
 */
export function withAcademicYear<T extends object>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <AcademicYearProvider>
        <Component {...props} />
      </AcademicYearProvider>
    );
  };
}
