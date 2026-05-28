interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-end gap-5 pt-4 border-t border-ink-900/10 dark:border-ink-50/10 mt-4">
      <p className="eyebrow text-ink-400 dark:text-ink-500">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-4">
        {page > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            className="text-sm font-sans text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-50 transition-colors"
          >
            ← prev
          </button>
        )}
        {page < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="text-sm font-sans text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-50 transition-colors"
          >
            next →
          </button>
        )}
      </div>
    </div>
  );
}
