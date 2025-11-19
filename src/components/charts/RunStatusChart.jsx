import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { formatStateLabel } from '../../utils/formatters.js';

/**
 * RunStatusChart - stacked bar of run states.
 * @param {Object} props
 * @param {Array} props.runs
 */
function RunStatusChart({ runs = [] }) {
  const data = useMemo(() => {
    const counts = runs.reduce((acc, run) => {
      const key = run.state?.toLowerCase() || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([state, value]) => ({
      state,
      label: formatStateLabel(state),
      value
    }));
  }, [runs]);

  if (!data.length) {
    return (
      <p className="text-sm text-slate-500">
        No recent runs to visualize.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          formatter={(value, _name, { payload }) => [`${value} runs`, payload.label]}
        />
        <Bar
          dataKey="value"
          fill="#0f172a"
          radius={[8, 8, 0, 0]}
          maxBarSize={45}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default RunStatusChart;
