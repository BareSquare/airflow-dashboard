import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import RunStatusChart from '../components/charts/RunStatusChart.jsx';
import DagRunsTable from '../components/dags/DagRunsTable.jsx';
import EventLogList from '../components/logs/EventLogList.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import {
  fetchDags,
  fetchDagRuns,
  fetchEventLogs
} from '../utils/api.js';
import { Activity, PlayCircle, PauseCircle, Tag } from 'lucide-react';

const DASHBOARD_DESC =
  'Track workload health, investigate failed DAGs, and keep an eye on recent event logs.';

/**
 * DashboardPage - workspace overview with metrics and quick health charts.
 */
function DashboardPage() {
  const [selectedDag, setSelectedDag] = useState('');

  const loadDags = useCallback(() => fetchDags({ limit: 200 }), []);
  const {
    data: dagResponse,
    loading: dagLoading,
    error: dagError,
    reload: reloadDags
  } = useAsyncData(loadDags, []);

  const dagOptions = dagResponse?.dags || [];

  useEffect(() => {
    if (!selectedDag && dagOptions.length) {
      setSelectedDag(dagOptions[0].dag_id);
    }
  }, [selectedDag, dagOptions]);

  const loadRuns = useCallback(() => {
    if (!selectedDag) {
      return Promise.resolve({ dag_runs: [] });
    }
    return fetchDagRuns(selectedDag, { limit: 15, order_by: '-execution_date' });
  }, [selectedDag]);

  const {
    data: runResponse,
    loading: runsLoading,
    error: runError,
    reload: reloadRuns
  } = useAsyncData(loadRuns, [selectedDag]);

  const loadLogs = useCallback(
    () => fetchEventLogs({ limit: 5, event: 'ERROR' }),
    []
  );
  const {
    data: logResponse,
    loading: logsLoading,
    error: logError,
    reload: reloadLogs
  } = useAsyncData(loadLogs, []);

  const metrics = useMemo(() => {
    const total = dagOptions.length;
    const active = dagOptions.filter((dag) => !dag.is_paused).length;
    const paused = total - active;
    const avgTags =
      total === 0
        ? 0
        : Math.round(
            (dagOptions.reduce((acc, dag) => acc + (dag.tags?.length || 0), 0) /
              total) *
              10
          ) / 10;

    return [
      {
        label: 'Total DAGs',
        value: total,
        caption: 'Tracked in workspace',
        icon: Activity
      },
      {
        label: 'Active',
        value: active,
        caption: 'Running on schedule',
        icon: PlayCircle
      },
      {
        label: 'Paused',
        value: paused,
        caption: 'Manually paused',
        icon: PauseCircle
      },
      {
        label: 'Avg tags per DAG',
        value: avgTags,
        caption: 'Helps discoverability',
        icon: Tag
      }
    ];
  }, [dagOptions]);

  const runData = runResponse?.dag_runs || [];
  const logs = logResponse?.event_logs || logResponse?.logs || [];

  const handleRefreshAll = () => {
    reloadDags();
    reloadRuns();
    reloadLogs();
  };

  return (
    <AppLayout title="Airflow Overview" description={DASHBOARD_DESC} actions={
      <button
        type="button"
        onClick={handleRefreshAll}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Refresh data
      </button>
    }>
      {dagLoading && <LoadingSpinner message="Loading DAG metrics..." />}
      {dagError && <ErrorAlert message={dagError.message} onRetry={reloadDags} />}

      {!dagLoading && !dagError && (
        <div className="space-y-10">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent run health
                  </h3>
                  <p className="text-sm text-slate-500">
                    Status distribution for the selected DAG.
                  </p>
                </div>
                <select
                  value={selectedDag}
                  onChange={(e) => setSelectedDag(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  {dagOptions.map((dag) => (
                    <option key={dag.dag_id} value={dag.dag_id}>
                      {dag.dag_display_name || dag.dag_id}
                    </option>
                  ))}
                </select>
              </div>
              {runsLoading && <LoadingSpinner message="Loading run history..." />}
              {runError && (
                <ErrorAlert message={runError.message} onRetry={reloadRuns} />
              )}
              {!runsLoading && !runError && (
                <div className="mt-6">
                  <RunStatusChart runs={runData} />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Latest event logs
                  </h3>
                  <p className="text-sm text-slate-500">
                    Only showing recent WARN/ERROR entries
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  onClick={reloadLogs}
                >
                  Refresh
                </button>
              </div>
              {logsLoading && (
                <LoadingSpinner message="Fetching event logs..." />
              )}
              {logError && (
                <ErrorAlert message={logError.message} onRetry={reloadLogs} />
              )}
              {!logsLoading && !logError && (
                <div className="mt-6">
                  <EventLogList logs={logs.slice(0, 5)} />
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Latest runs
                </h3>
                <p className="text-sm text-slate-500">
                  Auto-refresh every time you switch DAGs.
                </p>
              </div>
            </div>
            {runsLoading && <LoadingSpinner message="Loading runs..." />}
            {!runsLoading && !runData.length && (
              <p className="text-sm text-slate-500">No runs yet.</p>
            )}
            {!runsLoading && runData.length > 0 && (
              <DagRunsTable runs={runData} />
            )}
          </section>
        </div>
      )}
    </AppLayout>
  );
}

export default DashboardPage;
