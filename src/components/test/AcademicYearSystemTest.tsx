/**
 * Test the Academic Year Context System
 * 
 * This is a simple test component to verify that the context and components work correctly
 */

import React from 'react';
import { AcademicYearProvider, AcademicYearSelector, useAcademicYear } from '../../components/academic-year';

// Test component that uses the context
function TestContextConsumer() {
  const { selectedAcademicYear, isCurrentYear, getCurrentYear } = useAcademicYear();
  
  return (
    <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '8px', margin: '1rem 0' }}>
      <h3>Context Values:</h3>
      <p><strong>Selected Year:</strong> {selectedAcademicYear}</p>
      <p><strong>Is Current Year:</strong> {isCurrentYear ? 'Yes' : 'No'}</p>
      <p><strong>Current Year:</strong> {getCurrentYear()}</p>
    </div>
  );
}

// Main test component
export function AcademicYearSystemTest() {
  return (
    <AcademicYearProvider>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Academic Year System Test</h1>
        
        <h2>1. Default Selector</h2>
        <AcademicYearSelector locale="en-US" />
        
        <h2>2. Compact Selector</h2>
        <AcademicYearSelector variant="compact" locale="en-US" />
        
        <h2>3. Minimal Selector</h2>
        <AcademicYearSelector variant="minimal" locale="en-US" />
        
        <h2>4. Arabic Locale</h2>
        <AcademicYearSelector locale="ar-SA" />
        
        <h2>5. Context Consumer</h2>
        <TestContextConsumer />
      </div>
    </AcademicYearProvider>
  );
}

export default AcademicYearSystemTest;
