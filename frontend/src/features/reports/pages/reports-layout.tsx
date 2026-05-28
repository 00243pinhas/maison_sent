import { NavLink, useParams, Navigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth.store';
import { REPORTS, REPORT_GROUPS, getReport } from '../registry';
import type { RoleName } from '@/types/api';

function canAccess(allowedRoles: RoleName[] | 'ALL_AUTH', role: RoleName): boolean {
  if (allowedRoles === 'ALL_AUTH') return true;
  return allowedRoles.includes(role);
}

export function ReportsLayout() {
  const { slug } = useParams<{ slug?: string }>();
  const role = useAuthStore((s) => s.user?.role);

  if (!role) return null;

  const accessibleReports = REPORTS.filter((r) => canAccess(r.allowedRoles, role));

  if (!slug) {
    const first = accessibleReports[0];
    if (first) return <Navigate to={`/reports/${first.slug}`} replace />;
    return null;
  }

  const report = getReport(slug);

  if (!report) return <Navigate to="/reports" replace />;

  if (!canAccess(report.allowedRoles, role)) {
    const first = accessibleReports[0];
    if (first) return <Navigate to={`/reports/${first.slug}`} replace />;
    return null;
  }

  const { Component } = report;

  return (
    <div className="flex min-h-full">
      {/* Left nav */}
      <aside className="w-60 shrink-0 border-r border-ink-900/10 dark:border-ink-50/10 py-6">
        {REPORT_GROUPS.map((group) => {
          const groupReports = accessibleReports.filter((r) => r.group === group);
          if (groupReports.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              <p className="eyebrow text-ink-400 dark:text-ink-600 px-5 mb-1">{group}</p>
              {groupReports.map((r) => (
                <NavLink
                  key={r.slug}
                  to={`/reports/${r.slug}`}
                  className={({ isActive }) =>
                    cn(
                      'block px-5 py-2 text-sm font-sans transition-colors',
                      isActive
                        ? 'font-medium text-ink-900 dark:text-ink-50 bg-ink-900/5 dark:bg-ink-50/5'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100',
                    )
                  }
                >
                  {r.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </aside>

      {/* Report content */}
      <div className="flex-1 min-w-0">
        <Component />
      </div>
    </div>
  );
}
