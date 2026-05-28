import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  align?: 'left' | 'right';
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: ReactNode;
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="py-3.5 border-b border-ink-900/10 dark:border-ink-50/10 pr-6">
          <div className="h-3.5 bg-ink-200 dark:bg-ink-700 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align === 'right' ? 'right' : 'left' }}
                className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 font-sans font-medium border-b border-ink-900/15 dark:border-ink-50/15"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} colCount={columns.length} />
            ))}

          {!isLoading &&
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={
                  onRowClick
                    ? 'cursor-pointer hover:bg-ink-900/[0.03] dark:hover:bg-ink-50/[0.03] transition-colors'
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align === 'right' ? 'right' : 'left' }}
                    className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100 max-w-0"
                  >
                    <div className="truncate" title={typeof col.accessor(row) === 'string' ? String(col.accessor(row)) : undefined}>
                      {col.accessor(row)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!isLoading && data.length === 0 && (
        <div className="py-16">{emptyState}</div>
      )}
    </div>
  );
}
