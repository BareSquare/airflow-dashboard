/**
 * MetricCard - displays a headline metric with optional change indicator.
 * @param {Object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.caption]
 * @param {number} [props.change] - percentage change vs prior value
 * @param {React.ComponentType} [props.icon]
 */
function MetricCard({ label, value, caption, change, icon: Icon }) {
  const changeColor =
    change === undefined
      ? 'text-slate-400'
      : change >= 0
      ? 'text-emerald-600'
      : 'text-rose-600';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className="rounded-full bg-slate-100 p-2 text-slate-500">
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        {change !== undefined && (
          <span className={changeColor}>
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
        {caption && <span className="text-slate-500">{caption}</span>}
      </div>
    </div>
  );
}

export default MetricCard;
