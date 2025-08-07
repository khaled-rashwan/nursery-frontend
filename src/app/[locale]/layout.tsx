
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Geist, Geist_Mono } from "next/font/google";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import FirebaseLogoutButton from "../../components/FirebaseLogoutButton";
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
        <Link href={`/${locale}`} className="logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <img 
            src="/logo.png" 
            alt="Future Step Nursery Logo"
            style={{
              height: '40px',
              width: 'auto',
              maxWidth: '60px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            lineHeight: '1.1',
            gap: '0.1rem'
          }}>
            {locale === 'ar-SA' ? (
              <>
                <span style={{ 
                  color: 'var(--primary-blue-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  روضة
                </span>
                <span style={{ 
                  color: 'var(--primary-blue-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  خطوة المستقبل
                </span>
                <span style={{ 
                  color: 'var(--primary-orange-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  العالمية
                </span>
              </>
            ) : (
              <>
                <span style={{ 
                  color: 'var(--primary-blue-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Future
                </span>
                <span style={{ 
                  color: 'var(--primary-blue-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Step
                </span>
                <span style={{ 
                  color: 'var(--primary-orange-dark)', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Kindergarten
                </span>
              </>
            )}
          </div>
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
            <li className="nav-item">
              <Link href={`/${locale}/teacher-portal`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'بوابة المعلمين' : 'Teacher Portal'}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${locale}/admin`} className="nav-link bounce-on-hover">
                {locale === 'ar-SA' ? 'بوابة الإدارة' : 'Admin Portal'}
              </Link>
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

function Footer({locale}: {locale: string}) {
  return (
    <footer className="kindergarten-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>📍 {locale === 'ar-SA' ? 'العنوان' : 'Address'}</h3>
          <p>{locale === 'ar-SA' ? 'مدينة الخبر – المنطقة الشرقية' : 'Al Khobar – Eastern Province'}</p>
        </div>
        
        <div className="footer-section">
          <h3>📞 {locale === 'ar-SA' ? 'هاتف، واتساب' : 'Phone & WhatsApp'}</h3>
          <p>{locale === 'ar-SA' ? '920016074' : '920016074'}</p>
        </div>
        
        <div className="footer-section">
          <h3>✉️ {locale === 'ar-SA' ? 'البريد الإلكتروني' : 'Email'}</h3>
          <p>info@futurestep.edu.sa</p>
        </div>
        
        <div className="footer-section">
          <h3>🕐 {locale === 'ar-SA' ? 'ساعات العمل' : 'Hours'}</h3>
          <p>{locale === 'ar-SA' ? 'الأحد - الخميس: 7:30 ص - 2:00 م' : 'Sunday to Thursday: 7:30 AM to 2:00 PM'}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>{locale === 'ar-SA' ? '© 2025 روضة المستقبل. جميع الحقوق محفوظة.' : '© 2025 Future Step Kindergarten. All rights reserved.'}</p>
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