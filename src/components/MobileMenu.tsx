"use client";

import React, { useState } from "react";
import Link from "next/link";
import LoginNavButton from "./LoginNavButton";
import PortalNavButton from "./PortalNavButton";

interface MobileMenuProps {
  locale: string;
  isRTL: boolean;
}

export default function MobileMenu({ locale, isRTL }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  const menuItems = [
    { href: `/${locale}`, label: locale === 'ar-SA' ? 'الرئيسية' : 'Home' },
    { href: `/${locale}/about_us`, label: locale === 'ar-SA' ? 'من نحن' : 'About Us' },
    { href: `/${locale}/academic-program`, label: locale === 'ar-SA' ? 'البرنامج الأكاديمي' : 'Academic Program' },
    { href: `/${locale}/admissions`, label: locale === 'ar-SA' ? 'القبول والتسجيل' : 'Admissions' },
    { href: `/${locale}/gallery`, label: locale === 'ar-SA' ? 'المعرض' : 'Gallery' },
    { href: `/${locale}/careers`, label: locale === 'ar-SA' ? 'الوظائف' : 'Careers' },
    { href: `/${locale}/contact`, label: locale === 'ar-SA' ? 'اتصل بنا' : 'Contact Us' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="mobile-menu-button"
        aria-label={locale === 'ar-SA' ? 'فتح القائمة' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <div className={`hamburger ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Mega Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="mobile-menu-backdrop"
            onClick={closeMenu}
          />
          
          {/* Menu Content */}
          <div className={`mobile-menu-content ${isRTL ? 'rtl' : 'ltr'}`}>
            <nav className="mobile-nav">
              <ul className="mobile-nav-list">
                {menuItems.map((item, index) => (
                  <li 
                    key={item.href}
                    className="mobile-nav-item"
                    style={{ 
                      animationDelay: `${index * 0.05}s` 
                    }}
                  >
                    <Link 
                      href={item.href} 
                      className="mobile-nav-link"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                
                {/* Login/Portal Buttons */}
                <li 
                  className="mobile-nav-item mobile-nav-button"
                  style={{ 
                    animationDelay: `${menuItems.length * 0.05}s` 
                  }}
                >
                  <LoginNavButton locale={locale} />
                </li>
                <li 
                  className="mobile-nav-item mobile-nav-button"
                  style={{ 
                    animationDelay: `${(menuItems.length + 1) * 0.05}s` 
                  }}
                >
                  <PortalNavButton locale={locale} />
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
