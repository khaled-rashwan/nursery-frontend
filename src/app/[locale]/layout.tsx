
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
// Temporarily commented out Google Fonts due to network restrictions
// import { Geist, Geist_Mono } from "next/font/google";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import FirebaseLogoutButton from "../../components/FirebaseLogoutButton";
import LoginNavButton from "../../components/LoginNavButton";
import Link from 'next/link';
import Image from 'next/image';
import PortalNavButton from '../../components/PortalNavButton';
import { fetchFooterContent } from '../fetchContent';
import '../globals.css';

// Temporarily commented out Google Fonts
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

function Header({locale, isRTL}: {locale: string; isRTL: boolean}) {
  return (
    <header className="kindergarten-header">
      <div className="header-content">
        <Link href={`/${locale}`} className="logo" style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <Image
            src={locale === 'ar-SA' ? '/ar-SA_logo.png' : '/en-US_logo.png'}
            alt="Future Step Nursery Logo"
            width={240}
            height={97}
            style={{
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
        </Link>
        
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link href={`/${locale}`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/about_us`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'من نحن' : 'About Us'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/academic-program`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'البرنامج الأكاديمي' : 'Academic Program'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/admissions`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'القبول والتسجيل' : 'Admissions'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/gallery`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'المعرض' : 'Gallery'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/careers`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'الوظائف' : 'Careers'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/contact`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'اتصل بنا' : 'Contact Us'}
              </Link>
            </li>
            {/* Login nav item, only visible if not logged in */}
            <li className="nav-item">
              <LoginNavButton locale={locale} />
            </li>
            {/* Portal nav item, only visible if logged in */}
            <li className="nav-item">
              <PortalNavButton locale={locale} />
            </li>
          </ul>
        </nav>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FirebaseLogoutButton locale={locale} />
          <div className="language-switcher">
            <LanguageSwitcher currentLocale={locale} isRTL={isRTL} />
          </div>
        </div>
      </div>
    </header>
  );
}

async function Footer({locale}: {locale: string}) {
  const footerContent = await fetchFooterContent(locale);
  
  // Fallback to hardcoded content if fetch fails
  const fallbackContent = {
    sections: [
      {
        icon: "📍",
        title: locale === 'ar-SA' ? 'العنوان' : 'Address',
        content: locale === 'ar-SA' ? 'مدينة الخبر – المنطقة الشرقية' : 'Al Khobar – Eastern Province'
      },
      {
        icon: "📞", 
        title: locale === 'ar-SA' ? 'هاتف، واتساب' : 'Phone & WhatsApp',
        content: '920016074'
      },
      {
        icon: "✉️",
        title: locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email', 
        content: 'info@futurestep.edu.sa'
      },
      {
        icon: "🕐",
        title: locale === 'ar-SA' ? 'ساعات العمل' : 'Hours',
        content: locale === 'ar-SA' ? 'الأحد - الخميس: 7:30 ص - 2:00 م' : 'Sunday to Thursday: 7:30 AM to 2:00 PM'
      }
    ],
    copyright: locale === 'ar-SA' ? '© 2025 روضة المستقبل. جميع الحقوق محفوظة. تم الإنشاء بواسطة Njaz.org' : '© 2025 Future Step Kindergarten. All rights reserved. Created by Njaz.org'
  };

  const content = footerContent || fallbackContent;

  return (
    <footer className="kindergarten-footer">
      <div className="footer-content">
        {content.sections.map((section, index) => (
          <div key={index} className="footer-section">
            <h3>{section.icon} {section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
      
      <div className="footer-bottom">
        <p>
          <Link href={`/${locale}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {content.copyright}
          </Link>
        </p>
      </div>
    </footer>
  );
}
 
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  // Providing all messages to the client side is the easiest way to get started
  const messages = await getMessages();
  const isRTL = locale.startsWith('ar');
  
  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body className="antialiased" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Header locale={locale} isRTL={isRTL} />
        
        <main className="main-content">
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </main>
        
        <Footer locale={locale} />
      </body>
    </html>
  );
}