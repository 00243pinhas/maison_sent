import { useAuthStore } from '@/stores/auth.store';
import type { RoleName } from '@/types/api';

type Operation = 'receive' | 'sale' | 'return' | 'damage' | 'adjust' | 'reconcile';

const PERFORM_ROLES: Record<Operation, RoleName[]> = {
  receive: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
  sale: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'SALES_STAFF'],
  return: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_STAFF'],
  damage: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'WAREHOUSE_MANAGER'],
  adjust: ['SUPER_ADMIN', 'ADMIN'],
  reconcile: ['SUPER_ADMIN'],
};

export function useCanPerform(operation: Operation): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return (PERFORM_ROLES[operation] as string[]).includes(role);
}
