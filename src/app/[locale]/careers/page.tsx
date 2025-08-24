'use client';

import React, { useEffect, useState } from 'react';

export default function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<string>('en-US');
  const [mounted, setMounted] = useState(false);

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
    title: 'الوظائف',
    section1_title: 'كن جزءًا من عائلتنا',
    section1_p1: 'نحن نبحث دائمًا عن محترفين متحمسين ومبدعين ومتفانين ومتحمسين لإحداث فرق في حياة الأطفال الصغار. في حضانة خطوة المستقبل، ستكون جزءًا من فريق داعم يقدر الابتكار والتعاون والنمو المهني.',
    section1_p2: 'سواء كنت معلمًا ذا خبرة، أو مساعدًا مربيًا، أو عضوًا متحمسًا في الفريق الإداري - نرحب بالأفراد الذين يشاركوننا رؤيتنا لإلهام الجيل القادم.',
    section2_title: 'لماذا تعمل معنا؟',
    section2_points: [
      'بيئة تتمحور حول الطفل وهادفة',
      'تدريب مستمر وتطوير مهني',
      'ثقافة عمل تعاونية ومحترمة',
      'مرافق حديثة مصممة للتميز',
      'فرص للنمو مع رؤيتنا المتوسعة'
    ],
    section3_title: 'الوظائف الشاغرة',
    section3_p1: 'ندعوكم لاستكشاف وظائفنا الشاغرة الحالية لـ:',
    section3_positions: [
      'معلمو KG1 و KG2 (مسار عربي وإنجليزي)',
      'مساعدو تدريس',
      'موظفون إداريون',
      'فريق خدمات الدعم (مثل الاستقبال والمرافق)'
    ],
    section4_title: 'أرسل سيرتك الذاتية ورسالة التغطية',
    section4_p1: 'أرسل سيرتك الذاتية ورسالة التغطية إلى: careers@futurestep.edu.sa',
    section4_p2: 'أو أكمل نموذج الاهتمام أدناه:',
    form_fullName: 'الاسم الكامل',
    form_phoneNumber: 'رقم الهاتف',
    form_emailAddress: 'عنوان البريد الإلكتروني',
    form_jobTitle: 'المسمى الوظيفي',
    form_attachResume: 'إرفاق السيرة الذاتية',
    form_yourMessage: 'رسالتك',
    form_submitButton: 'إرسال'
  } : {
    title: 'Careers',
    section1_title: 'Be part of our family',
    section1_p1: 'We are always looking for passionate, creative, and dedicated professionals who are excited to make a difference in the lives of young children. At Future Step Nursery, you’ll be part of a supportive team that values innovation, collaboration, and professional growth.',
    section1_p2: 'Whether you\'re an experienced educator, a nurturing assistant, or an enthusiastic administrative team member — we welcome individuals who share our vision of inspiring the next generation.',
    section2_title: 'Why Work With Us?',
    section2_points: [
      'A purpose-driven, child-centered environment',
      'Ongoing training and professional development',
      'Collaborative and respectful workplace culture',
      'Modern facilities designed for excellence',
      'Opportunities to grow with our expanding vision'
    ],
    section3_title: 'Open Positions',
    section3_p1: 'We invite you to explore our current openings for:',
    section3_positions: [
      'KG1 & KG2 Teachers (Arabic & English Tracks)',
      'Teaching Assistants',
      'Administrative Staff',
      'Support Services Team (e.g., Reception, Facilities)'
    ],
    section4_title: 'Submit Your CV & Cover Letter',
    section4_p1: 'Submit Your CV & Cover Letter to: careers@futurestep.edu.sa',
    section4_p2: 'Or complete the interest form below:',
    form_fullName: 'Full Name',
    form_phoneNumber: 'Phone Number',
    form_emailAddress: 'Email Address',
    form_jobTitle: 'Job Title',
    form_attachResume: 'Attach resume',
    form_yourMessage: 'Your message',
    form_submitButton: 'Submit'
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{content.title}</h1>

      <section>
        <h2>{content.section1_title}</h2>
        <p>{content.section1_p1}</p>
        <p>{content.section1_p2}</p>
      </section>

      <section>
        <h2>{content.section2_title}</h2>
        <ul>
          {content.section2_points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{content.section3_title}</h2>
        <p>{content.section3_p1}</p>
        <ul>
          {content.section3_positions.map((position, index) => (
            <li key={index}>{position}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{content.section4_title}</h2>
        <p>{content.section4_p1}</p>
        <p>{content.section4_p2}</p>
        <form>
          <div>
            <label htmlFor="fullName">{content.form_fullName}</label>
            <input type="text" id="fullName" name="fullName" />
          </div>
          <div>
            <label htmlFor="phoneNumber">{content.form_phoneNumber}</label>
            <input type="text" id="phoneNumber" name="phoneNumber" />
          </div>
          <div>
            <label htmlFor="emailAddress">{content.form_emailAddress}</label>
            <input type="email" id="emailAddress" name="emailAddress" />
          </div>
          <div>
            <label htmlFor="jobTitle">{content.form_jobTitle}</label>
            <select id="jobTitle" name="jobTitle">
              {content.section3_positions.map((position, index) => (
                <option key={index} value={position}>{position}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="resume">{content.form_attachResume}</label>
            <input type="file" id="resume" name="resume" />
          </div>
          <div>
            <label htmlFor="message">{content.form_yourMessage}</label>
            <textarea id="message" name="message"></textarea>
          </div>
          <button type="submit">{content.form_submitButton}</button>
        </form>
      </section>
    </div>
  );
}
