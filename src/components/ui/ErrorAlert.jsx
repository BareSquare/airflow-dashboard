import { AlertTriangle } from 'lucide-react';

/**
 * ErrorAlert - friendly message for API failures.
 * @param {Object} props
 * @param {string} props.message
 * @param {Function} [props.onRetry]
 */
function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertTriangle size={18} />
        {message}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorAlert;
