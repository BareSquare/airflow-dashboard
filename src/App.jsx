import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/Dashboard.jsx';
import DagListPage from './pages/DagList.jsx';
import DagDetailPage from './pages/DagDetail.jsx';
import ErrorLogsPage from './pages/ErrorLogs.jsx';
import NotFoundPage from './pages/NotFound.jsx';

/**
 * App - defines routing configuration for the dashboard.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dags" element={<DagListPage />} />
      <Route path="/dags/:dagId" element={<DagDetailPage />} />
      <Route path="/errors" element={<ErrorLogsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
