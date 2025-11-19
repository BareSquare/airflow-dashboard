import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './SidebarNav.jsx';

/**
 * AppHeader - top header shared across pages.
 */
function AppHeader({ title, description, actions }) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-4 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        <nav className="mt-4 flex gap-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600 md:hidden">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-1 transition-colors',
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-500'
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;
