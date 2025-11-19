import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTree, AlertTriangle } from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'DAGs', to: '/dags', icon: ListTree },
  { label: 'Error Logs', to: '/errors', icon: AlertTriangle }
];

/**
 * SidebarNav - left navigation rail for the dashboard.
 */
function SidebarNav() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white/90 backdrop-blur md:flex md:flex-col">
      <div className="px-6 py-5">
        <div className="text-xs uppercase tracking-wide text-slate-400">Airflow</div>
        <div className="text-lg font-semibold text-slate-900">Monitoring</div>
      </div>
      <nav className="flex-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        Status: <span className="text-emerald-600 font-medium">Connected</span>
      </div>
    </aside>
  );
}

export default SidebarNav;
