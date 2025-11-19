import StatusBadge from '../ui/StatusBadge.jsx';
import { formatDateTime, formatDuration } from '../../utils/formatters.js';

/**
 * TaskInstanceList - renders task details for a DAG run.
 * @param {Object} props
 * @param {Array} props.tasks
 */
function TaskInstanceList({ tasks = [] }) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-slate-500">
        No task instances available for this run.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-5 py-3">Task ID</th>
            <th className="px-5 py-3">State</th>
            <th className="px-5 py-3">Start</th>
            <th className="px-5 py-3">End</th>
            <th className="px-5 py-3 text-right">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {tasks.map((task) => {
            const duration =
              task.end_date && task.start_date
                ? (new Date(task.end_date) - new Date(task.start_date)) / 1000
                : null;
            return (
              <tr key={task.task_id}>
                <td className="px-5 py-4 font-mono text-xs text-slate-600">
                  {task.task_id}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={task.state} size="sm" />
                </td>
                <td className="px-5 py-4">{formatDateTime(task.start_date)}</td>
                <td className="px-5 py-4">{formatDateTime(task.end_date)}</td>
                <td className="px-5 py-4 text-right text-slate-900">
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

export default TaskInstanceList;
