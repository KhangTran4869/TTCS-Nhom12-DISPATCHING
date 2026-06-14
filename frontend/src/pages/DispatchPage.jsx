import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, AlertTriangle } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { apiGetAssignments, apiCreateAssignment, apiUpdateAssignment, apiGetOrders, apiGetDrivers, apiGetVehicles } from '../api';

const assignmentStatuses = ['assigned', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];

export default function DispatchPage() {
  const [assignments, setAssignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ order_id: '', driver_id: '', vehicle_id: '', note: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    try {
      setPageError('');
      const [aRes, oRes, dRes, vRes] = await Promise.all([
        apiGetAssignments(), apiGetOrders(), apiGetDrivers(), apiGetVehicles(),
      ]);
      setAssignments(aRes.data || []);
      setOrders(oRes.data || []);
      setDrivers(dRes.data || []);
      setVehicles(vRes.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const availableDrivers = drivers.filter((d) => d.current_status === 'available');
  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const filtered = assignments.filter((a) => {
    const orderCode = a.order_id?.order_code || '';
    const driverName = a.driver_id?.user_id?.full_name || '';
    return orderCode.toLowerCase().includes(search.toLowerCase()) ||
      driverName.toLowerCase().includes(search.toLowerCase());
  });

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleCreate = async () => {
    if (!form.order_id || !form.driver_id || !form.vehicle_id) return;
    setSaveLoading(true);
    setFormError('');
    try {
      await apiCreateAssignment({
        order_id: form.order_id,
        driver_id: form.driver_id,
        vehicle_id: form.vehicle_id,
        dispatcher_id: user._id || null,
        note: form.note,
      });
      await fetchAll();
      setModalOpen(false);
      setForm({ order_id: '', driver_id: '', vehicle_id: '', note: '' });
    } catch (err) {
      setFormError(err.message);
    }
    setSaveLoading(false);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await apiUpdateAssignment(id, { assignment_status: newStatus });
      setAssignments((prev) => prev.map((a) => a._id === id ? { ...a, assignment_status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update assignment status:', err);
    }
  };

  if (pageLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-500 animate-spin-slow" /></div>;
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={24} /><p className="text-sm font-medium">{pageError}</p></div>
        <Button variant="secondary" onClick={() => { setPageLoading(true); fetchAll(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">{assignments.length} assignments total</p>
        </div>
        <Button id="add-assignment-btn" icon={Plus} onClick={() => { setFormError(''); setModalOpen(true); }}
          disabled={pendingOrders.length === 0 || availableDrivers.length === 0 || availableVehicles.length === 0}>
          New Assignment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Pending Orders</p>
          <p className="text-2xl font-bold text-amber-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Available Drivers</p>
          <p className="text-2xl font-bold text-emerald-600">{availableDrivers.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase mb-1">Available Vehicles</p>
          <p className="text-2xl font-bold text-blue-600">{availableVehicles.length}</p>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Input id="dispatch-search" placeholder="Search by order code or driver…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
      </div>

      <Table>
        <TableHead>
          <TableHeader>Order</TableHeader>
          <TableHeader>Driver</TableHeader>
          <TableHeader className="hidden md:table-cell">Vehicle</TableHeader>
          <TableHeader className="hidden lg:table-cell">Assigned</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        <TableBody>
          {filtered.map((a) => (
            <TableRow key={a._id}>
              <TableCell className="font-mono font-semibold text-sm text-slate-900">{a.order_id?.order_code || '—'}</TableCell>
              <TableCell className="font-medium text-sm">{a.driver_id?.user_id?.full_name || '—'}</TableCell>
              <TableCell className="hidden md:table-cell font-mono text-xs">{a.vehicle_id?.plate_number || '—'}</TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                {a.assigned_at ? new Date(a.assigned_at).toLocaleDateString('vi-VN') : '—'}
              </TableCell>
              <TableCell><StatusBadge status={a.assignment_status} /></TableCell>
              <TableCell>
                <select value={a.assignment_status} onChange={(e) => changeStatus(a._id, e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer transition-all">
                  {assignmentStatuses.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell className="text-center text-slate-400 py-8" colSpan={6}>No assignments found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create Assignment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Dispatch Assignment">
        <div className="space-y-4">
          <div className="w-full">
            <label htmlFor="assign-order" className="block text-sm font-medium text-slate-700 mb-1.5">Order (Pending)<span className="text-red-500 ml-0.5">*</span></label>
            <select id="assign-order" value={form.order_id} onChange={handleChange('order_id')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              <option value="">— Select Order —</option>
              {pendingOrders.map((o) => (<option key={o._id} value={o._id}>{o.order_code} — {o.sender_name} → {o.receiver_name}</option>))}
            </select>
          </div>
          <div className="w-full">
            <label htmlFor="assign-driver" className="block text-sm font-medium text-slate-700 mb-1.5">Driver (Available)<span className="text-red-500 ml-0.5">*</span></label>
            <select id="assign-driver" value={form.driver_id} onChange={handleChange('driver_id')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              <option value="">— Select Driver —</option>
              {availableDrivers.map((d) => (<option key={d._id} value={d._id}>{d.user_id?.full_name} — {d.license_type}</option>))}
            </select>
          </div>
          <div className="w-full">
            <label htmlFor="assign-vehicle" className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle (Available)<span className="text-red-500 ml-0.5">*</span></label>
            <select id="assign-vehicle" value={form.vehicle_id} onChange={handleChange('vehicle_id')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              <option value="">— Select Vehicle —</option>
              {availableVehicles.map((v) => (<option key={v._id} value={v._id}>{v.plate_number} — {v.vehicle_type} ({v.capacity}kg)</option>))}
            </select>
          </div>
          <Input id="assign-note" label="Note" placeholder="Optional notes…" value={form.note} onChange={handleChange('note')} />
          {formError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="save-assignment-btn" onClick={handleCreate} loading={saveLoading} disabled={!form.order_id || !form.driver_id || !form.vehicle_id}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
