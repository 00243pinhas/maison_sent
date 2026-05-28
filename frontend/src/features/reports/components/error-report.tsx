interface ErrorReportProps {
  onRetry: () => void;
}

export function ErrorReport({ onRetry }: ErrorReportProps) {
  return (
    <div className="py-8">
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
        Could not load this report.{' '}
        <button
          type="button"
          onClick={onRetry}
          className="text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-50 transition-colors underline-offset-2 underline"
        >
          Retry
        </button>
      </p>
    </div>
  );
}
