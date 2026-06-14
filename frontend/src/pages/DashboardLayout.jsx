import { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Menu, X, LogOut, ChevronRight, Bell, Package, GitBranch, MapPin, AlertTriangle } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true, roles: ['manager', 'dispatcher', 'driver'] },
  { type: 'divider', label: 'Operations', roles: ['manager', 'dispatcher', 'driver'] },
  { to: '/dashboard/orders', icon: Package, label: 'Orders', roles: ['manager', 'dispatcher'] },
  { to: '/dashboard/dispatch', icon: GitBranch, label: 'Dispatch', roles: ['manager', 'dispatcher'] },
  { to: '/dashboard/locations', icon: MapPin, label: 'Locations', roles: ['manager', 'dispatcher', 'driver'] },
  { type: 'divider', label: 'Resources', roles: ['manager'] },
  { to: '/dashboard/drivers', icon: Users, label: 'Drivers', roles: ['manager'] },
  { to: '/dashboard/vehicles', icon: Truck, label: 'Vehicles', roles: ['manager'] },
  { type: 'divider', label: 'Reports', roles: ['manager', 'dispatcher', 'driver'] },
  { to: '/dashboard/incidents', icon: AlertTriangle, label: 'Incidents', roles: ['manager', 'dispatcher', 'driver'] },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = user.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Logistics</h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dispatch System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user.role))
            .map((item, idx) =>
            item.type === 'divider' ? (
              <p key={idx} className="px-3 pt-4 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
            ) : (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary-400" />}
                </>
              )}
            </NavLink>
            )
          )}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.full_name || 'Guest'}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <button id="logout-btn" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer">
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
