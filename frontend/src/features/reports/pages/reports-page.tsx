import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { TabToggle } from '@/components/ui/tab-toggle';
import { DateRangeSelector } from '../components/date-range-selector';
import { OverviewTab } from '../components/overview-tab';
import { SalesTab } from '../components/sales-tab';
import { AuditTab } from '../components/audit-tab';
import { StockTab } from '../components/stock-tab';
import type { DatePreset } from '../hooks/use-report-queries';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sales', label: 'Sales & Branches' },
  { id: 'audit', label: 'Movement Log' },
  { id: 'stock', label: 'Stock Levels' },
];

const DATE_SENSITIVE_TABS = new Set(['overview', 'sales', 'audit']);

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';
  const preset = (searchParams.get('range') ?? '30d') as DatePreset;

  function setTab(id: string) {
    setSearchParams({ tab: id, range: preset }, { replace: true });
  }

  function setPreset(p: DatePreset) {
    setSearchParams({ tab, range: p }, { replace: true });
  }

  return (
    <div>
      <PageHeader title="Reports" />

      {/* Tab + date range bar */}
      <div className="px-8 py-4 border-b border-ink-900/10 dark:border-ink-50/10 flex items-center justify-between gap-6">
        <TabToggle tabs={TABS} activeId={tab} onChange={setTab} />
        {DATE_SENSITIVE_TABS.has(tab) && (
          <DateRangeSelector value={preset} onChange={setPreset} />
        )}
      </div>

      <div className="px-8 py-8">
        {tab === 'overview' && <OverviewTab preset={preset} />}
        {tab === 'sales' && <SalesTab preset={preset} />}
        {tab === 'audit' && <AuditTab preset={preset} />}
        {tab === 'stock' && <StockTab />}
      </div>
    </div>
  );
}
