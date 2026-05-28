import { Link } from 'react-router-dom';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useTopMovers } from '@/hooks/useTopMovers';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency } from '@/lib/format';
import {
  getMovementMarker,
  getMovementLabel,
  getMovementSignedQuantity,
  getMovementCounterparty,
} from '@/lib/utils/movement-display';
import { formatDistanceToNow } from 'date-fns';
import type { MovementType } from '@/types/api';

export function ActivityAndMoversSection() {
  const { data: activity, isLoading: actLoading, isError: actError } = useRecentActivity();
  const { data: movers, isLoading: movLoading, isError: movError } = useTopMovers();

  const maxUnits = movers?.length
    ? Math.max(...movers.map((m) => parseFloat(m.unitsSold) || 0))
    : 0;

  return (
    <div className="flex flex-col gap-0 divide-y divide-ink-900/10 dark:divide-ink-50/10">
      {/* 01 RECENT ACTIVITY */}
      <div className="py-8 px-8">
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">01</span> RECENT ACTIVITY
        </p>

        {actError && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 py-2">
            · Could not load activity
          </p>
        )}

        {actLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-ink-900/10 dark:border-ink-50/10">
              <SkeletonLine className="h-3.5 w-3/4 mb-1.5" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          ))}

        {!actLoading && !actError &&
          activity?.map((m) => {
            const marker = getMovementMarker(m.movementType as MovementType);
            const label = getMovementLabel(m.movementType as MovementType);
            const signed = getMovementSignedQuantity(m.quantity, m.movementType as MovementType);
            const from = getMovementCounterparty(m, 'from');
            const to = getMovementCounterparty(m, 'to');
            const ago = formatDistanceToNow(new Date(m.createdAt), { addSuffix: true });

            return (
              <div
                key={m.id}
                className="py-3 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="font-mono text-xs text-ink-400 dark:text-ink-500 mt-0.5 shrink-0">
                      {marker}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="eyebrow text-ink-500 dark:text-ink-400 shrink-0">
                          {label.toUpperCase()}
                        </span>
                        <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 truncate">
                          {m.product.name}
                          {m.product.sizeMl ? (
                            <span className="font-normal text-ink-400 dark:text-ink-500">
                              {' '}
                              {m.product.sizeMl}ml
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <p className="text-xs text-ink-400 dark:text-ink-500 font-sans mt-0.5">
                        {from} → {to}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 tabular-nums">
                      {signed}
                    </p>
                    <p className="text-xs font-sans text-ink-400 dark:text-ink-500 mt-0.5">
                      {ago}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

        {!actLoading && !actError && activity?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans py-2">No movements recorded.</p>
        )}

        <div className="mt-4">
          <Link
            to="/inventory"
            className="text-xs font-sans font-medium text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors tracking-widest"
          >
            VIEW FULL LEDGER →
          </Link>
        </div>
      </div>

      {/* 02 TOP MOVERS — THIS WEEK */}
      <div className="py-8 px-8">
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">02</span> TOP MOVERS — THIS WEEK
        </p>

        {movError && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 py-2">
            · Could not load movers
          </p>
        )}

        {movLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-ink-900/10 dark:border-ink-50/10">
              <SkeletonLine className="h-3.5 w-2/3 mb-2" />
              <SkeletonLine className="h-2 w-full" />
            </div>
          ))}

        {!movLoading && !movError &&
          movers?.map((m, idx) => {
            const units = parseFloat(m.unitsSold) || 0;
            const barPct = maxUnits > 0 ? (units / maxUnits) * 100 : 0;

            return (
              <div
                key={m.productId}
                className="py-3 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0"
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="section-number w-5 text-right shrink-0 text-ink-400 dark:text-ink-500">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 truncate">
                        {m.productName}
                      </p>
                      <p className="text-xs text-ink-400 dark:text-ink-500 font-sans">{m.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 tabular-nums">
                      {units.toLocaleString()}u
                    </p>
                    <p className="text-xs text-ink-400 dark:text-ink-500 font-sans">
                      {fmtCurrency(m.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="h-px bg-ink-900/8 dark:bg-ink-50/8">
                  <div
                    className="h-0.5 bg-ink-900/30 dark:bg-ink-50/30 transition-all"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>
            );
          })}

        {!movLoading && !movError && movers?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans py-2">No sales this week.</p>
        )}
      </div>
    </div>
  );
}
