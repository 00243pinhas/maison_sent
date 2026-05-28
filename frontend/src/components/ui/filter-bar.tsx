interface FilterBarProps {
  children: React.ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="flex items-center gap-5 px-8 py-4 border-b border-ink-900/10 dark:border-ink-50/10 flex-wrap">
      {children}
    </div>
  );
}
