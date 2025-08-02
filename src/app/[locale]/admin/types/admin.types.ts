import { UserRole } from '../../../../utils/rolePermissions';

export interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  pendingFees: number;
  monthlyRevenue: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignIn?: string;
  customClaims: {
    role: UserRole;
    [key: string]: unknown;
  };
}

export interface UserFormData {
  email: string;
  displayName: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
}

export interface UserClaims {
  role?: UserRole;
  [key: string]: unknown;
}
