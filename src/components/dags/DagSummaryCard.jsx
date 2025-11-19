import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDateTime } from '../../utils/formatters.js';

/**
 * DagSummaryCard - shows metadata details for DAG detail page.
 * @param {Object} props
 * @param {Object} props.dag
 */
function DagSummaryCard({ dag }) {
  if (!dag) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            DAG ID
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{dag.dag_id}</h2>
          <p className="mt-1 text-sm text-slate-500">{dag.description}</p>
        </div>
        <StatusBadge
          status={dag.is_paused ? 'paused' : dag.is_active ? 'running' : 'inactive'}
        />
      </div>
      <dl className="mt-6 grid gap-5 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Schedule
          </dt>
          <dd className="mt-1 text-slate-900">
            {dag.schedule_interval || 'Manual trigger'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Owner
          </dt>
          <dd className="mt-1 text-slate-900">
            {(dag.owners && dag.owners.join(', ')) || 'Not set'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Last parsed
          </dt>
          <dd className="mt-1 text-slate-900">
            {formatDateTime(dag.last_parsed_time)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Next run
          </dt>
          <dd className="mt-1 text-slate-900">
            {formatDateTime(dag.next_dagrun_data_interval_start)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {(dag.tags || []).map((tag) => (
          <span
            key={tag.name || tag}
            className="inline-flex rounded-full bg-slate-100 px-3 py-1"
          >
            #{tag.name || tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DagSummaryCard;
