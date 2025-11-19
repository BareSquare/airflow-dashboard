import SidebarNav from './SidebarNav.jsx';
import AppHeader from './AppHeader.jsx';

/**
 * AppLayout renders the sidebar navigation and content area wrapper.
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.actions]
 * @param {React.ReactNode} props.children
 */
function AppLayout({ title, description, actions, children }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <AppHeader title={title} description={description} actions={actions} />
        <main className="flex-1 px-4 pb-10 pt-4 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
