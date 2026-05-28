import { useAuthStore } from '@/stores/auth.store';
import type { RoleName } from '@/types/api';

type Resource = 'products' | 'categories' | 'suppliers' | 'locations';

const MANAGE_ROLES: Record<Resource, RoleName[]> = {
  products: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
  categories: ['SUPER_ADMIN', 'ADMIN'],
  suppliers: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
  locations: ['SUPER_ADMIN', 'ADMIN'],
};

export function useCanManage(resource: Resource): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return (MANAGE_ROLES[resource] as string[]).includes(role);
}
