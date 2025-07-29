
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Geist, Geist_Mono } from "next/font/google";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Link from 'next/link';
import '../globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Header({locale, isRTL}: {locale: string; isRTL: boolean}) {
  return (
    <header className="kindergarten-header">
      <div className="header-content">
        <Link href={`/${locale}`} className="logo">
          🌈 Future Nursery
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
            <li className="nav-item">
              <Link href={`/${locale}/parent-portal`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'بوابة أولياء الأمور' : 'Parent Portal'}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="language-switcher">
          <LanguageSwitcher currentLocale={locale} isRTL={isRTL} />
        </div>
      </div>
    </header>
  );
}

function Footer({locale}: {locale: string}) {
  return (
    <footer className="kindergarten-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>📍 {locale === 'ar-SA' ? 'العنوان' : 'Address'}</h3>
          <p>{locale === 'ar-SA' ? '123 شارع الأطفال، مدينة السعادة' : '123 Kids Street, Happy City'}</p>
        </div>
        
        <div className="footer-section">
          <h3>📞 {locale === 'ar-SA' ? 'الهاتف' : 'Phone'}</h3>
          <p>{locale === 'ar-SA' ? '+966 (11) 123-4567' : '+1 (555) 123-4567'}</p>
        </div>
        
        <div className="footer-section">
          <h3>✉️ {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</h3>
          <p>info@futurenursery.com</p>
        </div>
        
        <div className="footer-section">
          <h3>🕐 {locale === 'ar-SA' ? 'ساعات العمل' : 'Hours'}</h3>
          <p>{locale === 'ar-SA' ? 'الإثنين - الجمعة: 7:00 ص - 6:00 م' : 'Mon-Fri: 7:00 AM - 6:00 PM'}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>{locale === 'ar-SA' ? '© 2025 روضة المستقبل. جميع الحقوق محفوظة.' : '© 2025 Future Nursery. All rights reserved.'}</p>
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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