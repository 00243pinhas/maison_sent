import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User, Info } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePaletteStore } from '@/features/command-palette/use-palette-store';
import { KbdHint } from '@/components/ui/kbd-hint';
import { NotificationsBellDropdown } from '@/features/notifications/components/notifications-bell-dropdown';
import api from '@/lib/api';

interface TopbarProps {
  title: string;
}

function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/50 dark:bg-ink-900/70 data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[calc(100vw-2rem)] bg-ink-50 dark:bg-ink-800 border border-ink-900/10 dark:border-ink-50/10 p-8 focus:outline-none data-[state=open]:animate-fadeIn"
        >
          <Dialog.Title className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-6">
            About Maison Sent
          </Dialog.Title>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-sans text-ink-500 dark:text-ink-400">Version</dt>
              <dd className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">8.0.6</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-sans text-ink-500 dark:text-ink-400">Build</dt>
              <dd className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">2026-05-28</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs font-sans text-ink-400 dark:text-ink-600">
            Maison Sent · Internal ERP
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
          >
            Close
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Topbar({ title }: TopbarProps) {
  const { dark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { setOpen: setPaletteOpen } = usePaletteStore();
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // intentionally swallow — local state cleanup is more important than backend ACK
      console.warn('Logout API failed, clearing local session anyway:', e);
    } finally {
      logout();
      navigate('/login');
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-ink-50 dark:bg-ink-900 border-b border-ink-900/10 dark:border-ink-50/10">
        <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50 tracking-wide">
          {title}
        </p>

        <div className="flex items-center gap-3">
          {/* Search / palette trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center justify-between gap-3 h-8 px-3 min-w-[160px] border border-ink-900/15 dark:border-ink-50/15 text-ink-400 dark:text-ink-600 hover:text-ink-700 dark:hover:text-ink-300 hover:border-ink-900/30 dark:hover:border-ink-50/30 transition-colors"
          >
            <span className="text-sm font-sans">Search…</span>
            <KbdHint keys={['⌘', 'K']} />
          </button>

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-1.5 text-ink-400 hover:text-ink-900 dark:text-ink-500 dark:hover:text-ink-50 transition-colors"
          >
            {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </button>

          {/* Notifications bell */}
          <NotificationsBellDropdown />

          {/* User menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                aria-label="User menu"
                className="ml-1 flex items-center justify-center w-7 h-7 rounded-full bg-ink-900/10 dark:bg-ink-50/10 text-ink-600 dark:text-ink-400 hover:bg-ink-900/20 dark:hover:bg-ink-50/20 transition-colors"
              >
                <User size={13} strokeWidth={1.5} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="w-52 bg-ink-50 dark:bg-ink-900 border border-ink-900/15 dark:border-ink-50/15 shadow-lg z-50 py-1"
              >
                {user && (
                  <div className="px-3 py-2.5 border-b border-ink-900/10 dark:border-ink-50/10 mb-1">
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50 truncate">
                      {user.fullName}
                    </p>
                    <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">
                      {user.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}

                <DropdownMenu.Item
                  onSelect={() => setAboutOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-sans text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04] cursor-pointer outline-none transition-colors"
                >
                  <Info size={13} strokeWidth={1.5} />
                  About Maison Sent
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-sans text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04] cursor-pointer outline-none transition-colors disabled:opacity-50"
                >
                  <LogOut size={13} strokeWidth={1.5} />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
