"use client";
import React from "react";
import { usePathname } from "next/navigation";

const locales = [
  { code: "en-US", label: "English" },
  { code: "ar-SA", label: "العربية" }
];

export default function LanguageSwitcher({ currentLocale, isRTL }: { currentLocale: string; isRTL: boolean }) {
  const pathname = usePathname();
  // Only show the opposite language button
  const otherLocale = currentLocale === "ar-SA" ? locales[0] : locales[1];
  let newPath = pathname.replace(new RegExp(`^/(${locales.map(l => l.code).join('|')})`), `/${otherLocale.code}`);
  if (!newPath.startsWith(`/${otherLocale.code}`)) {
    newPath = `/${otherLocale.code}`;
  }
  return (
    <a
      href={newPath}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: '#eee',
        color: '#222',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.2em',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginLeft: isRTL ? 0 : 8,
        marginRight: isRTL ? 8 : 0,
      }}
      aria-label={otherLocale.code === 'en-US' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {otherLocale.code === 'en-US' ? 'E' : 'ع'}
    </a>
  );
}
