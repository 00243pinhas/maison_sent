import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  MapPin,
  Boxes,
  ArrowRightLeft,
  BarChart3,
  Bell,
  Settings,
  Cpu,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth.store';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  disabled?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: Tag },
  { label: 'Suppliers', path: '/suppliers', icon: Truck },
  { label: 'Locations', path: '/locations', icon: MapPin },
  { label: 'Inventory', path: '/inventory', icon: Boxes },
  { label: 'Transfers', path: '/transfers', icon: ArrowRightLeft },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Jobs', path: '/jobs', icon: Cpu, adminOnly: true },
  { label: 'Users', path: '/users', icon: Users, disabled: true },
  { label: 'Settings', path: '/settings', icon: Settings, disabled: true },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-[#0A0908] flex flex-col z-40">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <p className="font-serif text-white text-base font-medium tracking-widest uppercase">
          Maison Sent
        </p>
        <p className="eyebrow text-white/30 mt-1">ERP Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          // Jobs: only show (and enable) for SUPER_ADMIN
          if (item.adminOnly) {
            if (!isSuperAdmin) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 transition-colors',
                    isActive
                      ? 'bg-white text-[#0A0908]'
                      : 'text-white/70 hover:text-white hover:bg-white/5',
                  )
                }
              >
                <Icon size={16} strokeWidth={1.5} />
                <span className="text-sm font-sans font-medium">{item.label}</span>
              </NavLink>
            );
          }

          if (item.disabled) {
            return (
              <div
                key={item.path}
                className="flex items-center gap-3 px-3 py-2.5 text-white/25 cursor-not-allowed select-none"
              >
                <Icon size={16} strokeWidth={1.5} />
                <span className="text-sm font-sans font-medium">{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-white text-[#0A0908]'
                    : 'text-white/70 hover:text-white hover:bg-white/5',
                )
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              <span className="text-sm font-sans font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-6 py-5 border-t border-white/10">
        {user && (
          <>
            <p className="text-sm text-white/70 font-sans font-medium truncate">{user.fullName}</p>
            <p className="eyebrow text-white/30 mt-0.5">{user.role.replace(/_/g, ' ')}</p>
          </>
        )}
      </div>
    </aside>
  );
}
