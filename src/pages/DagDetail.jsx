import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import DagSummaryCard from '../components/dags/DagSummaryCard.jsx';
import DagRunsTable from '../components/dags/DagRunsTable.jsx';
import DagRunFilters from '../components/dags/DagRunFilters.jsx';
import TaskInstanceList from '../components/dags/TaskInstanceList.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import {
  fetchDagDetails,
  fetchDagRuns,
  fetchTaskInstances
} from '../utils/api.js';
import { formatDateTime } from '../utils/formatters.js';

/**
 * DagDetailPage - deep dive into DAG metadata and run history.
 */
function DagDetailPage() {
  const { dagId } = useParams();
  const [filters, setFilters] = useState({ limit: 25 });
  const [selectedRunId, setSelectedRunId] = useState('');

  const loadDetails = useCallback(() => fetchDagDetails(dagId), [dagId]);
  const {
    data: dag,
    loading: dagLoading,
    error: dagError,
    reload: reloadDag
  } = useAsyncData(loadDetails, [dagId]);

  const loadRuns = useCallback(
    () => fetchDagRuns(dagId, filters),
    [dagId, filters]
  );
  const {
    data: runsResponse,
    loading: runsLoading,
    error: runError,
    reload: reloadRuns
  } = useAsyncData(loadRuns, [dagId, filters]);

  const runs = runsResponse?.dag_runs || [];

  useEffect(() => {
    if (!runs.length) {
      setSelectedRunId('');
      return;
    }
    const exists = runs.some((run) => run.dag_run_id === selectedRunId);
    if (!selectedRunId || !exists) {
      setSelectedRunId(runs[0].dag_run_id);
    }
  }, [runs, selectedRunId]);

  const loadTasks = useCallback(() => {
    if (!selectedRunId) {
      return Promise.resolve({ task_instances: [] });
    }
    return fetchTaskInstances(dagId, selectedRunId);
  }, [dagId, selectedRunId]);

  const {
    data: tasksResponse,
    loading: tasksLoading,
    error: tasksError,
    reload: reloadTasks
  } = useAsyncData(loadTasks, [dagId, selectedRunId]);

  const selectedRun = useMemo(
    () => runs.find((run) => run.dag_run_id === selectedRunId),
    [runs, selectedRunId]
  );

  return (
    <AppLayout
      title={dag?.dag_display_name || dagId}
      description="Inspect DAG metadata, run history, and task-level execution details."
      actions={
        <Link
          to="/dags"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          Back to DAGs
        </Link>
      }
    >
      {dagLoading && <LoadingSpinner message="Loading DAG details..." />}
      {dagError && (
        <ErrorAlert message={dagError.message} onRetry={reloadDag} />
      )}

      {!dagLoading && !dagError && (
        <div className="space-y-8">
          <DagSummaryCard dag={dag} />

          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                Runs
              </h3>
              <p className="text-sm text-slate-500">
                Filter runs by state or time range to narrow down investigations.
              </p>
            </div>
            <DagRunFilters filters={filters} onChange={setFilters} />

            {runError && (
              <ErrorAlert message={runError.message} onRetry={reloadRuns} />
            )}
            {runsLoading && <LoadingSpinner message="Loading runs..." />}
            {!runsLoading && !runError && (
              <DagRunsTable
                runs={runs}
                onSelect={(run) => setSelectedRunId(run.dag_run_id)}
              />
            )}
          </section>

          {selectedRun && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Run
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedRun.dag_run_id}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Executed at {formatDateTime(selectedRun.execution_date)}
                  </p>
                </div>
                <StatusBadge status={selectedRun.state} />
              </div>
              <dl className="mt-4 grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide">Start</dt>
                  <dd className="text-slate-900">
                    {formatDateTime(selectedRun.start_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">End</dt>
                  <dd className="text-slate-900">
                    {formatDateTime(selectedRun.end_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">Run type</dt>
                  <dd className="text-slate-900">{selectedRun.run_type}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-700">
                  Task Instances
                </h4>
                {tasksError && (
                  <ErrorAlert message={tasksError.message} onRetry={reloadTasks} />
                )}
                {tasksLoading && (
                  <LoadingSpinner message="Loading task instances..." />
                )}
                {!tasksLoading && !tasksError && (
                  <TaskInstanceList tasks={tasksResponse?.task_instances} />
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </AppLayout>
  );
}

export default DagDetailPage;
