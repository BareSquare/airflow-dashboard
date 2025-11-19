/**
 * LoadingSpinner - simple spinner used for loading states.
 * @param {Object} props
 * @param {string} [props.message]
 */
function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
