import { SystemStats, RecentActivity } from '../types/admin.types';

// Mock data for demonstration
export const mockSystemStats: SystemStats = {
  totalStudents: 156,
  totalTeachers: 24,
  totalParents: 312,
  totalClasses: 12
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'user_created',
    description: 'New teacher account created for Ms. Fatima Al-Zahra',
    timestamp: '2025-08-09 14:30',
    user: 'admin@futurestep.edu.sa',
    userDisplayName: 'Admin User',
    targetName: 'Ms. Fatima Al-Zahra'
  },
  {
    id: '2',
    type: 'student_created',
    description: 'New student Ahmed Mohamed enrolled in KG1-A',
    timestamp: '2025-08-09 13:15',
    user: 'admin@futurestep.edu.sa',
    userDisplayName: 'Admin User',
    targetName: 'Ahmed Mohamed'
  },
  {
    id: '3',
    type: 'class_updated',
    description: 'Class capacity updated for KG2-B',
    timestamp: '2025-08-09 12:45',
    user: 'teacher@futurestep.edu.sa',
    userDisplayName: 'Teacher User',
    targetName: 'KG2-B'
  },
  {
    id: '4',
    type: 'enrollment_created',
    description: 'Student Sara Ali enrolled in Pre-KG class',
    timestamp: '2025-08-09 11:20',
    user: 'admin@futurestep.edu.sa',
    userDisplayName: 'Admin User',
    targetName: 'Sara Ali'
  },
  {
    id: '5',
    type: 'teacher_assigned',
    description: 'Teacher assigned to KG1-A for Mathematics subject',
    timestamp: '2025-08-09 10:00',
    user: 'admin@futurestep.edu.sa',
    userDisplayName: 'Admin User',
    targetName: 'KG1-A'
  }
];
