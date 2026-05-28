import { cn } from '@/lib/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabToggleProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabToggle({ tabs, activeId, onChange }: TabToggleProps) {
  return (
    <div className="flex items-center gap-0">
      {tabs.map((tab, i) => (
        <span key={tab.id} className="flex items-center">
          {i > 0 && (
            <span className="mx-6 text-ink-300 dark:text-ink-600 select-none">·</span>
          )}
          <button
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'font-sans text-sm transition-colors',
              tab.id === activeId
                ? 'font-medium text-ink-900 dark:text-ink-50'
                : 'font-normal text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300',
            )}
          >
            {tab.label}
          </button>
        </span>
      ))}
    </div>
  );
}
