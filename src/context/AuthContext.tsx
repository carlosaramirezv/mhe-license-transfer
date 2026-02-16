import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  canPerformTransfers: boolean;
  canUploadBatches: boolean;
  canViewAuditLog: boolean;
  canExportAuditLog: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleHierarchy: Record<UserRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('iat_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return { ...parsed, lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined };
    }
    return mockUsers[0];
  });

  const login = useCallback((email: string): boolean => {
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      const userWithLogin = { ...foundUser, lastLogin: new Date() };
      setUser(userWithLogin);
      localStorage.setItem('iat_user', JSON.stringify(userWithLogin));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('iat_user');
  }, []);

  const hasPermission = useCallback((requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[user.role];

    return roles.some(role => userLevel >= roleHierarchy[role]);
  }, [user]);

  const canPerformTransfers = user?.role === 'operator' || user?.role === 'admin';
  const canUploadBatches = user?.role === 'operator' || user?.role === 'admin';
  const canViewAuditLog = true;
  const canExportAuditLog = user?.role === 'operator' || user?.role === 'admin';
  const canManageUsers = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        canPerformTransfers,
        canUploadBatches,
        canViewAuditLog,
        canExportAuditLog,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
