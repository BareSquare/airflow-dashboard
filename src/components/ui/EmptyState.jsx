/**
 * EmptyState - presented when no data exists after load.
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} [props.children]
 */
function EmptyState({ icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default EmptyState;
