import type { NavigateFunction } from 'react-router-dom';
import type { RoleName } from '@/types/api';

export interface PaletteAction {
  id: string;
  label: string;
  shortcut?: string;
  handler: (navigate: NavigateFunction) => void;
  visibleRoles?: RoleName[] | 'ALL_AUTH';
}

export const PALETTE_ACTIONS: PaletteAction[] = [
  {
    id: 'new-transfer',
    label: 'New transfer',
    shortcut: '⇧N',
    handler: (navigate) => navigate('/transfers/new'),
    visibleRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
  },
  {
    id: 'receive-stock',
    label: 'Receive stock',
    handler: (navigate) => navigate('/inventory?action=receive'),
    visibleRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
  },
  {
    id: 'new-product',
    label: 'New product',
    handler: (navigate) => navigate('/products?new=true'),
    visibleRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    id: 'go-inventory',
    label: 'Go to inventory',
    shortcut: 'G I',
    handler: (navigate) => navigate('/inventory'),
    visibleRoles: 'ALL_AUTH',
  },
  {
    id: 'go-dashboard',
    label: 'Go to dashboard',
    shortcut: 'G D',
    handler: (navigate) => navigate('/dashboard'),
    visibleRoles: 'ALL_AUTH',
  },
];
