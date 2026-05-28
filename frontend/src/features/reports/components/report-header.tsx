interface ReportHeaderProps {
  title: string;
  subline?: string;
  filter?: React.ReactNode;
}

export function ReportHeader({ title, subline, filter }: ReportHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h2 className="font-serif text-3xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
          {title}
        </h2>
        {subline && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mt-1">{subline}</p>
        )}
      </div>
      {filter && <div className="shrink-0">{filter}</div>}
    </div>
  );
}
