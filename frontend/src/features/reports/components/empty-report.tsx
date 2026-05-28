interface EmptyReportProps {
  headline: string;
  subline?: string;
}

export function EmptyReport({ headline, subline }: EmptyReportProps) {
  return (
    <div className="py-16 text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        {headline}
      </p>
      {subline && (
        <p className="text-sm font-sans text-ink-400 dark:text-ink-500">{subline}</p>
      )}
    </div>
  );
}
