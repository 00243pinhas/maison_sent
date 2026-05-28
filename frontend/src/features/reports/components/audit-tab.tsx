import { useState, useMemo } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { INPUT_BASE } from '@/components/ui/field';
import { fmtDateTime } from '@/lib/format';
import { getMovementLabel, getMovementMarker } from '@/lib/utils/movement-display';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useReportAudit } from '../hooks/use-report-queries';
import type { DatePreset } from '../hooks/use-report-queries';
import type { MovementType } from '@/types/api';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'ADJUSTMENT_IN', label: 'Adjustment In' },
  { value: 'ADJUSTMENT_OUT', label: 'Adjustment Out' },
  { value: 'TRANSFER', label: 'Transfer' },
];

interface AuditTabProps {
  preset: DatePreset;
}

export function AuditTab({ preset }: AuditTabProps) {
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useReportAudit(preset);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((m) => {
      if (typeFilter && m.movementType !== typeFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          m.productName.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          (m.referenceNumber ?? '').toLowerCase().includes(q) ||
          m.performedByEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, typeFilter, debouncedSearch]);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-6 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product, SKU, or user…"
          className={`${INPUT_BASE} max-w-xs`}
        />
        <EditorialSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={TYPE_OPTIONS}
          className="w-44"
        />
        {data && (
          <span className="eyebrow text-ink-400 dark:text-ink-500 ml-auto">
            {filtered.length} of {data.length}
          </span>
        )}
      </div>

      {isError && <ErrorBox message="Could not load movement audit." />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonLine className="h-3.5 w-28" />
              <SkeletonLine className="h-3.5 w-40" />
              <SkeletonLine className="h-3.5 w-20" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Date', 'Product', 'Type', 'Qty', 'Location', 'Ref', 'User'].map((h) => (
                  <th
                    key={h}
                    className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 text-left border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02] transition-colors"
                >
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-400 dark:text-ink-500 whitespace-nowrap">
                    {fmtDateTime(m.createdAt)}
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 max-w-[200px]">
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100 truncate">
                      {m.productName}
                    </p>
                    <p className="font-mono text-xs text-ink-400 dark:text-ink-500">{m.sku}</p>
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 whitespace-nowrap">
                    <span className="eyebrow text-ink-500 dark:text-ink-400">
                      {getMovementMarker(m.movementType as MovementType)}{' '}
                      {getMovementLabel(m.movementType as MovementType)}
                    </span>
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100 tabular-nums text-right">
                    {m.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-500 dark:text-ink-400 max-w-[140px] truncate">
                    {m.fromLocationName ?? m.toLocationName ?? '—'}
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">
                    {m.referenceNumber ? (
                      <span className="font-mono text-xs text-ink-400 dark:text-ink-500">
                        {m.referenceNumber}
                      </span>
                    ) : (
                      <span className="text-ink-300 dark:text-ink-700">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-400 dark:text-ink-500 max-w-[140px] truncate">
                    {m.performedByEmail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length === 0 && !isError && (
        <p className="text-sm text-ink-400 font-sans py-8 text-center">
          No movements match the current filters.
        </p>
      )}
    </div>
  );
}
