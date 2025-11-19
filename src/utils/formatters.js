/**
 * Formats an ISO string into a short date/time representation.
 * @param {string} isoString
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Formats a duration in seconds to a human-readable form.
 * @param {number} seconds
 */
export const formatDuration = (seconds) => {
  if (seconds === undefined || seconds === null) return 'N/A';
  const totalSeconds = Math.max(0, Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!parts.length || secs) parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * Returns a friendly relative time (e.g., "5m ago").
 * @param {string} isoString
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (diffMinutes < 60) return `${diffMinutes}m ${diffMs >= 0 ? 'ago' : 'from now'}`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ${diffMs >= 0 ? 'ago' : 'from now'}`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ${diffMs >= 0 ? 'ago' : 'from now'}`;
};

const STATUS_COLOR_MAP = {
  success: 'bg-green-100 text-green-700 border-green-200',
  failed: 'bg-rose-100 text-rose-700 border-rose-200',
  running: 'bg-blue-100 text-blue-700 border-blue-200',
  queued: 'bg-amber-100 text-amber-700 border-amber-200',
  up_for_retry: 'bg-orange-100 text-orange-700 border-orange-200',
  skipped: 'bg-gray-200 text-gray-700 border-gray-300',
  paused: 'bg-slate-200 text-slate-700 border-slate-300',
  default: 'bg-slate-100 text-slate-700 border-slate-200'
};

/**
 * Maps Airflow status/state to a Tailwind class string.
 * @param {string} status
 */
export const getStatusClasses = (status) => {
  if (!status) return STATUS_COLOR_MAP.default;
  return STATUS_COLOR_MAP[status.toLowerCase()] || STATUS_COLOR_MAP.default;
};

/**
 * Returns a human-friendly label for DAG run states.
 * @param {string} state
 */
export const formatStateLabel = (state) => {
  if (!state) return 'Unknown';
  return state
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
};
