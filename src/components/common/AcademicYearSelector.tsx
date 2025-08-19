/**
 * Academic Year Selector Component
 * 
 * A reusable component that displays the academic year selector UI.
 * Can be used across all portals (Admin, Teacher, Parent) for consistent UX.
 */

'use client';

import React from 'react';
import { useAcademicYear } from '../../contexts/AcademicYearContext';

interface AcademicYearSelectorProps {
  locale?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showCurrentBadge?: boolean;
  showResetButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AcademicYearSelector({
  locale = 'en-US',
  variant = 'default',
  showCurrentBadge = true,
  showResetButton = true,
  className = '',
  style = {}
}: AcademicYearSelectorProps) {
  const {
    selectedAcademicYear,
    availableYears,
    isCurrentYear,
    setSelectedAcademicYear,
    resetToCurrentYear,
    getCurrentYear
  } = useAcademicYear();

  const currentYear = getCurrentYear();

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    };

    switch (variant) {
      case 'compact':
        return {
          ...baseStyles,
          padding: '0.5rem',
          gap: '0.5rem',
          fontSize: '0.9rem'
        };
      case 'minimal':
        return {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem',
          background: 'transparent',
          border: 'none'
        };
      default:
        return baseStyles;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div 
      className={`academic-year-selector ${className}`}
      style={{ ...variantStyles, ...style }}
    >
      {/* Label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 'bold',
        color: '#2c3e50',
        fontSize: variant === 'minimal' ? '0.9rem' : '1rem'
      }}>
        📅 {locale === 'ar-SA' ? 'العام الدراسي:' : 'Academic Year:'}
      </div>

      {/* Year Selector */}
      <select
        value={selectedAcademicYear}
        onChange={(e) => {
          console.log(`📅 AcademicYearSelector: changing from ${selectedAcademicYear} to ${e.target.value}`);
          setSelectedAcademicYear(e.target.value);
        }}
        style={{
          padding: variant === 'minimal' ? '0.25rem 0.5rem' : '0.5rem 1rem',
          border: '2px solid #3498db',
          borderRadius: '6px',
          fontSize: variant === 'minimal' ? '0.9rem' : '1rem',
          fontWeight: 'bold',
          background: 'white',
          color: '#2c3e50',
          minWidth: variant === 'minimal' ? '120px' : '150px',
          cursor: 'pointer'
        }}
      >
        {availableYears.map(year => (
          <option key={year} value={year}>
            {year} {year === currentYear && showCurrentBadge ? 
              (locale === 'ar-SA' ? '(الحالي)' : '(Current)') : ''}
          </option>
        ))}
      </select>

      {/* Current Year Badge (when not current) */}
      {!isCurrentYear && showCurrentBadge && variant !== 'minimal' && (
        <div style={{
          fontSize: '0.8rem',
          color: '#e67e22',
          padding: '0.25rem 0.5rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          ⚠️ {locale === 'ar-SA' ? 
            `الحالي: ${currentYear}` : 
            `Current: ${currentYear}`}
        </div>
      )}

      {/* Reset Button */}
      {!isCurrentYear && showResetButton && (
        <button
          onClick={resetToCurrentYear}
          style={{
            padding: variant === 'minimal' ? '0.25rem 0.5rem' : '0.5rem 1rem',
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: variant === 'minimal' ? '0.8rem' : '0.9rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(39, 174, 96, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🔄 {locale === 'ar-SA' ? 'الحالي' : 'Current'}
        </button>
      )}

      {/* Info Text */}
      {variant === 'default' && (
        <div style={{
          fontSize: '0.8rem',
          color: '#7f8c8d',
          padding: '0.25rem 0.5rem',
          background: isCurrentYear ? '#e8f5e8' : '#fff3cd',
          border: `1px solid ${isCurrentYear ? '#4caf50' : '#ffc107'}`,
          borderRadius: '4px',
          fontStyle: 'italic'
        }}>
          {isCurrentYear ? (
            <>
              ✅ {locale === 'ar-SA' ? 'العام الحالي' : 'Current Year'}
            </>
          ) : (
            <>
              📚 {locale === 'ar-SA' ? 'عرض تاريخي' : 'Historical View'}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact Academic Year Selector for headers
 */
export function CompactAcademicYearSelector(props: Omit<AcademicYearSelectorProps, 'variant'>) {
  return <AcademicYearSelector {...props} variant="compact" />;
}

/**
 * Minimal Academic Year Selector for inline use
 */
export function MinimalAcademicYearSelector(props: Omit<AcademicYearSelectorProps, 'variant'>) {
  return <AcademicYearSelector {...props} variant="minimal" showCurrentBadge={false} showResetButton={false} />;
}
