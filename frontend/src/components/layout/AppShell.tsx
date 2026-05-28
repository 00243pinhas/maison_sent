import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '@/features/command-palette/command-palette';
import { usePaletteStore } from '@/features/command-palette/use-palette-store';
import { useGlobalShortcut } from '@/features/command-palette/use-global-shortcut';
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal';

const PAGE_TITLE_PREFIXES: Array<[string, string]> = [
  ['/dashboard', 'Dashboard'],
  ['/products', 'Products'],
  ['/categories', 'Categories'],
  ['/suppliers', 'Suppliers'],
  ['/locations', 'Locations'],
  ['/inventory', 'Inventory'],
  ['/transfers', 'Transfers'],
  ['/reports', 'Reports'],
  ['/notifications', 'Notifications'],
  ['/jobs', 'Background jobs'],
  ['/settings', 'Settings'],
];

function resolveTitle(pathname: string): string {
  const match = PAGE_TITLE_PREFIXES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : 'Maison Sent';
}

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setOpen: setPaletteOpen } = usePaletteStore();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handlePalette = useCallback(() => setPaletteOpen(true), [setPaletteOpen]);
  const handleShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);

  useGlobalShortcut({
    onPalette: handlePalette,
    onShortcuts: handleShortcuts,
    onNavigate: handleNavigate,
  });

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <Topbar title={resolveTitle(pathname)} />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="px-6 py-4 border-t border-ink-900/10 dark:border-ink-50/10">
          <p className="eyebrow text-ink-400 dark:text-ink-600">
            Maison Sent ERP &mdash; v8.0.6
          </p>
        </footer>
      </div>
      <CommandPalette />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
