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
  const children = (data.children || []) as any[];
  return children.map(c => ({
    id: c.id,
    name: c.fullName || c.name || c.id,
    nameEn: c.fullName || c.name || c.id,
    birthDate: c.dateOfBirth,
    age: computeAge(c.dateOfBirth),
    parentUID: c.parentUID,
    photo: c.gender === 'Female' ? '👧' : '👦'
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
