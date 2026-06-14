import { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { apiGetVehicles, apiUpdateVehicle } from '../api';

const statusOptions = ['available', 'in_use', 'maintenance'];
const vehicleTypeLabels = {
  motorbike: 'Motorbike',
  van:       'Van',
  truck:     'Truck',
  container: 'Container',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const fetchVehicles = async () => {
    try {
      setPageError('');
      const result = await apiGetVehicles();
      setVehicles(result.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) =>
    (v.plate_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.vehicle_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const changeStatus = async (id, newStatus) => {
    try {
      await apiUpdateVehicle(id, { status: newStatus });
      setVehicles((prev) => prev.map((v) => v._id === id ? { ...v, status: newStatus } : v));
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
    }
  };

  const statusCounts = {
    available:   vehicles.filter((v) => v.status === 'available').length,
    in_use:      vehicles.filter((v) => v.status === 'in_use').length,
    maintenance: vehicles.filter((v) => v.status === 'maintenance').length,
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-primary-500 animate-spin-slow" />
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={24} />
          <p className="text-sm font-medium">{pageError}</p>
        </div>
        <Button variant="secondary" onClick={() => { setPageLoading(true); fetchVehicles(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Vehicle Management</h1>
        <p className="text-sm text-slate-500 mt-1">{vehicles.length} vehicles in fleet</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Available</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.available}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">In Use</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.in_use}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Maintenance</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.maintenance}</p>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Input id="vehicle-search" placeholder="Search by plate or type…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
      </div>

      <Table>
        <TableHead>
          <TableHeader>Plate</TableHeader>
          <TableHeader>Type</TableHeader>
          <TableHeader className="hidden md:table-cell">Capacity (kg)</TableHeader>
          <TableHeader className="hidden lg:table-cell">Location</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Update Status</TableHeader>
        </TableHead>
        <TableBody>
          {filtered.map((vehicle) => (
            <TableRow key={vehicle._id}>
              <TableCell className="font-mono font-semibold text-slate-900">{vehicle.plate_number}</TableCell>
              <TableCell>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-600">
                  {vehicleTypeLabels[vehicle.vehicle_type] || vehicle.vehicle_type}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell">{(vehicle.capacity || 0).toLocaleString()}</TableCell>
              <TableCell className="hidden lg:table-cell">{vehicle.current_location || <span className="text-slate-400 italic">Unknown</span>}</TableCell>
              <TableCell><StatusBadge status={vehicle.status} /></TableCell>
              <TableCell>
                <select
                  id={`vehicle-status-${vehicle._id}`}
                  value={vehicle.status}
                  onChange={(e) => changeStatus(vehicle._id, e.target.value)}
                  className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer transition-all"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-slate-400 py-8" colSpan={6}>No vehicles found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
