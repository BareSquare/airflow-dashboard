import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { formatDuration } from '../../utils/formatters.js';

/**
 * DurationComparisonChart - compares total vs average run durations for each DAG.
 * @param {Object} props
 * @param {Array} props.stats - Array of { dagId, label, totalSeconds, averageSeconds }
 */
function DurationComparisonChart({ stats = [] }) {
  if (!stats.length) {
    return (
      <p className="text-sm text-slate-500">
        Select at least one DAG to populate the chart.
      </p>
    );
  }

  const chartData = stats.map((item) => ({
    dagId: item.dagId,
    label: item.label,
    totalMinutes: Number((item.totalSeconds / 60).toFixed(2)),
    averageMinutes: Number((item.averageSeconds / 60).toFixed(2))
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={chartData} maxBarSize={56}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#475569' }}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#475569' }}
          tickFormatter={(value) => `${value}m`}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          formatter={(value, name) => {
            const seconds = Number(value) * 60;
            return [
              formatDuration(seconds),
              name === 'totalMinutes'
                ? 'Total duration'
                : 'Average per run'
            ];
          }}
          labelFormatter={(label) => `DAG: ${label}`}
        />
        <Legend
          formatter={(value) =>
            value === 'totalMinutes'
              ? 'Total duration'
              : 'Average per run'
          }
        />
        <Bar
          dataKey="totalMinutes"
          name="totalMinutes"
          fill="#0f172a"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="averageMinutes"
          name="averageMinutes"
          fill="#818cf8"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DurationComparisonChart;
