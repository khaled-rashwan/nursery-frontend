// --- Homework Submission Types and API ---
export interface HomeworkSubmission {
  homeworkId: string;
  studentId: string;
  parentUID: string;
  status: 'submitted' | 'confirmed';
  attachments: string[];
  comment?: string;
  submittedAt?: string;
  updatedAt?: string;
}

export async function fetchHomeworkSubmission(token: string, homeworkId: string, studentId: string): Promise<HomeworkSubmission | null> {
  const url = new URL(`${CF_BASE}/getHomeworkSubmission`);
  url.searchParams.set('homeworkId', homeworkId);
  url.searchParams.set('studentId', studentId);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.submission || null;
}

export async function submitHomework(token: string, submission: {
  homeworkId: string;
  studentId: string;
  status: 'submitted' | 'confirmed';
  attachments?: string[];
  comment?: string;
}): Promise<HomeworkSubmission> {
  const res = await fetch(`${CF_BASE}/submitHomework`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(submission)
  });
  if (!res.ok) throw new Error('Failed to submit homework');
  const data = await res.json();
  return data.submission;
}

export async function deleteHomeworkSubmission(token: string, homeworkId: string, studentId: string): Promise<void> {
  const url = new URL(`${CF_BASE}/deleteHomeworkSubmission`);
  url.searchParams.set('homeworkId', homeworkId);
  url.searchParams.set('studentId', studentId);
  await fetch(url.toString(), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}
// Service layer for Parent Portal API interactions
// Uses Firebase ID token for authenticated endpoints

export interface RawStudentDoc {
  id: string;
  fullName?: string;
  dateOfBirth?: string; // ISO date stored in Firestore (string)
  gender?: string;
  parentUID?: string;
}

export interface ChildEnriched {
  id: string;
  name: string;
  nameEn: string; // temporary fallback = name until English provided
  class?: string; // will be filled later via enrollments (not in step 1)
  classEn?: string;
  classId?: string; // Added for homework fetching
  birthDate?: string;
  age?: string; // computed
  parentUID?: string;
  photo?: string;
}

export interface StudentAttendanceRecord {
  date: string; // YYYY-MM-DD
  academicYear: string;
  classId: string;
  className: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  teacherUID: string;
}

export interface StudentAttendanceHistoryResponse {
  studentId: string;
  records: StudentAttendanceRecord[];
  stats: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: string; // percentage string with 1 decimal
  };
}

const CF_BASE = 'https://us-central1-future-step-nursery.cloudfunctions.net';

function computeAge(dateISO?: string): string | undefined {
  if (!dateISO) return undefined;
  const dob = new Date(dateISO);
  if (isNaN(dob.getTime())) return undefined;
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const mDiff = now.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) years--;
  return years >= 0 ? `${years}` : undefined;
}

// Step 1: fetch children (unauthenticated CF currently, needs parentUID in body)
export async function fetchChildren(token: string, parentUID: string): Promise<ChildEnriched[]> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${CF_BASE}/getChildrenByParentUID`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ parentUID })
  });
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(`Failed to fetch children (${res.status}) ${text}`);
  }
  const data = await res.json();
  interface RawChild {
    id: string;
    fullName?: string;
    name?: string;
    dateOfBirth?: string;
    parentUID?: string;
    gender?: string;
    enrollment?: {
      classId?: string;
      className?: string;
      academicYear?: string;
    };
  }
  const children = (data.children || []) as RawChild[];
  return children.map(c => ({
    id: c.id,
    name: c.fullName || c.name || c.id,
    nameEn: c.fullName || c.name || c.id,
    birthDate: c.dateOfBirth,
    age: computeAge(c.dateOfBirth),
    parentUID: c.parentUID,
    photo: c.gender === 'Female' ? '👧' : '👦',
    // Use enrollment information if available
    class: c.enrollment?.className,
    classEn: c.enrollment?.className,
    classId: c.enrollment?.classId
  }));
}

export async function fetchStudentAttendanceHistory(token: string, studentId: string): Promise<StudentAttendanceHistoryResponse | null> {
  const url = new URL(`${CF_BASE}/getStudentAttendanceHistory`);
  url.searchParams.set('studentId', studentId);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 403) return null;
    const text = await res.text().catch(()=> '');
    throw new Error(`Failed to fetch attendance history (${res.status}) ${text}`);
  }
  const data = await res.json();
  return data?.data || null;
}

// Homework Types
export interface HomeworkItem {
  id: string;
  classId: string;
  subjectId: string;
  teacherUID: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  teacherInfo: {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber?: string;
  };
}

export interface HomeworkListResponse {
  homework: HomeworkItem[];
}

export async function fetchHomeworkByClass(token: string, classId: string): Promise<HomeworkItem[]> {
  const url = new URL(`${CF_BASE}/listHomeworkByClass`);
  url.searchParams.set('classId', classId);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(`Failed to fetch homework (${res.status}) ${text}`);
  }
  const data: HomeworkListResponse = await res.json();
  return data.homework || [];
}

// Get enrollment information for a student to find their classId
export async function fetchStudentEnrollment(token: string, studentId: string, academicYear?: string): Promise<{classId?: string, className?: string} | null> {
  try {
    const url = new URL(`${CF_BASE}/listEnrollments`);
    url.searchParams.set('studentUID', studentId);
    url.searchParams.set('limit', '10');
  if (academicYear) url.searchParams.set('academicYear', academicYear);
    
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch enrollment for student ${studentId}: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    const enrollments = data.enrollments || [];
    
    if (enrollments.length === 0) {
      return null;
    }
    
    // Get the most recent enrollment
  const enrollment = enrollments[0];
    return {
      classId: enrollment.classId || enrollment.class, // Try classId first, fallback to class name
      className: enrollment.class || enrollment.className
    };
  } catch (error) {
    console.warn(`Error fetching enrollment for student ${studentId}:`, error);
    return null;
  }
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  classId: string;
  academicYear: string;
  authorId: string;
  authorName?: string; // Added field
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}


export async function fetchAnnouncements(token: string, academicYear: string, classId: string): Promise<Announcement[]> {
  const url = new URL(`${CF_BASE}/manageAnnouncements`);
  url.searchParams.set('operation', 'listAnnouncements');
  url.searchParams.set('academicYear', academicYear);
  url.searchParams.set('classId', classId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch announcements (${res.status}) ${text}`);
  }

  const data = await res.json();
  return data || [];
}
