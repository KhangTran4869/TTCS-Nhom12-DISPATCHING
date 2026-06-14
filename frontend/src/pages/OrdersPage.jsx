import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, AlertTriangle, Eye, X } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { apiGetOrders, apiCreateOrder, apiUpdateOrder } from '../api';

const statusOptions = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
const priorityOptions = ['normal', 'high', 'urgent'];

const priorityStyles = {
  normal: 'bg-slate-100 text-slate-600',
  high:   'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const emptyForm = {
  order_code: '', sender_name: '', sender_phone: '', pickup_address: '',
  receiver_name: '', receiver_phone: '', delivery_address: '',
  cargo_description: '', cargo_weight: '', priority: 'normal',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');

  const fetchOrders = async () => {
    try {
      setPageError('');
      const result = await apiGetOrders();
      setOrders(result.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter((o) =>
    (o.order_code || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.sender_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.receiver_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleCreate = async () => {
    if (!form.order_code || !form.sender_name || !form.receiver_name) return;
    setSaveLoading(true);
    setFormError('');
    try {
      await apiCreateOrder({
        ...form,
        cargo_weight: parseFloat(form.cargo_weight) || 0,
      });
      await fetchOrders();
      setModalOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.message);
    }
    setSaveLoading(false);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await apiUpdateOrder(id, { status: newStatus });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  if (pageLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-500 animate-spin-slow" /></div>;
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={24} /><p className="text-sm font-medium">{pageError}</p></div>
        <Button variant="secondary" onClick={() => { setPageLoading(true); fetchOrders(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">{orders.length} orders total</p>
        </div>
        <Button id="add-order-btn" icon={Plus} onClick={() => { setForm(emptyForm); setFormError(''); setModalOpen(true); }}>New Order</Button>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((s) => (
          <div key={s} className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm text-center min-w-[90px]">
            <p className="text-lg font-bold text-slate-900">{statusCounts[s] || 0}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">{s.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 max-w-sm">
        <Input id="order-search" placeholder="Search by code, sender, or receiver…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
      </div>

      <Table>
        <TableHead>
          <TableHeader>Code</TableHeader>
          <TableHeader>Sender</TableHeader>
          <TableHeader className="hidden md:table-cell">Receiver</TableHeader>
          <TableHeader className="hidden lg:table-cell">Weight</TableHeader>
          <TableHeader>Priority</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        <TableBody>
          {filtered.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-mono font-semibold text-slate-900">{order.order_code}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{order.sender_name}</p>
                  <p className="text-xs text-slate-400">{order.sender_phone}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div>
                  <p className="font-medium text-sm">{order.receiver_name}</p>
                  <p className="text-xs text-slate-400">{order.receiver_phone}</p>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{order.cargo_weight ? `${order.cargo_weight} kg` : '—'}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityStyles[order.priority] || priorityStyles.normal}`}>
                  {(order.priority || 'normal').charAt(0).toUpperCase() + (order.priority || 'normal').slice(1)}
                </span>
              </TableCell>
              <TableCell><StatusBadge status={order.status} /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDetailModal(order)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer" title="View Details">
                    <Eye size={15} />
                  </button>
                  <select value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer transition-all">
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell className="text-center text-slate-400 py-8" colSpan={7}>No orders found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Order" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="order-code" label="Order Code" placeholder="ORD-001" value={form.order_code} onChange={handleChange('order_code')} required />
          <div className="w-full">
            <label htmlFor="order-priority" className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
            <select id="order-priority" value={form.priority} onChange={handleChange('priority')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              {priorityOptions.map((p) => (<option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>))}
            </select>
          </div>
          <Input id="order-sender" label="Sender Name" placeholder="John Doe" value={form.sender_name} onChange={handleChange('sender_name')} required />
          <Input id="order-sender-phone" label="Sender Phone" placeholder="(555) 000-0000" value={form.sender_phone} onChange={handleChange('sender_phone')} required />
          <div className="md:col-span-2">
            <Input id="order-pickup" label="Pickup Address" placeholder="123 Main St" value={form.pickup_address} onChange={handleChange('pickup_address')} required />
          </div>
          <Input id="order-receiver" label="Receiver Name" placeholder="Jane Smith" value={form.receiver_name} onChange={handleChange('receiver_name')} required />
          <Input id="order-receiver-phone" label="Receiver Phone" placeholder="(555) 111-1111" value={form.receiver_phone} onChange={handleChange('receiver_phone')} required />
          <div className="md:col-span-2">
            <Input id="order-delivery" label="Delivery Address" placeholder="456 Oak Ave" value={form.delivery_address} onChange={handleChange('delivery_address')} required />
          </div>
          <Input id="order-cargo-desc" label="Cargo Description" placeholder="Electronics, Furniture…" value={form.cargo_description} onChange={handleChange('cargo_description')} />
          <Input id="order-cargo-weight" label="Weight (kg)" type="number" placeholder="0" value={form.cargo_weight} onChange={handleChange('cargo_weight')} />
        </div>
        {formError && <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{formError}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button id="save-order-btn" onClick={handleCreate} loading={saveLoading} disabled={!form.order_code || !form.sender_name || !form.receiver_name}>Create Order</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Order ${detailModal?.order_code || ''}`}>
        {detailModal && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400 text-xs uppercase mb-1">Status</p><StatusBadge status={detailModal.status} /></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Priority</p><span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityStyles[detailModal.priority]}`}>{detailModal.priority}</span></div>
            </div>
            <hr className="border-slate-100" />
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400 text-xs uppercase mb-1">Sender</p><p className="font-medium">{detailModal.sender_name}</p><p className="text-slate-500">{detailModal.sender_phone}</p></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Receiver</p><p className="font-medium">{detailModal.receiver_name}</p><p className="text-slate-500">{detailModal.receiver_phone}</p></div>
            </div>
            <div><p className="text-slate-400 text-xs uppercase mb-1">Pickup</p><p>{detailModal.pickup_address || '—'}</p></div>
            <div><p className="text-slate-400 text-xs uppercase mb-1">Delivery</p><p>{detailModal.delivery_address || '—'}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400 text-xs uppercase mb-1">Cargo</p><p>{detailModal.cargo_description || '—'}</p></div>
              <div><p className="text-slate-400 text-xs uppercase mb-1">Weight</p><p>{detailModal.cargo_weight ? `${detailModal.cargo_weight} kg` : '—'}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
