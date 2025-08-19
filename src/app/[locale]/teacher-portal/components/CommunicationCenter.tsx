"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useAcademicYear } from '../../../../contexts/AcademicYearContext';
import type { EnrollmentStudent } from '../types';

// Minimal types for threads/messages
type Thread = {
  id: string;
  threadId?: string;
  academicYear: string;
  classId: string;
  teacherId: string;
  parentId: string;
  studentId: string;
  enrollmentId: string;
  lastMessage?: { text: string; senderId: string; createdAt: { seconds: number; nanoseconds: number } } | null;
  unreadCounts?: Record<string, number>;
  updatedAt?: { seconds: number; nanoseconds: number };
};

type Message = {
  id: string;
  messageId?: string;
  senderId: string;
  text: string;
  title?: string | null;
  createdAt: { seconds: number; nanoseconds: number };
};

const API_BASE_URL = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net`;

async function authedFetch(user: any, url: string, init?: RequestInit) {
  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers });
}

export function CommunicationCenter({ locale, selectedClass }: { locale: string; selectedClass: string }) {
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements' | 'compose'>('messages');
  const { user } = useAuth();
  const { selectedAcademicYear } = useAcademicYear();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composeText, setComposeText] = useState('');

  // Compose state
  const [enrollments, setEnrollments] = useState<EnrollmentStudent[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);

  const isRTL = locale === 'ar-SA';

  const teacherThreads = useMemo(() => {
    // Filter by current class if provided
    return selectedClass ? threads.filter(t => t.classId === selectedClass) : threads;
  }, [threads, selectedClass]);

  const loadThreads = useCallback(async () => {
    if (!user || !selectedAcademicYear) return;
    setLoadingThreads(true);
    try {
      const params = new URLSearchParams({ operation: 'listThreadsForTeacher', academicYear: selectedAcademicYear });
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setThreads(Array.isArray(data.threads) ? data.threads : []);
    } catch (e) {
      console.error('Failed to load threads:', e);
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  }, [user, selectedAcademicYear]);

  const loadEnrollments = useCallback(async () => {
    if (!user || !selectedClass) {
      setEnrollments([]);
      return;
    }
    setLoadingEnrollments(true);
    try {
      // Reuse the Cloud Function endpoint used elsewhere
      const params = new URLSearchParams({ classId: selectedClass });
      const res = await authedFetch(user, `${API_BASE_URL}/getEnrollmentsByClass?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list: EnrollmentStudent[] = Array.isArray(data.enrollments) ? data.enrollments : [];
      setEnrollments(list);
    } catch (e) {
      console.error('Failed to load enrollments for compose:', e);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [user, selectedClass]);

  const loadMessages = useCallback(async (thread: Thread) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const params = new URLSearchParams({ operation: 'listMessages', threadId: thread.id, direction: 'asc' });
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      // mark read
      await authedFetch(user, `${API_BASE_URL}/manageMessages?operation=markThreadRead`, {
        method: 'POST',
        body: JSON.stringify({ threadId: thread.id })
      });
    } catch (e) {
      console.error('Failed to load messages:', e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (thread: Thread, text: string, title?: string) => {
    if (!user || !text.trim()) return;
    try {
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?operation=sendMessage`, {
        method: 'POST',
        body: JSON.stringify({ threadId: thread.id, text, title })
      });
      if (!res.ok) throw new Error(await res.text());
      // refresh messages
      await loadMessages(thread);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }, [user, loadMessages]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (selectedThread) loadMessages(selectedThread);
  }, [selectedThread, loadMessages]);

  // Load enrollments whenever selected class changes (used for names + compose)
  useEffect(() => {
    if (selectedClass) {
      loadEnrollments();
    } else {
      setEnrollments([]);
    }
  }, [selectedClass, loadEnrollments]);

  // Reset compose form if class/year changes
  useEffect(() => {
    setSelectedEnrollmentId('');
    setComposeSubject('');
    setComposeBody('');
  }, [selectedClass, selectedAcademicYear]);

  const handleCreateThreadAndSend = useCallback(async () => {
    if (!user) return;
    if (!selectedEnrollmentId) return;
    const enrollment = enrollments.find(e => e.id === selectedEnrollmentId);
    if (!enrollment) return;
    if (!composeBody.trim() && !composeSubject.trim()) return;

    setSending(true);
    try {
      const parentId = enrollment.studentInfo?.parentInfo?.uid || (enrollment as any).parentUID || enrollment.studentInfo?.parentUID || '';
      const studentId = enrollment.studentUID;
      const body = {
        parentId,
        studentId,
        enrollmentId: enrollment.id,
        academicYear: enrollment.academicYear || selectedAcademicYear,
        classId: selectedClass,
        firstMessage: { title: composeSubject || null, text: composeBody || '' }
      };
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?operation=getOrCreateThread`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const created: Thread | null = data.thread || null;

      // Refresh threads and open this one
      await loadThreads();
      if (created) {
        setActiveTab('messages');
        setSelectedThread(created);
        await loadMessages(created);
      }
      // Clear compose inputs
      setComposeSubject('');
      setComposeBody('');
      setSelectedEnrollmentId('');
    } catch (e) {
      console.error('Failed to create thread/send first message:', e);
    } finally {
      setSending(false);
    }
  }, [user, selectedEnrollmentId, enrollments, composeSubject, composeBody, selectedClass, selectedAcademicYear, loadThreads, loadMessages]);

  return (
    <div style={{ background: 'white', borderRadius: '25px', padding: '2rem', boxShadow: '0 15px 50px rgba(0,0,0,0.1)', marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '2rem', color: 'var(--primary-blue-dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        💌 {locale === 'ar-SA' ? 'مركز التواصل' : 'Communication Center'}
      </h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--light-blue)' }}>
        {[
          { id: 'messages', label: locale === 'ar-SA' ? 'الرسائل' : 'Messages', icon: '💬' },
          { id: 'announcements', label: locale === 'ar-SA' ? 'الإعلانات' : 'Announcements', icon: '📢' },
          { id: 'compose', label: locale === 'ar-SA' ? 'إنشاء رسالة' : 'Compose', icon: '✏️' }
        ].map((tab: { id: string; label: string; icon: string }) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as 'messages' | 'announcements' | 'compose')}
            style={{ background: activeTab === tab.id ? 'var(--primary-blue)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--primary-blue)', border: 'none', padding: '1rem 2rem', borderRadius: '15px 15px 0 0', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--primary-blue-dark)' }}>
              {isRTL ? 'المحادثات' : 'Threads'} {loadingThreads ? '…' : ''}
            </div>
            <div>
              {teacherThreads.map((t) => {
                const enrollment = enrollments.find(e => e.id === t.enrollmentId);
                const studentName = enrollment?.studentInfo?.fullName || t.studentId;
                const parentName = enrollment?.studentInfo?.parentInfo?.displayName || enrollment?.studentInfo?.parentInfo?.email || '';
                const unread = t.unreadCounts?.[user?.uid || ''] || 0;
                return (
                  <button key={t.id} onClick={() => setSelectedThread(t)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '1rem', marginBottom: '0.5rem', borderRadius: '12px',
                      background: selectedThread?.id === t.id ? 'var(--light-blue)' : '#f7f9fc',
                      border: '1px solid #e6eef6'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-blue-dark)' }}>{studentName}</div>
                      {unread > 0 && <span style={{ background: 'var(--primary-red)', color: 'white', padding: '0 8px', borderRadius: '999px', fontSize: 12 }}>{unread}</span>}
                    </div>
                    {parentName && <div style={{ color: '#556', fontSize: 12, opacity: 0.9 }}>{isRTL ? `ولي الأمر: ${parentName}` : `Parent: ${parentName}`}</div>}
                    <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{t.lastMessage?.text || (isRTL ? 'لا توجد رسائل' : 'No messages')}</div>
                  </button>
                );
              })}
              {!loadingThreads && teacherThreads.length === 0 && (
                <div style={{ color: '#888', padding: '1rem' }}>{isRTL ? 'لا توجد محادثات' : 'No threads yet'}</div>
              )}
            </div>
          </div>
          <div>
            {!selectedThread && (
              <div style={{ color: '#888' }}>{isRTL ? 'اختر محادثة من القائمة' : 'Select a thread from the list'}</div>
            )}
            {selectedThread && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(() => {
                  const enrollment = enrollments.find(e => e.id === selectedThread.enrollmentId);
                  const studentName = enrollment?.studentInfo?.fullName || selectedThread.studentId;
                  const parentName = enrollment?.studentInfo?.parentInfo?.displayName || enrollment?.studentInfo?.parentInfo?.email || '';
                  return (
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-blue-dark)' }}>
                      {studentName} {parentName ? <span style={{ color: '#556', fontWeight: 500 }}>• {isRTL ? `ولي الأمر: ${parentName}` : `Parent: ${parentName}`}</span> : null}
                    </div>
                  );
                })()}
                <div style={{ background: '#f7f9fc', border: '1px solid #e6eef6', borderRadius: 12, padding: '1rem', maxHeight: 320, overflowY: 'auto' }}>
                  {loadingMessages && <div style={{ color: '#888' }}>{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>}
                  {!loadingMessages && messages.length === 0 && <div style={{ color: '#888' }}>{isRTL ? 'لا توجد رسائل' : 'No messages yet'}</div>}
                  {messages.map((m) => (
                    <div key={m.id} style={{ marginBottom: '0.75rem' }}>
                      {m.title && <div style={{ fontWeight: 700 }}>{m.title}</div>}
                      <div>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={composeText} onChange={(e) => setComposeText(e.target.value)} placeholder={isRTL ? 'اكتب رسالة...' : 'Write a message...'}
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid #e0e6ee' }} />
                  <button onClick={() => selectedThread && sendMessage(selectedThread, composeText).then(() => setComposeText(''))}
                    style={{ background: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 700 }}>
                    {isRTL ? 'إرسال' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📢</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{locale === 'ar-SA' ? 'إرسال إعلان جماعي' : 'Send Group Announcement'}</h3>
          <p style={{ marginBottom: '2rem' }}>{locale === 'ar-SA' ? 'أرسل إعلانات مهمة لجميع أولياء الأمور في صفك' : 'Send important announcements to all parents in your class'}</p>
          <button style={{ background: 'var(--primary-orange)', color: 'white', border: 'none', padding: '1.5rem 3rem', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
            {locale === 'ar-SA' ? 'إنشاء إعلان' : 'Create Announcement'}
          </button>
        </div>
      )}

      {activeTab === 'compose' && (
        <div>
          {!selectedClass && (
            <div style={{ color: '#888' }}>
              {isRTL ? 'يرجى اختيار صف أولاً' : 'Please select a class first'}
            </div>
          )}
          {selectedClass && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-blue-dark)' }}>
                  {locale === 'ar-SA' ? 'الطالب / ولي الأمر:' : 'Student / Parent:'}
                </label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  disabled={loadingEnrollments}
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '2px solid var(--light-blue)', borderRadius: '15px', outline: 'none' }}
                >
                  <option value="">
                    {loadingEnrollments
                      ? (isRTL ? 'جاري التحميل...' : 'Loading...')
                      : (isRTL ? 'اختر الطالب' : 'Select a student')}
                  </option>
                  {enrollments.map((en) => {
                    const studentName = en.studentInfo?.fullName || en.studentUID;
                    const parentName = en.studentInfo?.parentInfo?.displayName || en.studentInfo?.parentInfo?.email || en.studentInfo?.parentUID || '';
                    return (
                      <option key={en.id} value={en.id}>
                        {studentName}{parentName ? ` (${parentName})` : ''}
                      </option>
                    );
                  })}
                </select>
                {!loadingEnrollments && enrollments.length === 0 && (
                  <div style={{ color: '#888', marginTop: '0.5rem' }}>
                    {isRTL ? 'لا يوجد طلاب في هذا الصف' : 'No students found for this class'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-blue-dark)' }}>
                  {locale === 'ar-SA' ? 'الموضوع:' : 'Subject:'}
                </label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder={locale === 'ar-SA' ? 'أدخل موضوع الرسالة' : 'Enter message subject'}
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '2px solid var(--light-blue)', borderRadius: '15px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-blue-dark)' }}>
                  {locale === 'ar-SA' ? 'الرسالة:' : 'Message:'}
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder={locale === 'ar-SA' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', border: '2px solid var(--light-blue)', borderRadius: '15px', outline: 'none', minHeight: '150px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  disabled={!selectedEnrollmentId || (!composeBody.trim() && !composeSubject.trim()) || sending}
                  onClick={handleCreateThreadAndSend}
                  style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', opacity: (!selectedEnrollmentId || (!composeBody.trim() && !composeSubject.trim()) || sending) ? 0.7 : 1, color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: (!selectedEnrollmentId || (!composeBody.trim() && !composeSubject.trim()) || sending) ? 'not-allowed' : 'pointer' }}
                >
                  {sending ? (isRTL ? 'جارٍ الإرسال...' : 'Sending...') : `✉️ ${isRTL ? 'إرسال الرسالة' : 'Send Message'}`}
                </button>
                <button
                  type="button"
                  onClick={() => { setComposeSubject(''); setComposeBody(''); setSelectedEnrollmentId(''); }}
                  style={{ background: '#eef3fb', color: '#1f3b64', border: '1px solid #d3e0f4', padding: '1rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  {isRTL ? 'تفريغ' : 'Clear'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommunicationCenter;
