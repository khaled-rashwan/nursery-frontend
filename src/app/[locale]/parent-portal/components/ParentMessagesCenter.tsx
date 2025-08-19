"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAcademicYear } from "../../../../contexts/AcademicYearContext";

// Minimal types for threads/messages
interface Thread {
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
}

interface Message {
  id: string;
  messageId?: string;
  senderId: string;
  text: string;
  title?: string | null;
  createdAt: { seconds: number; nanoseconds: number };
}

const API_BASE_URL = `https://us-central1-${process.env.NEXT_PUBLIC_PROJECT_ID}.cloudfunctions.net`;

async function authedFetch(user: any, url: string, init?: RequestInit) {
  const token = await user.getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  return fetch(url, { ...init, headers });
}

export function ParentMessagesCenter({ locale, currentChild }: { locale: string; currentChild: any }) {
  // Reset selectedThread when switching students
  useEffect(() => {
    setSelectedThread(null);
  }, [currentChild?.id]);
  const { user } = useAuth();
  const { selectedAcademicYear } = useAcademicYear();
  const [threads, setThreads] = useState<Thread[]>([]);

  // Fetch teacher info from Cloud Function (production-safe)
  const fetchTeacherInfo = async (teacherId: string): Promise<{ displayName: string }> => {
    try {
      const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || 'us-central1';
      const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
      const url = `https://${region}-${projectId}.cloudfunctions.net/manageTeachersNew?operation=get&teacherId=${teacherId}`;
      let token = '';
      if (user && typeof user.getIdToken === 'function') {
        token = await user.getIdToken();
      }
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to fetch teacher info');
      const data = await res.json();
      return { displayName: data.teacher?.displayName || teacherId };
    } catch {
      return { displayName: teacherId };
    }
  };
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [activeTab, setActiveTab] = useState<'messages' | 'compose'>('messages');
  const [composeSubject, setComposeSubject] = useState('');
  const [sending, setSending] = useState(false);

  const isRTL = locale === "ar-SA";

  const loadThreads = useCallback(async () => {
    if (!user || !selectedAcademicYear) return;
    setLoadingThreads(true);
    try {
      const params = new URLSearchParams({ operation: "listThreadsForParent", academicYear: selectedAcademicYear });
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const threadsArr = Array.isArray(data.threads) ? data.threads : [];
      setThreads(threadsArr);
      // Fetch teacher names for all unique teacherIds
      const uniqueTeacherIds: string[] = Array.from(new Set(threadsArr.map((t: Thread) => t.teacherId)));
      const names: Record<string, string> = {};
      await Promise.all(uniqueTeacherIds.map(async (tid: string) => {
        if (tid && !names[tid]) {
          const info = await fetchTeacherInfo(tid);
          names[tid] = info.displayName || tid;
        }
      }));
      setTeacherNames(names);
    } catch (e) {
      setThreads([]);
      setTeacherNames({});
    } finally {
      setLoadingThreads(false);
    }
  }, [user, selectedAcademicYear]);

  const loadMessages = useCallback(async (thread: Thread) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const params = new URLSearchParams({ operation: "listMessages", threadId: thread.id, direction: "asc" });
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      // mark read
      await authedFetch(user, `${API_BASE_URL}/manageMessages?operation=markThreadRead`, {
        method: "POST",
        body: JSON.stringify({ threadId: thread.id })
      });
    } catch (e) {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (thread: Thread, text: string, title?: string) => {
    if (!user || !text.trim()) return;
    try {
      const res = await authedFetch(user, `${API_BASE_URL}/manageMessages?operation=sendMessage`, {
        method: "POST",
        body: JSON.stringify({ threadId: thread.id, text, title })
      });
      if (!res.ok) throw new Error(await res.text());
      await loadMessages(thread);
    } catch (e) {}
  }, [user, loadMessages]);

  useEffect(() => { loadThreads(); }, [loadThreads]);
  useEffect(() => { if (selectedThread) loadMessages(selectedThread); }, [selectedThread, loadMessages]);

  // Only show threads for the selected child
  const filteredThreads = threads.filter(t => t.studentId === currentChild?.id);

  return (
    <div style={{ background: "white", borderRadius: "25px", padding: "2rem", boxShadow: "0 15px 50px rgba(0,0,0,0.1)", marginBottom: "3rem" }}>
      <h2 style={{ fontSize: "2rem", color: "var(--primary-blue-dark)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
        💬 {locale === "ar-SA" ? "الرسائل" : "Messages"}
      </h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('messages')}
          style={{ background: activeTab === 'messages' ? 'var(--primary-blue)' : 'var(--light-blue)', color: activeTab === 'messages' ? 'white' : 'var(--primary-blue)', border: 'none', padding: '1rem 2rem', borderRadius: '15px 15px 0 0', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          💬 {locale === 'ar-SA' ? 'المحادثات' : 'Threads'}
        </button>
        <button
          onClick={() => setActiveTab('compose')}
          style={{ background: activeTab === 'compose' ? 'var(--primary-blue)' : 'var(--light-blue)', color: activeTab === 'compose' ? 'white' : 'var(--primary-blue)', border: 'none', padding: '1rem 2rem', borderRadius: '15px 15px 0 0', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          ✏️ {locale === 'ar-SA' ? 'إنشاء رسالة' : 'Compose'}
        </button>
      </div>
      {activeTab === 'messages' && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
          <div>
            <div style={{ fontWeight: "bold", marginBottom: "0.75rem", color: "var(--primary-blue-dark)" }}>
              {isRTL ? "المحادثات" : "Threads"} {loadingThreads ? "…" : ""}
            </div>
            <div>
              {filteredThreads.map((t) => {
                const studentName = currentChild?.name || t.studentId;
                const teacherName = teacherNames[t.teacherId] || t.teacherId;
                const unread = t.unreadCounts?.[user?.uid || ""] || 0;
                return (
                  <button key={t.id} onClick={() => setSelectedThread(t)}
                    style={{
                      width: "100%", textAlign: "left", padding: "1rem", marginBottom: "0.5rem", borderRadius: "12px",
                      background: selectedThread?.id === t.id ? "var(--light-blue)" : "#f7f9fc",
                      border: "1px solid #e6eef6"
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, color: "var(--primary-blue-dark)" }}>{studentName}</div>
                      {unread > 0 && <span style={{ background: "var(--primary-red)", color: "white", padding: "0 8px", borderRadius: "999px", fontSize: 12 }}>{unread}</span>}
                    </div>
                    <div style={{ color: "#556", fontSize: 12, opacity: 0.9 }}>{isRTL ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}</div>
                    <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>{t.lastMessage?.text || (isRTL ? "لا توجد رسائل" : "No messages")}</div>
                  </button>
                );
              })}
              {!loadingThreads && filteredThreads.length === 0 && (
                <div style={{ color: "#888", padding: "1rem" }}>{isRTL ? "لا توجد محادثات" : "No threads yet"}</div>
              )}
            </div>
          </div>
          <div>
            {!selectedThread && (
              <div style={{ color: "#888" }}>{isRTL ? "اختر محادثة من القائمة" : "Select a thread from the list"}</div>
            )}
            {selectedThread && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontWeight: "bold", color: "var(--primary-blue-dark)" }}>
                  {currentChild?.name} <span style={{ color: "#556", fontWeight: 500 }}>• {isRTL ? `المعلم: ${teacherNames[selectedThread.teacherId] || selectedThread.teacherId}` : `Teacher: ${teacherNames[selectedThread.teacherId] || selectedThread.teacherId}`}</span>
                </div>
                <div style={{ background: "#f7f9fc", border: "1px solid #e6eef6", borderRadius: 12, padding: "1rem", maxHeight: 320, overflowY: "auto" }}>
                  {loadingMessages && <div style={{ color: "#888" }}>{isRTL ? "جارٍ التحميل..." : "Loading..."}</div>}
                  {!loadingMessages && messages.length === 0 && <div style={{ color: "#888" }}>{isRTL ? "لا توجد رسائل" : "No messages yet"}</div>}
                  {messages.map((m) => {
                    // Determine sender label and style
                    const isTeacher = m.senderId === selectedThread?.teacherId;
                    const isParent = m.senderId === selectedThread?.parentId;
                    const senderLabel = isTeacher
                      ? (isRTL ? 'المعلم' : 'Teacher')
                      : isParent
                        ? (isRTL ? 'ولي الأمر' : 'Parent')
                        : m.senderId;
                    return (
                      <div
                        key={m.id}
                        style={{
                          marginBottom: "0.75rem",
                          background: isTeacher ? 'var(--light-blue)' : isParent ? 'var(--light-green)' : '#f7f9fc',
                          borderRadius: 10,
                          padding: '0.75rem 1rem',
                          alignSelf: isTeacher ? 'flex-start' : isParent ? 'flex-end' : 'center',
                          maxWidth: '80%',
                          marginLeft: isTeacher ? 0 : 'auto',
                          marginRight: isParent ? 0 : 'auto',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: isTeacher ? 'var(--primary-blue-dark)' : 'var(--primary-green)' }}>
                          {senderLabel}
                          {m.title && <span style={{ fontWeight: 700, marginLeft: 8 }}>{m.title}</span>}
                        </div>
                        <div style={{ marginTop: 2 }}>{m.text}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={composeText} onChange={(e) => setComposeText(e.target.value)} placeholder={isRTL ? "اكتب رسالة..." : "Write a message..."}
                    style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid #e0e6ee" }} />
                  <button onClick={() => selectedThread && sendMessage(selectedThread, composeText).then(() => setComposeText(""))}
                    style={{ background: "var(--primary-blue)", color: "white", border: "none", padding: "0.75rem 1.25rem", borderRadius: 10, fontWeight: 700 }}>
                    {isRTL ? "إرسال" : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'compose' && (
        <div style={{ maxWidth: 500, margin: '0 auto', background: '#f7f9fc', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-blue-dark)', marginBottom: '1.5rem' }}>{isRTL ? 'إنشاء رسالة جديدة' : 'Compose New Message'}</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--primary-blue-dark)', marginBottom: 4, display: 'block' }}>{isRTL ? 'الموضوع:' : 'Subject:'}</label>
            <input
              type="text"
              value={composeSubject}
              onChange={e => setComposeSubject(e.target.value)}
              placeholder={isRTL ? 'أدخل موضوع الرسالة' : 'Enter message subject'}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--light-blue)', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--primary-blue-dark)', marginBottom: 4, display: 'block' }}>{isRTL ? 'الرسالة:' : 'Message:'}</label>
            <textarea
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid var(--light-blue)', fontSize: '1rem', minHeight: 100, resize: 'vertical' }}
            />
          </div>
          <button
            disabled={!composeSubject.trim() || !composeText.trim() || sending}
            onClick={async () => {
              if (!user || !currentChild?.id) return;
              setSending(true);
              try {
                // Find the teacherId for this thread (from the first thread for this child, or fallback to any thread)
                let teacherId = '';
                const childThreads = threads.filter(t => t.studentId === currentChild.id);
                if (childThreads.length > 0) {
                  teacherId = childThreads[0].teacherId;
                } else if (threads.length > 0) {
                  teacherId = threads[0].teacherId;
                }
                if (!teacherId) throw new Error('No teacher found for this child.');
                const parentId = user.uid;
                const studentId = currentChild.id;
                const academicYear = selectedAcademicYear;
                const enrollmentId = childThreads.length > 0 ? childThreads[0].enrollmentId : '';
                const classId = childThreads.length > 0 ? childThreads[0].classId : '';
                const body = {
                  teacherId,
                  parentId,
                  studentId,
                  academicYear,
                  enrollmentId,
                  classId,
                  firstMessage: { title: composeSubject, text: composeText }
                };
                const token = await user.getIdToken();
                const res = await fetch(`${API_BASE_URL}/manageMessages?operation=getOrCreateThread`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                const created = data.thread || null;
                await loadThreads();
                if (created) {
                  setActiveTab('messages');
                  setSelectedThread(created);
                  await loadMessages(created);
                }
                setComposeSubject('');
                setComposeText('');
              } catch (e) {
                alert(isRTL ? 'فشل إرسال الرسالة. حاول مرة أخرى.' : 'Failed to send message. Please try again.');
              } finally {
                setSending(false);
              }
            }}
            style={{ background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark))', opacity: (!composeSubject.trim() || !composeText.trim() || sending) ? 0.7 : 1, color: 'white', border: 'none', padding: '1rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: (!composeSubject.trim() || !composeText.trim() || sending) ? 'not-allowed' : 'pointer' }}
          >
            {sending ? (isRTL ? 'جارٍ الإرسال...' : 'Sending...') : `✉️ ${isRTL ? 'إرسال الرسالة' : 'Send Message'}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default ParentMessagesCenter;
