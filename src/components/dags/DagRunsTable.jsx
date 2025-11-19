import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDateTime, formatDuration } from '../../utils/formatters.js';

/**
 * DagRunsTable - renders a table of DAG runs.
 * @param {Object} props
 * @param {Array} props.runs
 * @param {Function} [props.onSelect]
 */
function DagRunsTable({ runs = [], onSelect }) {
  if (!runs.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No runs available for the selected DAG.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-5 py-3">Run ID</th>
            <th className="px-5 py-3">State</th>
            <th className="px-5 py-3">Execution Date</th>
            <th className="px-5 py-3">Start</th>
            <th className="px-5 py-3">End</th>
            <th className="px-5 py-3 text-right">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {runs.map((run) => {
            const duration =
              run.end_date && run.start_date
                ? (new Date(run.end_date) - new Date(run.start_date)) / 1000
                : null;
            return (
              <tr
                key={run.dag_run_id}
                className="hover:bg-slate-50"
                onClick={() => onSelect?.(run)}
              >
                <td className="px-5 py-4 font-mono text-xs text-slate-600">
                  {run.dag_run_id}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={run.state} size="sm" />
                </td>
                <td className="px-5 py-4">{formatDateTime(run.execution_date)}</td>
                <td className="px-5 py-4">{formatDateTime(run.start_date)}</td>
                <td className="px-5 py-4">{formatDateTime(run.end_date)}</td>
                <td className="px-5 py-4 text-right font-medium text-slate-900">
                  {formatDuration(duration)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DagRunsTable;
