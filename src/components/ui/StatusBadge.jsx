import { getStatusClasses, formatStateLabel } from '../../utils/formatters.js';

/**
 * StatusBadge - shows a color-coded pill for status/state values.
 * @param {Object} props
 * @param {string} props.status
 * @param {'sm'|'md'} [props.size='md']
 */
function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${getStatusClasses(status)}`}>
      {formatStateLabel(status)}
    </span>
  );
}

export default StatusBadge;
