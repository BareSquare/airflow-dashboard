import { Link } from 'react-router-dom';
import { Clock3, Play, Pause } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDateTime } from '../../utils/formatters.js';

/**
 * DagListItem - card describing a DAG summary in the list view.
 * @param {Object} props
 * @param {Object} props.dag
 */
function DagListItem({ dag }) {
  const isPaused = dag?.is_paused;
  const schedule = dag?.schedule_interval || 'Manual trigger';

  return (
    <Link
      to={`/dags/${encodeURIComponent(dag.dag_id)}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            DAG
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {dag.dag_display_name || dag.dag_id}
          </h3>
        </div>
        <StatusBadge status={isPaused ? 'paused' : 'running'} size="sm" />
      </div>
      <p className="mt-2 text-sm text-slate-500 line-clamp-2">
        {dag.description || 'No description provided.'}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Clock3 size={16} />
          <div>
            <dt className="text-xs uppercase tracking-wide">Schedule</dt>
            <dd className="text-slate-900">{schedule}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPaused ? (
            <Pause size={16} className="text-rose-500" />
          ) : (
            <Play size={16} className="text-emerald-500" />
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide">
              Last parsed
            </dt>
            <dd className="text-slate-900">{formatDateTime(dag.last_parsed_time)}</dd>
          </div>
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
    </Link>
  );
}

export default DagListItem;
