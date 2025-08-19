"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const locales = [
  { code: "en-US", label: "English", flag: "", shortLabel: "EN" },
  { code: "ar-SA", label: "العربية", flag: "", shortLabel: "عربي" }
];

export default function LanguageSwitcher({ currentLocale, isRTL }: { currentLocale: string; isRTL: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  if (!pathname) return null;
  
  // Only show the opposite language button
  const otherLocale = currentLocale === "ar-SA" ? locales[0] : locales[1];
  const currentLocaleData = currentLocale === "ar-SA" ? locales[1] : locales[0];
  
  let newPath = pathname.replace(new RegExp(`^/(${locales.map(l => l.code).join('|')})`), `/${otherLocale.code}`);
  if (!newPath.startsWith(`/${otherLocale.code}`)) {
    newPath = `/${otherLocale.code}`;
  }

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      {/* Enhanced Language Switcher Button */}
      <a
        href={newPath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          minWidth: '70px',
          height: '42px',
          borderRadius: '25px',
          background: isHovered 
            ? 'linear-gradient(135deg, var(--primary-yellow), var(--primary-orange))' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
          color: isHovered ? 'var(--primary-purple)' : 'var(--primary-blue)',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          boxShadow: isHovered 
            ? '0 8px 25px rgba(0,0,0,0.2)' 
            : '0 4px 15px rgba(0,0,0,0.1)',
          border: `3px solid ${isHovered ? 'var(--primary-pink)' : 'var(--primary-blue)'}`,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transform: isHovered ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
          marginLeft: isRTL ? 0 : 8,
          marginRight: isRTL ? 8 : 0,
          padding: '0 1rem',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-label={otherLocale.code === 'en-US' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        {/* Animated Background Effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '0%' : '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transition: 'left 0.6s ease-in-out',
          pointerEvents: 'none'
        }} />
        
        {/* Flag Icon */}
        <span style={{
          fontSize: '1.2rem',
          animation: isHovered ? 'bounce 0.6s ease-in-out' : 'none',
          filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
          transition: 'filter 0.3s ease'
        }}>
          {otherLocale.flag}
        </span>
        
        {/* Language Code */}
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {otherLocale.shortLabel}
        </span>
      </a>

      {/* Enhanced Tooltip */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--primary-purple)',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '15px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'fadeInUp 0.3s ease-out',
          border: '2px solid var(--primary-yellow)'
        }}>
          {/* Tooltip Arrow */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid var(--primary-purple)'
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{otherLocale.flag}</span>
            <span>
              {otherLocale.code === 'en-US' 
                ? 'Switch to English' 
                : 'التبديل إلى العربية'
              }
            </span>
          </div>
        </div>
      )}

      {/* Current Language Indicator */}
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: isRTL ? 'auto' : '-5px',
        left: isRTL ? '-5px' : 'auto',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary-green), var(--primary-blue))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        border: '2px solid white',
        fontSize: '0.7rem'
      }}>
        {currentLocaleData.flag}
      </div>

      {/* Floating Particles Effect */}
      {isHovered && (
        <>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--primary-pink)',
            animation: 'float 2s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: 'var(--primary-yellow)',
            animation: 'float 2s ease-in-out infinite 0.5s'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '20px',
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'var(--primary-blue)',
            animation: 'float 2s ease-in-out infinite 1s'
          }} />
        </>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.2);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-4px) scale(1.1);
          }
          60% {
            transform: translateY(-2px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
