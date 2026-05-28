import { HeroSection } from '@/sections/HeroSection';
import { StockValueSection } from '@/sections/StockValueSection';
import { ActivityAndMoversSection } from '@/sections/ActivityAndMoversSection';
import { PendingAndLowStockSection } from '@/sections/PendingAndLowStockSection';
import { BranchPerformanceSection } from '@/sections/BranchPerformanceSection';

export function DashboardPage() {
  return (
    <div>
      <HeroSection />
      <StockValueSection />

      {/* Two-column body: left ~2/3, right ~1/3 */}
      <div className="flex divide-x divide-ink-900/10 dark:divide-ink-50/10 border-b border-ink-900/10 dark:border-ink-50/10">
        <div className="flex-[2] divide-y divide-ink-900/10 dark:divide-ink-50/10">
          <ActivityAndMoversSection />
        </div>
        <div className="flex-1 divide-y divide-ink-900/10 dark:divide-ink-50/10">
          <PendingAndLowStockSection />
        </div>
      </div>

      <BranchPerformanceSection />

      {/* Footer band */}
      <div className="px-8 py-4 border-t border-ink-900/10 dark:border-ink-50/10 flex items-center justify-between">
        <p className="eyebrow text-ink-400 dark:text-ink-600">MAISON SENT · INTERNAL</p>
        <p className="eyebrow text-ink-400 dark:text-ink-600">V 8.0.6 · BUILD 26.05</p>
      </div>
    </div>
  );
}
