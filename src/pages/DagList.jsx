import { useCallback, useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import DagListItem from '../components/dags/DagListItem.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { fetchDags } from '../utils/api.js';

const PAGE_DESC =
  'Browse every DAG in your deployment, filter by status, and dive into details quickly.';

/**
 * DagListPage - searchable catalog of DAGs with filter controls.
 */
function DagListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadDags = useCallback(() => fetchDags({ limit: 500 }), []);
  const {
    data,
    loading,
    error,
    reload
  } = useAsyncData(loadDags, []);

  const dags = data?.dags || [];

  const filtered = useMemo(() => {
    return dags.filter((dag) => {
      const matchesSearch =
        !searchTerm ||
        dag.dag_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dag.dag_display_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? !dag.is_paused
          : dag.is_paused;

      return matchesSearch && matchesStatus;
    });
  }, [dags, searchTerm, statusFilter]);

  return (
    <AppLayout
      title="DAG Directory"
      description={PAGE_DESC}
      actions={
        <button
          type="button"
          onClick={reload}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Refresh list
        </button>
      }
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="search"
              value={searchTerm}
              placeholder="Search by DAG ID or name..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 focus:border-slate-400 focus:outline-none"
            >
              <option value="all">All DAGs</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </section>

      {loading && <LoadingSpinner message="Loading DAGs..." />}
      {error && <ErrorAlert message={error.message} onRetry={reload} />}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No DAGs match your filters"
            description="Try adjusting your search or filters to see more results."
          />
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((dag) => (
            <DagListItem dag={dag} key={dag.dag_id} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default DagListPage;
