import type { Transfer } from '@/types/api';

interface TransferLocationsSectionProps {
  transfer: Transfer;
}

export function TransferLocationsSection({ transfer }: TransferLocationsSectionProps) {
  return (
    <section className="mb-10">
      <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
        <span className="opacity-40">01</span> LOCATIONS
      </p>
      <dl className="grid grid-cols-2 gap-6">
        <div>
          <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-1">From</dt>
          <dd className="text-sm font-sans text-ink-900 dark:text-ink-100 font-medium">
            {transfer.fromLocation.name}
          </dd>
          <dd className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">
            {transfer.fromLocation.type.replace(/_/g, ' ')}
          </dd>
        </div>
        <div>
          <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-1">To</dt>
          <dd className="text-sm font-sans text-ink-900 dark:text-ink-100 font-medium">
            {transfer.toLocation.name}
          </dd>
          <dd className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">
            {transfer.toLocation.type.replace(/_/g, ' ')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
