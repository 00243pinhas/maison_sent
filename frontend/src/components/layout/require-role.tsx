import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import type { RoleName } from '@/types/api';

interface RequireRoleProps {
  role: RoleName;
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireRole({ role, children, redirectTo = '/' }: RequireRoleProps) {
  const userRole = useAuthStore((s) => s.user?.role);
  if (userRole !== role) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
