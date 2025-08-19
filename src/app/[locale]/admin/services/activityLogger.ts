import { RecentActivity } from '../types/admin.types';

class ActivityLogger {
  private storageKey = 'nursery_admin_activities';
  private maxActivities = 50; // Keep only the latest 50 activities

  // Log a new activity
  logActivity(activity: Omit<RecentActivity, 'id' | 'timestamp'>) {
    const activities = this.getActivities();
    
    const newActivity: RecentActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleString('sv-SE', { 
        timeZone: 'Asia/Riyadh',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', ' ')
    };

    // Add to beginning of array (most recent first)
    activities.unshift(newActivity);

    // Keep only the latest activities
    if (activities.length > this.maxActivities) {
      activities.splice(this.maxActivities);
    }

    // Save to localStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(activities));
    } catch (error) {
      console.warn('Failed to save activity to localStorage:', error);
    }

    return newActivity;
  }

  // Get all activities
  getActivities(): RecentActivity[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load activities from localStorage:', error);
    }
    return [];
  }

  // Get activities with pagination
  getActivitiesPaginated(limit: number = 10, offset: number = 0): {
    activities: RecentActivity[];
    total: number;
    hasMore: boolean;
  } {
    const allActivities = this.getActivities();
    const activities = allActivities.slice(offset, offset + limit);
    
    return {
      activities,
      total: allActivities.length,
      hasMore: offset + limit < allActivities.length
    };
  }

  // Clear all activities (for testing/reset)
  clearActivities() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear activities from localStorage:', error);
    }
  }

  // Initialize with some seed data if empty (for demo purposes)
  initializeWithSeedData(userEmail: string, userDisplayName: string) {
    const activities = this.getActivities();
    if (activities.length === 0) {
      // Add some initial activities to show the system is working
      this.logActivity({
        type: 'login',
        description: `Admin ${userDisplayName} logged into the system`,
        user: userEmail,
        userDisplayName: userDisplayName,
        metadata: { loginTime: new Date().toISOString() }
      });

      this.logActivity({
        type: 'system_backup',
        description: 'Daily system backup completed successfully',
        user: 'system',
        userDisplayName: 'System',
        metadata: { automated: true }
      });
    }
  }
}

// Export singleton instance
export const activityLogger = new ActivityLogger();

// Helper functions for common activity types
export const ActivityHelpers = {
  // User management activities
  userCreated: (userEmail: string, currentUser: string, currentUserDisplayName: string, targetUserEmail: string, role: string) => {
    activityLogger.logActivity({
      type: 'user_created',
      description: `New ${role} account created: ${targetUserEmail}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: targetUserEmail,
      targetName: targetUserEmail,
      metadata: { role, targetEmail: targetUserEmail }
    });
  },

  userUpdated: (currentUser: string, currentUserDisplayName: string, targetUserEmail: string, changes: string[]) => {
    activityLogger.logActivity({
      type: 'user_updated',
      description: `User ${targetUserEmail} updated: ${changes.join(', ')}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: targetUserEmail,
      targetName: targetUserEmail,
      metadata: { changes }
    });
  },

  userDeleted: (currentUser: string, currentUserDisplayName: string, targetUserEmail: string) => {
    activityLogger.logActivity({
      type: 'user_deleted',
      description: `User account deleted: ${targetUserEmail}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: targetUserEmail,
      targetName: targetUserEmail
    });
  },

  // Student management activities
  studentCreated: (currentUser: string, currentUserDisplayName: string, studentName: string, studentId: string) => {
    activityLogger.logActivity({
      type: 'student_created',
      description: `New student registered: ${studentName}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: studentId,
      targetName: studentName
    });
  },

  studentUpdated: (currentUser: string, currentUserDisplayName: string, studentName: string, studentId: string, changes: string[]) => {
    activityLogger.logActivity({
      type: 'student_updated',
      description: `Student ${studentName} updated: ${changes.join(', ')}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: studentId,
      targetName: studentName,
      metadata: { changes }
    });
  },

  studentDeleted: (currentUser: string, currentUserDisplayName: string, studentName: string, studentId: string) => {
    activityLogger.logActivity({
      type: 'student_deleted',
      description: `Student record deleted: ${studentName}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: studentId,
      targetName: studentName
    });
  },

  // Class management activities
  classCreated: (currentUser: string, currentUserDisplayName: string, className: string, classId: string, level: string) => {
    activityLogger.logActivity({
      type: 'class_created',
      description: `New class created: ${className} (${level})`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: classId,
      targetName: className,
      metadata: { level }
    });
  },

  classUpdated: (currentUser: string, currentUserDisplayName: string, className: string, classId: string, changes: string[]) => {
    activityLogger.logActivity({
      type: 'class_updated',
      description: `Class ${className} updated: ${changes.join(', ')}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: classId,
      targetName: className,
      metadata: { changes }
    });
  },

  classDeleted: (currentUser: string, currentUserDisplayName: string, className: string, classId: string) => {
    activityLogger.logActivity({
      type: 'class_deleted',
      description: `Class deleted: ${className}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: classId,
      targetName: className
    });
  },

  // Teacher assignment activities
  teacherAssigned: (currentUser: string, currentUserDisplayName: string, teacherName: string, className: string, subjects: string[]) => {
    activityLogger.logActivity({
      type: 'teacher_assigned',
      description: `Teacher ${teacherName} assigned to ${className} for ${subjects.join(', ')}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetName: `${teacherName} → ${className}`,
      metadata: { teacherName, className, subjects }
    });
  },

  teacherUnassigned: (currentUser: string, currentUserDisplayName: string, teacherName: string, className: string) => {
    activityLogger.logActivity({
      type: 'teacher_unassigned',
      description: `Teacher ${teacherName} unassigned from ${className}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetName: `${teacherName} → ${className}`,
      metadata: { teacherName, className }
    });
  },

  // Enrollment activities
  enrollmentCreated: (currentUser: string, currentUserDisplayName: string, studentName: string, className: string, enrollmentId: string) => {
    activityLogger.logActivity({
      type: 'enrollment_created',
      description: `Student ${studentName} enrolled in ${className}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: enrollmentId,
      targetName: `${studentName} → ${className}`,
      metadata: { studentName, className }
    });
  },

  enrollmentUpdated: (currentUser: string, currentUserDisplayName: string, studentName: string, className: string, enrollmentId: string, changes: string[]) => {
    activityLogger.logActivity({
      type: 'enrollment_updated',
      description: `Enrollment updated for ${studentName} in ${className}: ${changes.join(', ')}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: enrollmentId,
      targetName: `${studentName} → ${className}`,
      metadata: { studentName, className, changes }
    });
  },

  enrollmentDeleted: (currentUser: string, currentUserDisplayName: string, studentName: string, className: string, enrollmentId: string) => {
    activityLogger.logActivity({
      type: 'enrollment_deleted',
      description: `Enrollment deleted: ${studentName} from ${className}`,
      user: currentUser,
      userDisplayName: currentUserDisplayName,
      targetId: enrollmentId,
      targetName: `${studentName} → ${className}`,
      metadata: { studentName, className }
    });
  },

  // System activities
  login: (userEmail: string, userDisplayName: string) => {
    activityLogger.logActivity({
      type: 'login',
      description: `${userDisplayName} logged into the admin portal`,
      user: userEmail,
      userDisplayName: userDisplayName,
      metadata: { loginTime: new Date().toISOString() }
    });
  },

  logout: (userEmail: string, userDisplayName: string) => {
    activityLogger.logActivity({
      type: 'logout',
      description: `${userDisplayName} logged out of the admin portal`,
      user: userEmail,
      userDisplayName: userDisplayName,
      metadata: { logoutTime: new Date().toISOString() }
    });
  }
};
