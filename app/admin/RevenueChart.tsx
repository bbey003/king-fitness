'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}): React.ReactElement {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="kfRevenue" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1f51e5" />
              <stop offset="100%" stopColor="#a3b6f5" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => v.slice(5)}
            stroke="rgba(255,255,255,0.4)"
            fontSize={11}
          />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: '#0a0d1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#kfRevenue)"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
