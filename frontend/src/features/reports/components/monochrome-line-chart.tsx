import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useThemeStore } from '@/stores/theme.store';

interface MonochromeLineChartProps {
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  xFormat?: (v: unknown) => string;
  yFormat?: (v: unknown) => string;
  height?: number;
}

export function MonochromeLineChart({
  data,
  xKey,
  yKey,
  xFormat,
  yFormat,
  height = 220,
}: MonochromeLineChartProps) {
  const { dark } = useThemeStore();
  const ink = dark ? '#f0ede9' : '#1a1917';
  const inkFaint = dark ? 'rgba(240,237,233,0.08)' : 'rgba(26,25,23,0.06)';
  const tooltipBg = dark ? '#1a1917' : '#faf9f7';
  const tooltipBorder = dark ? 'rgba(240,237,233,0.12)' : 'rgba(26,25,23,0.12)';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          horizontal
          vertical={false}
          stroke={inkFaint}
          strokeDasharray="0"
        />
        <XAxis
          dataKey={xKey}
          tickFormatter={xFormat}
          tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fill: ink, opacity: 0.4 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={yFormat}
          tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fill: ink, opacity: 0.4 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 0,
            fontSize: 12,
            fontFamily: '"Courier New", Courier, monospace',
            color: ink,
            boxShadow: 'none',
            padding: '8px 12px',
          }}
          formatter={yFormat ? (v: unknown) => [yFormat(v), ''] : undefined}
          labelFormatter={xFormat ? (v: unknown) => String(xFormat(v)) : undefined}
          cursor={{ stroke: inkFaint, strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={ink}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: ink, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
