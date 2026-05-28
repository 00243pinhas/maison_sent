interface PageHeaderProps {
  title: string;
  subline?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subline, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between px-8 pt-8 pb-6 border-b border-ink-900/10 dark:border-ink-50/10">
      <div>
        <h1 className="font-serif text-4xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
          {title}
        </h1>
        {subline && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mt-1">{subline}</p>
        )}
      </div>
      {action && <div className="pb-1">{action}</div>}
    </div>
  );
}
