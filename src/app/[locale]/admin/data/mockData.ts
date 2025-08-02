import { SystemStats, RecentActivity } from '../types/admin.types';

// Mock data for demonstration
export const mockSystemStats: SystemStats = {
  totalStudents: 156,
  totalTeachers: 24,
  totalParents: 312,
  totalClasses: 12,
  pendingFees: 45000,
  monthlyRevenue: 234000
};

export const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'user_created',
    description: 'New teacher account created for Ms. Fatima Al-Zahra',
    timestamp: '2025-01-30 14:30',
    user: 'admin@futurestep.edu.sa'
  },
  {
    id: 2,
    type: 'fee_payment',
    description: 'Payment received for student Ahmed Mohamed (KG1-A)',
    timestamp: '2025-01-30 13:15',
    user: 'parent@example.com'
  },
  {
    id: 3,
    type: 'class_updated',
    description: 'Class schedule updated for KG2-B',
    timestamp: '2025-01-30 12:45',
    user: 'teacher@futurestep.edu.sa'
  },
  {
    id: 4,
    type: 'report_generated',
    description: 'Monthly attendance report generated',
    timestamp: '2025-01-30 11:20',
    user: 'admin@futurestep.edu.sa'
  },
  {
    id: 5,
    type: 'system_backup',
    description: 'Daily system backup completed successfully',
    timestamp: '2025-01-30 03:00',
    user: 'system'
  }
];
