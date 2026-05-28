import { useEffect } from 'react';

interface UseGlobalShortcutOptions {
  onPalette: () => void;
  onShortcuts: () => void;
  onNavigate: (path: string) => void;
}

const NAV_KEYS: Record<string, string> = {
  d: '/dashboard',
  i: '/inventory',
  t: '/transfers',
  r: '/reports',
};

export function useGlobalShortcut({ onPalette, onShortcuts, onNavigate }: UseGlobalShortcutOptions) {
  useEffect(() => {
    let pendingG = false;
    let gTimeout: number | null = null;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // ⌘K / Ctrl+K — open command palette from anywhere
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onPalette();
        return;
      }

      if (isInput) return;

      // '?' — show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        onShortcuts();
        return;
      }

      // 'g' then letter — navigation sequence (1s timeout)
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        pendingG = true;
        if (gTimeout !== null) clearTimeout(gTimeout);
        gTimeout = window.setTimeout(() => {
          pendingG = false;
          gTimeout = null;
        }, 1000);
        return;
      }

      if (pendingG) {
        if (gTimeout !== null) {
          clearTimeout(gTimeout);
          gTimeout = null;
        }
        pendingG = false;
        const path = NAV_KEYS[e.key];
        if (path) {
          e.preventDefault();
          onNavigate(path);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gTimeout !== null) clearTimeout(gTimeout);
    };
  }, [onPalette, onShortcuts, onNavigate]);
}
