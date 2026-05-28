import { useQuery } from '@tanstack/react-query';
import { subWeeks } from 'date-fns';
import api from '@/lib/api';

export interface SparklinePoint {
  period: string;
  totalRevenue: number;
}

export function useSalesByPeriod() {
  const from = subWeeks(new Date(), 13).toISOString();
  const to = new Date().toISOString();

  return useQuery({
    queryKey: ['reports', 'sales-by-period', 'sparkline', from],
    queryFn: async () => {
      const { data } = await api.get<Array<{ period: string; totalRevenue: string }>>(
        '/reports/sales-by-period',
        { params: { interval: 'week', from, to } },
      );
      return data.map((d) => ({
        period: d.period,
        totalRevenue: parseFloat(d.totalRevenue) || 0,
      }));
    },
  });
}
