import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

/**
 * NotFoundPage - fallback UI for unknown routes.
 */
function NotFoundPage() {
  return (
    <AppLayout title="Not found" description="The page you requested does not exist.">
      <EmptyState
        title="We searched everywhere"
        description="Double-check the URL or head back to the dashboard."
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go home
        </Link>
      </EmptyState>
    </AppLayout>
  );
}

export default NotFoundPage;
