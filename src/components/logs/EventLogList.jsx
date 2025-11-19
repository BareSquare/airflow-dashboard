import { AlertOctagon } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters.js';

/**
 * EventLogList - shows a list of Airflow event logs.
 * @param {Object} props
 * @param {Array} props.logs
 */
function EventLogList({ logs = [] }) {
  if (!logs.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No logs available for the selected filters.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {logs.map((log) => (
        <li
          key={log.id || `${log.event}-${log.when}`}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-rose-100 p-2 text-rose-500">
              <AlertOctagon size={18} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {log.event}
                  </p>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {log.owner || log.dag_id || 'Unknown DAG'}
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  {formatDateTime(log.when)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{log.extra || log.message}</p>
              <dl className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-3">
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-slate-400">
                    DAG
                  </dt>
                  <dd>{log.dag_id || 'n/a'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-slate-400">
                    Task
                  </dt>
                  <dd>{log.task_id || 'n/a'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-wide text-slate-400">
                    Owner
                  </dt>
                  <dd>{log.owner || 'n/a'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default EventLogList;
