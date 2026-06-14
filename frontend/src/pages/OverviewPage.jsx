import { useState, useEffect, useMemo } from 'react';
import { Users, Truck, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { apiGetDashboardStats } from '../api';

export default function OverviewPage() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const fetchStats = async () => {
    try {
      const result = await apiGetDashboardStats();
      setStatsData(result.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = statsData ? [
    { label: 'Total Drivers', value: statsData.totalDrivers || 0, change: 'Active fleet members', icon: Users, color: 'bg-primary-50 text-primary-600' },
    { label: 'Active Vehicles', value: statsData.activeVehicles || 0, change: `${statsData.maintenanceVehicles || 0} in maintenance`, icon: Truck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Alerts', value: statsData.pendingIncidents || 0, change: 'Unresolved incidents', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    { label: 'Deliveries Today', value: statsData.deliveriesToday || 0, change: 'Completed since midnight', icon: TrendingUp, color: 'bg-violet-50 text-violet-600' },
  ] : [];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-500 animate-spin-slow" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {user.full_name || 'User'}. Here&apos;s your fleet summary.</p>
      </div>
      
      {statsData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-2">{stat.change}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <p className="text-slate-500">Failed to load statistics.</p>
        </div>
      )}
    </div>
  );
}
