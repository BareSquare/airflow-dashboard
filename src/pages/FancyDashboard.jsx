import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { CalendarDays, RefreshCw, Search, BarChart3, ChevronDown } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import DurationComparisonChart from '../components/charts/DurationComparisonChart.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { fetchDags, fetchDagRuns } from '../utils/api.js';
import { formatDuration } from '../utils/formatters.js';

const PAGE_DESC =
  'Compare DAG execution durations over flexible time windows with quick filtering.';

const TIME_FILTERS = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last month', days: 30 },
  { id: '90d', label: 'Last quarter', days: 90 },
  { id: '365d', label: 'Last year', days: 365 },
  { id: 'custom', label: 'Custom range' }
];

const MAX_RUN_LOOKUP = 200;

/**
 * Returns ISO start/end range when subtracting a number of days from now.
 * @param {number} days
 */
const buildRangeFromDays = (days) => {
  const now = new Date();
  const end = now.toISOString();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString(),
    endDate: end
  };
};

/**
 * Summarizes total and average run durations for a DAG.
 * @param {Array} runs
 */
const summarizeRunDurations = (runs = []) => {
  const durations = runs
    .map((run) => {
      if (!run?.start_date || !run?.end_date) {
        return null;
      }
      const start = new Date(run.start_date).getTime();
      const end = new Date(run.end_date).getTime();
      const seconds = (end - start) / 1000;
      if (!Number.isFinite(seconds) || seconds < 0) {
        return null;
      }
      return seconds;
    })
    .filter((duration) => duration !== null);

  const totalSeconds = durations.reduce((sum, value) => sum + value, 0);
  const averageSeconds = durations.length ? totalSeconds / durations.length : 0;

  return {
    totalSeconds,
    averageSeconds,
    runCount: durations.length
  };
};

/**
 * FancyDashboardPage - advanced comparison dashboard with DAG and time filters.
 */
function FancyDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDagIds, setSelectedDagIds] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [statsReloadKey, setStatsReloadKey] = useState(0);
  const [dagStats, setDagStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [timeFilterOpen, setTimeFilterOpen] = useState(true);
  const [dagFilterOpen, setDagFilterOpen] = useState(true);
  const initialSelectionApplied = useRef(false);
  const selectAllCheckboxRef = useRef(null);

  const loadDags = useCallback(() => fetchDags({ limit: 500 }), []);
  const {
    data,
    loading: dagLoading,
    error: dagError,
    reload: reloadDags
  } = useAsyncData(loadDags, []);

  const dagOptions = data?.dags || [];

  const dagLookup = useMemo(() => {
    return dagOptions.reduce((acc, dag) => {
      acc[dag.dag_id] = dag.dag_display_name || dag.dag_id;
      return acc;
    }, {});
  }, [dagOptions]);

  const filteredDags = useMemo(() => {
    if (!searchTerm) {
      return dagOptions;
    }
    const query = searchTerm.toLowerCase();
    return dagOptions.filter((dag) => {
      const displayName = dag.dag_display_name?.toLowerCase() || '';
      return (
        dag.dag_id.toLowerCase().includes(query) ||
        displayName.includes(query)
      );
    });
  }, [dagOptions, searchTerm]);

  const totalDagCount = dagOptions.length;
  const allSelected = totalDagCount > 0 && selectedDagIds.length === totalDagCount;
  const partiallySelected =
    selectedDagIds.length > 0 && selectedDagIds.length < totalDagCount;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        !allSelected && partiallySelected;
    }
  }, [allSelected, partiallySelected]);

  useEffect(() => {
    if (!initialSelectionApplied.current && dagOptions.length) {
      setSelectedDagIds(
        dagOptions.slice(0, Math.min(3, dagOptions.length)).map((dag) => dag.dag_id)
      );
      initialSelectionApplied.current = true;
    }
  }, [dagOptions]);

  useEffect(() => {
    setSelectedDagIds((prev) => {
      const valid = prev.filter((id) => dagLookup[id]);
      return valid.length === prev.length ? prev : valid;
    });
  }, [dagLookup]);

  const rangeInfo = useMemo(() => {
    if (timeFilter === 'custom') {
      if (!customStart || !customEnd) {
        return {
          startDate: null,
          endDate: null,
          error: 'Select both start and end dates for the custom range.'
        };
      }
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      if (!Number.isFinite(startDate.valueOf()) || !Number.isFinite(endDate.valueOf())) {
        return {
          startDate: null,
          endDate: null,
          error: 'Invalid custom date selection.'
        };
      }
      if (startDate > endDate) {
        return {
          startDate: null,
          endDate: null,
          error: 'Start date must be before end date.'
        };
      }
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        error: null
      };
    }

    const preset = TIME_FILTERS.find((option) => option.id === timeFilter);
    if (preset?.days) {
      return { ...buildRangeFromDays(preset.days), error: null };
    }

    return { startDate: null, endDate: null, error: null };
  }, [timeFilter, customStart, customEnd]);

  const { startDate: rangeStart, endDate: rangeEnd, error: rangeError } = rangeInfo;

  const rangeSummary = useMemo(() => {
    if (timeFilter === 'custom') {
      if (!customStart || !customEnd) {
        return 'Awaiting custom dates';
      }
      return `Custom: ${customStart} → ${customEnd}`;
    }
    return TIME_FILTERS.find((option) => option.id === timeFilter)?.label || '';
  }, [customEnd, customStart, timeFilter]);

  useEffect(() => {
    if (!selectedDagIds.length || !rangeStart || !rangeEnd) {
      setDagStats([]);
      setStatsError(null);
      setStatsLoading(false);
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const results = await Promise.all(
          selectedDagIds.map(async (dagId) => {
            const response = await fetchDagRuns(dagId, {
              limit: MAX_RUN_LOOKUP,
              order_by: '-execution_date',
              startDate: rangeStart,
              endDate: rangeEnd
            });
            const summary = summarizeRunDurations(response?.dag_runs || []);
            return {
              dagId,
              label: dagLookup[dagId] || dagId,
              ...summary
            };
          })
        );

        if (!cancelled) {
          setDagStats(results);
        }
      } catch (error) {
        if (!cancelled) {
          setStatsError(error);
          setDagStats([]);
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [dagLookup, rangeEnd, rangeStart, selectedDagIds, statsReloadKey]);

  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedDagIds([]);
    } else {
      setSelectedDagIds(dagOptions.map((dag) => dag.dag_id));
    }
  };

  const handleToggleDag = (dagId) => {
    setSelectedDagIds((prev) =>
      prev.includes(dagId)
        ? prev.filter((id) => id !== dagId)
        : [...prev, dagId]
    );
  };

  const handleExclusiveSelect = (dagId) => {
    setSelectedDagIds([dagId]);
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
    }
  };

  const handleRefreshAll = () => {
    reloadDags();
    setStatsReloadKey((key) => key + 1);
  };

  return (
    <AppLayout
      title="Fancy Dashboard"
      description={PAGE_DESC}
      actions={
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      }
    >
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Time filters</h2>
            <p className="text-sm text-slate-500">
              Define the time window applied to every metric in this dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTimeFilterOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900"
            aria-expanded={timeFilterOpen}
            aria-label={timeFilterOpen ? 'Collapse time filters' : 'Expand time filters'}
          >
            <ChevronDown
              size={18}
              className={`transition-transform ${timeFilterOpen ? '' : '-rotate-90'}`}
            />
          </button>
        </div>
        {timeFilterOpen && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {TIME_FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleTimeFilterChange(option.id)}
                  className={[
                    'rounded-full border px-4 py-2 text-sm transition-colors',
                    timeFilter === option.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  ].join(' ')}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {timeFilter === 'custom' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-slate-600">
                  Start date
                  <input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  End date
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </label>
              </div>
            )}
            {timeFilter === 'custom' && rangeError && (
              <p className="text-xs font-medium text-rose-600">{rangeError}</p>
            )}
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Current window:&nbsp;
              <span className="font-semibold text-slate-900">{rangeSummary}</span>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                DAG filters
              </h3>
              <p className="text-sm text-slate-500">
                Check multiple DAGs or click a name to isolate it for the charts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDagFilterOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900"
              aria-expanded={dagFilterOpen}
              aria-label={dagFilterOpen ? 'Collapse DAG filters' : 'Expand DAG filters'}
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${dagFilterOpen ? '' : '-rotate-90'}`}
              />
            </button>
          </div>
          {dagFilterOpen && (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search DAGs by ID or name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-slate-400 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-900">
                  {selectedDagIds.length} selected
                </span>
                <span>{totalDagCount} total</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    ref={selectAllCheckboxRef}
                    checked={allSelected}
                    onChange={handleSelectAllToggle}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  Select all DAGs
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedDagIds([])}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:text-slate-300"
                  disabled={!selectedDagIds.length}
                >
                  Clear
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200">
                {dagLoading && (
                  <LoadingSpinner message="Loading DAGs..." />
                )}
                {dagError && (
                  <div className="p-4">
                    <ErrorAlert message={dagError.message} onRetry={reloadDags} />
                  </div>
                )}
                {!dagLoading && !dagError && filteredDags.length === 0 && (
                  <div className="p-6 text-sm text-slate-500">
                    No DAGs match your search.
                  </div>
                )}
                {!dagLoading && !dagError && filteredDags.length > 0 && (
                  <ul className="divide-y divide-slate-200">
                    {filteredDags.map((dag) => {
                      const isSelected = selectedDagIds.includes(dag.dag_id);
                      return (
                        <li
                          key={dag.dag_id}
                          className={`flex items-center justify-between px-4 py-3 text-sm ${
                            isSelected ? 'bg-slate-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleDag(dag.dag_id)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleExclusiveSelect(dag.dag_id)}
                              className="text-left"
                            >
                              <div className="font-semibold text-slate-900">
                                {dagLookup[dag.dag_id]}
                              </div>
                              <div className="text-xs text-slate-500">
                                {dag.dag_id}
                                {dag.is_paused && (
                                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                    Paused
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            {dag.tags?.length || 0} tags
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Execution duration comparison
              </h3>
              <p className="text-sm text-slate-500">
                View the total runtime per DAG alongside the average runtime per execution.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
              Window: <span className="font-semibold text-slate-900">{rangeSummary}</span>
            </div>
            <div className="mt-6">
              {!selectedDagIds.length && (
                <EmptyState
                  icon={<BarChart3 />}
                  title="No DAGs selected"
                  description="Pick one or more DAGs from the filter area to populate the chart."
                />
              )}
              {selectedDagIds.length > 0 && timeFilter === 'custom' && rangeError && (
                <p className="text-sm text-rose-600">
                  {rangeError}
                </p>
              )}
              {selectedDagIds.length > 0 && !rangeError && statsLoading && (
                <LoadingSpinner message="Loading execution stats..." />
              )}
              {selectedDagIds.length > 0 && !rangeError && statsError && (
                <ErrorAlert
                  message={statsError.message || 'Failed to load statistics'}
                  onRetry={() => setStatsReloadKey((key) => key + 1)}
                />
              )}
              {selectedDagIds.length > 0 &&
                !rangeError &&
                !statsLoading &&
                !statsError &&
                dagStats.length === 0 && (
                  <EmptyState
                    icon={<BarChart3 />}
                    title="No completed runs"
                    description="There are no completed runs for the selected DAGs in this time range."
                  />
                )}
              {selectedDagIds.length > 0 &&
                !rangeError &&
                !statsLoading &&
                !statsError &&
                dagStats.length > 0 && (
                  <div className="mt-2">
                    <DurationComparisonChart stats={dagStats} />
                  </div>
                )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Selection details
                </h3>
                <p className="text-sm text-slate-500">
                  Track totals, averages, and run counts for each DAG.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {selectedDagIds.length} DAGs
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {selectedDagIds.length === 0 && (
                <p className="text-sm text-slate-500">
                  Choose at least one DAG to see detailed statistics.
                </p>
              )}
              {selectedDagIds.length > 0 && timeFilter === 'custom' && rangeError && (
                <p className="text-sm text-rose-600">{rangeError}</p>
              )}
              {selectedDagIds.length > 0 &&
                !rangeError &&
                !statsLoading &&
                !dagStats.length && (
                  <p className="text-sm text-slate-500">
                    No completed runs detected for the current filters.
                  </p>
                )}
              {dagStats.map((stat) => (
                <div
                  key={stat.dagId}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {stat.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {stat.runCount} completed runs
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-slate-500">Total</p>
                      <p className="text-base font-semibold text-slate-900">
                        {formatDuration(stat.totalSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Avg / run</p>
                      <p className="text-base font-semibold text-slate-900">
                        {formatDuration(stat.averageSeconds)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

export default FancyDashboardPage;
