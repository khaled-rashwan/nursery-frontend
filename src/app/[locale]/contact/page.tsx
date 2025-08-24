'use client';

import React, { useEffect, useState } from 'react';

export default function ContactUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    params.then(({ locale: paramLocale }) => {
      setLocale(paramLocale);
      setMounted(true);
    });
  }, [params]);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const content = locale === 'ar-SA' ? {
    title: 'اتصل بنا',
    section1_title: 'معلومات الاتصال',
    phone: '920016074',
    address: 'يمكنكم زيارتنا في الخبر - المنطقة الشرقية، المملكة العربية السعودية',
    workingHours: 'ساعات العمل: من الأحد إلى الخميس - من 7:30 صباحًا حتى 2:00 ظهرًا',
    email: 'info@futurestep.edu.sa',
    section2_title: 'اتصل بنا',
    section2_subtitle: 'هل لديك سؤال؟',
    section2_text: 'لا تتردد في الاتصال بنا.',
    form_fullName: 'الاسم الكامل',
    form_phoneNumber: 'رقم الهاتف',
    form_yourMessage: 'رسالتك',
    form_submitButton: 'إرسال',
    section3_title: 'الأسئلة الشائعة',
    faqs: [
      {
        q: 'ما هي الأعمار المقبولة في الحضانة؟',
        a: 'نقبل الأطفال من سن 3 إلى 5 سنوات في برامج KG1 و KG2.'
      },
      {
        q: 'هل تقدمون برنامجًا ثنائي اللغة؟',
        a: 'نعم، نحن نقدم منهجًا ثنائي اللغة (عربي-إنجليزي) يركز على تطوير اللغة في مرحلة مبكرة.'
      },
      {
        q: 'ما هو المنهج الذي تتبعونه؟',
        a: 'نحن نتبع إطار EYFS (المرحلة التأسيسية للسنوات المبكرة) البريطاني المتكيف مع الثقافة المحلية.'
      },
      {
        q: 'هل تتوفر وسائل نقل؟',
        a: 'نعم، نحن نوفر وسائل نقل مدرسية آمنة داخل مناطق محددة في الخبر.'
      },
      {
        q: 'كيف يمكنني حجز جولة في المدرسة؟',
        a: 'يمكنك حجز جولة شخصية عن طريق الاتصال بنا أو تقديم طلب عبر موقعنا الإلكتروني.'
      },
      {
        q: 'ماذا لو كان طفلي ينتقل من حضانة أخرى؟',
        a: 'نطلب تقريرًا من الحضانة السابقة ونقدم الدعم الكامل لانتقال أكاديمي وعاطفي سلس.'
      },
      {
        q: 'هل جميع الأنشطة مشمولة في الرسوم الدراسية؟',
        a: 'نعم، جميع الأنشطة التعليمية والترفيهية مشمولة، باستثناء الرحلات الميدانية الخارجية الخاصة.'
      },
      {
        q: 'هل لديكم سياسة استرداد؟',
        a: 'نعم، تتوفر سياسة واضحة وسيتم مشاركتها أثناء عملية التقديم.'
      }
    ]
  } : {
    title: 'Contact Us',
    section1_title: 'Contact Information',
    phone: '920016074',
    address: 'You can visit us in Al Khobar – Eastern Province, Saudi Arabia',
    workingHours: 'Working Hours: Sunday to Thursday – 7:30 AM to 2:00 PM',
    email: 'info@futurestep.edu.sa',
    section2_title: 'Contact Us',
    section2_subtitle: 'Have a question?',
    section2_text: 'Feel free to contact us.',
    form_fullName: 'Full Name',
    form_phoneNumber: 'Phone Number',
    form_yourMessage: 'Your Message',
    form_submitButton: 'Submit',
    section3_title: 'Frequently Asked Questions',
    faqs: [
      {
        q: 'What ages are accepted at the nursery?',
        a: 'We accept children aged 3 to 5 years in KG1 and KG2 programs.'
      },
      {
        q: 'Do you offer a bilingual program?',
        a: 'Yes, we provide a bilingual Arabic-English curriculum focused on early language development.'
      },
      {
        q: 'What curriculum do you follow?',
        a: 'We follow the EYFS (Early Years Foundation Stage) British framework adapted to local culture.'
      },
      {
        q: 'Is transportation available?',
        a: 'Yes, we offer safe school transport within select zones in Al Khobar.'
      },
      {
        q: 'How can I schedule a school tour?',
        a: 'You can schedule a personal tour by contacting us or submitting a request through our website.'
      },
      {
        q: 'What if my child is transferring from another nursery?',
        a: 'We require a report from the previous nursery and offer full support for a smooth academic and emotional transition.'
      },
      {
        q: 'Are all activities included in the tuition?',
        a: 'Yes, all educational and recreational activities are included, except for special external field trips.'
      },
      {
        q: 'Do you have a refund policy?',
        a: 'Yes, a clear policy is available and will be shared during the application process.'
      }
    ]
  };

  const formInputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '1rem',
    borderRadius: 'var(--border-radius)',
    border: '2px solid var(--light-blue)',
    background: '#fff',
    fontSize: '1rem',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  };

  const formLabelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: 'var(--primary-purple)',
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      padding: '2rem 1rem'
    }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, var(--light-orange), var(--light-yellow))',
        borderRadius: 'var(--border-radius)',
        margin: '2rem auto',
        maxWidth: '1200px',
        boxShadow: 'var(--shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '1rem',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
          fontWeight: 'bold'
        }}>
          {content.title}
        </h1>
      </section>

      {/* Section 1: Contact Information */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-blue)',
          marginBottom: '1.5rem',
          fontWeight: 'bold'
        }}>
          {content.section1_title}
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>📞 {content.phone}</p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>📍 {content.address}</p>
        <div style={{height: '400px', borderRadius: 'var(--border-radius)', overflow: 'hidden', margin: '2rem 0', boxShadow: 'var(--shadow)'}}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3574.69738933688!2d50.16185261503345!3d26.31433198336304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e7f507256e65%3A0xe8144a55f64b2ab5!2sFuture%20Step%20Kindergarten!5e0!3m2!1sen!2ssa!4v1620826723455!5m2!1sen!2ssa"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>🕒 {content.workingHours}</p>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8' }}>✉️ {content.email}</p>
      </section>

      {/* Section 2: Contact Us Form */}
      <section style={{
        background: 'linear-gradient(135deg, var(--light-blue), white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '800px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-purple)',
          marginBottom: '0.5rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {content.section2_title}
        </h2>
        <h3 style={{
          fontSize: '1.5rem',
          color: 'var(--primary-orange)',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>{content.section2_subtitle}</h3>
        <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.8', textAlign: 'center', marginBottom: '2rem' }}>
          {content.section2_text}
        </p>
        <form>
          <div>
            <label htmlFor="fullName" style={formLabelStyle}>{content.form_fullName}</label>
            <input type="text" id="fullName" name="fullName" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="phoneNumber" style={formLabelStyle}>{content.form_phoneNumber}</label>
            <input type="text" id="phoneNumber" name="phoneNumber" style={formInputStyle} />
          </div>
          <div>
            <label htmlFor="message" style={formLabelStyle}>{content.form_yourMessage}</label>
            <textarea id="message" name="message" style={{...formInputStyle, minHeight: '150px'}}></textarea>
          </div>
          {/* recaptcha placeholder */}
          <div style={{margin: '1rem 0', background: '#eee', padding: '1rem', borderRadius: 'var(--border-radius)', textAlign: 'center'}}>recaptcha placeholder</div>
          <button type="submit" style={{
            display: 'block',
            width: '100%',
            padding: '1rem',
            background: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s, transform 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-blue-dark)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-green)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            {content.form_submitButton}
          </button>
        </form>
      </section>

      {/* Section 3: FAQ */}
      <section style={{
        background: 'white',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        margin: '3rem auto',
        maxWidth: '1000px',
        boxShadow: 'var(--shadow)',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          color: 'var(--primary-green)',
          marginBottom: '2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {content.section3_title}
        </h2>
        <div>
          {content.faqs.map((faq, index) => (
            <div key={index} style={{ marginBottom: '1rem', borderBottom: '2px solid var(--light-blue)', paddingBottom: '1rem' }}>
              <button onClick={() => toggleFaq(index)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', color: 'var(--primary-purple)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{faq.q}</span>
                <span>{openFaq === index ? '-' : '+'}</span>
              </button>
              {openFaq === index && <p style={{ marginTop: '0.5rem', padding: '1rem', background: 'var(--light-yellow)', borderRadius: 'var(--border-radius)' }}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
