import { useCallback, useState } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import EventLogList from '../components/logs/EventLogList.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { fetchEventLogs } from '../utils/api.js';

/**
 * ErrorLogsPage - displays filtered Airflow event log entries.
 */
function ErrorLogsPage() {
  const [filters, setFilters] = useState({ event: 'ERROR', limit: 25 });

  const loadLogs = useCallback(() => fetchEventLogs(filters), [filters]);
  const { data, loading, error, reload } = useAsyncData(loadLogs, [filters]);

  const logs = data?.event_logs || data?.logs || [];

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <AppLayout
      title="Event Logs"
      description="Review WARN/ERROR logs emitted by Airflow tasks."
      actions={
        <button
          type="button"
          onClick={reload}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Refresh logs
        </button>
      }
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Event type
            </label>
            <select
              value={filters.event || ''}
              onChange={(e) => handleChange('event', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              DAG ID
            </label>
            <input
              type="text"
              value={filters.dagId || ''}
              onChange={(e) => handleChange('dagId', e.target.value)}
              placeholder="example_dag"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Task ID
            </label>
            <input
              type="text"
              value={filters.taskId || ''}
              onChange={(e) => handleChange('taskId', e.target.value)}
              placeholder="load_into_dw"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Limit
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={filters.limit || 25}
              onChange={(e) => handleChange('limit', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {loading && <LoadingSpinner message="Loading logs..." />}
      {error && <ErrorAlert message={error.message} onRetry={reload} />}
      {!loading && !error && logs.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No logs found"
            description="Adjust filters to view more entries."
          />
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="mt-6">
          <EventLogList logs={logs} />
        </div>
      )}
    </AppLayout>
  );
}

export default ErrorLogsPage;
