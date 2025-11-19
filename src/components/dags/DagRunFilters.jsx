const RUN_STATES = ['success', 'failed', 'running', 'queued', 'up_for_retry'];

/**
 * DagRunFilters - controls for filtering DAG runs.
 * @param {Object} props
 * @param {Object} props.filters
 * @param {Function} props.onChange
 */
function DagRunFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          State
        </label>
        <select
          value={filters.state || ''}
          onChange={(e) => handleChange('state', e.target.value || undefined)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        >
          <option value="">Any</option>
          {RUN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Start date (&ge;)
        </label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value || undefined)}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Start date (&le;)
        </label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value || undefined)}
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
  );
}

export default DagRunFilters;
