import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { TabToggle } from '@/components/ui/tab-toggle';
import { useCanPerform } from '@/lib/hooks/use-can-perform';
import { useInventoryValue } from '@/hooks/useInventoryValue';
import { ActionBar, type ActiveForm } from '../components/action-bar';
import { BalancesView } from '../components/balances-view';
import { MovementsView } from '../components/movements-view';
import { ReconcileButton } from '../components/reconcile-button';

const TABS = [
  { id: 'balances', label: 'Balances' },
  { id: 'movements', label: 'Movements' },
];

const VALID_ACTIONS: ActiveForm[] = ['receive', 'sale', 'return', 'damage', 'adjust'];

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'balances';
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  const canReconcile = useCanPerform('reconcile');
  const { data: invValue } = useInventoryValue();

  // Open a form if ?action= is present on mount (e.g. from command palette)
  useEffect(() => {
    const action = searchParams.get('action') as ActiveForm;
    if (action && VALID_ACTIONS.includes(action)) {
      setActiveForm(action);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('action');
          return next;
        },
        { replace: true },
      );
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProducts = invValue?.distinctProducts
    ? parseInt(invValue.distinctProducts)
    : null;
  const totalLocations = invValue?.distinctLocations
    ? parseInt(invValue.distinctLocations)
    : null;

  const subline =
    totalProducts !== null && totalLocations !== null
      ? `${totalProducts.toLocaleString()} products tracked across ${totalLocations.toLocaleString()} locations`
      : undefined;

  function handleTabChange(id: string) {
    setSearchParams({ tab: id }, { replace: true });
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subline={subline}
        action={canReconcile ? <ReconcileButton /> : undefined}
      />

      <ActionBar active={activeForm} onActiveChange={setActiveForm} />

      <div className="px-8 py-4 border-b border-ink-900/10 dark:border-ink-50/10">
        <TabToggle
          tabs={TABS}
          activeId={tab}
          onChange={handleTabChange}
        />
      </div>

      {tab === 'balances' ? <BalancesView /> : <MovementsView />}
    </div>
  );
}
