import { cn } from '@/lib/cn';
import { useCanPerform } from '@/lib/hooks/use-can-perform';
import { ReceiveForm } from './receive-form';
import { SaleForm } from './sale-form';
import { ReturnForm } from './return-form';
import { DamageForm } from './damage-form';
import { AdjustForm } from './adjust-form';

export type ActiveForm = 'receive' | 'sale' | 'return' | 'damage' | 'adjust' | null;

interface ActionBarProps {
  active: ActiveForm;
  onActiveChange: (form: ActiveForm) => void;
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 px-4 border border-ink-900/30 dark:border-ink-50/30 font-sans text-sm text-ink-900 dark:text-ink-50',
        'hover:border-ink-900 dark:hover:border-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors',
      )}
    >
      + {label}
    </button>
  );
}

export function ActionBar({ active, onActiveChange }: ActionBarProps) {
  const canReceive = useCanPerform('receive');
  const canSale = useCanPerform('sale');
  const canReturn = useCanPerform('return');
  const canDamage = useCanPerform('damage');
  const canAdjust = useCanPerform('adjust');

  return (
    <>
      <div className="flex items-center gap-3 px-8 py-4 border-b border-ink-900/10 dark:border-ink-50/10 flex-wrap">
        {canReceive && (
          <ActionButton label="Receive" onClick={() => onActiveChange('receive')} />
        )}
        {canSale && (
          <ActionButton label="Sale" onClick={() => onActiveChange('sale')} />
        )}
        {canReturn && (
          <ActionButton label="Return" onClick={() => onActiveChange('return')} />
        )}
        {canDamage && (
          <ActionButton label="Damage" onClick={() => onActiveChange('damage')} />
        )}
        {canAdjust && (
          <ActionButton label="Adjust" onClick={() => onActiveChange('adjust')} />
        )}
      </div>

      <ReceiveForm open={active === 'receive'} onClose={() => onActiveChange(null)} />
      <SaleForm open={active === 'sale'} onClose={() => onActiveChange(null)} />
      <ReturnForm open={active === 'return'} onClose={() => onActiveChange(null)} />
      <DamageForm open={active === 'damage'} onClose={() => onActiveChange(null)} />
      <AdjustForm open={active === 'adjust'} onClose={() => onActiveChange(null)} />
    </>
  );
}
