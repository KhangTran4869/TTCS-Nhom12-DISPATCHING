import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { apiGetIncidents, apiCreateIncident, apiUpdateIncident, apiGetAssignments } from '../api';

const incidentTypes = ['traffic', 'accident', 'vehicle_breakdown', 'customer_issue', 'other'];
const statusOptions = ['reported', 'processing', 'resolved'];

const typeStyles = {
  traffic:           'bg-amber-100 text-amber-700',
  accident:          'bg-red-100 text-red-700',
  vehicle_breakdown: 'bg-orange-100 text-orange-700',
  customer_issue:    'bg-blue-100 text-blue-700',
  other:             'bg-slate-100 text-slate-600',
};

const typeLabels = {
  traffic: 'Traffic', accident: 'Accident', vehicle_breakdown: 'Vehicle Breakdown',
  customer_issue: 'Customer Issue', other: 'Other',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ assignment_id: '', incident_type: 'traffic', description: '' });
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    try {
      setPageError('');
      const [iRes, aRes] = await Promise.all([apiGetIncidents(), apiGetAssignments()]);
      setIncidents(iRes.data || []);
      setAssignments(aRes.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = incidents.filter((i) =>
    (i.incident_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.reported_by?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleCreate = async () => {
    if (!form.incident_type || !form.description) return;
    setSaveLoading(true);
    setFormError('');
    try {
      await apiCreateIncident({
        assignment_id: form.assignment_id || undefined,
        reported_by: user._id || undefined,
        incident_type: form.incident_type,
        description: form.description,
      });
      await fetchAll();
      setModalOpen(false);
      setForm({ assignment_id: '', incident_type: 'traffic', description: '' });
    } catch (err) {
      setFormError(err.message);
    }
    setSaveLoading(false);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      const update = { status: newStatus };
      if (newStatus === 'resolved') update.resolved_at = new Date();
      await apiUpdateIncident(id, update);
      setIncidents((prev) => prev.map((i) => i._id === id ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Failed to update incident:', err);
    }
  };

  const statusCounts = {
    reported:   incidents.filter((i) => i.status === 'reported').length,
    processing: incidents.filter((i) => i.status === 'processing').length,
    resolved:   incidents.filter((i) => i.status === 'resolved').length,
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
          <h1 className="text-2xl font-bold text-slate-900">Incident Reports</h1>
          <p className="text-sm text-slate-500 mt-1">{incidents.length} incidents reported</p>
        </div>
        <Button id="add-incident-btn" icon={Plus} onClick={() => { setFormError(''); setModalOpen(true); }}>Report Incident</Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-xs font-medium text-slate-500 uppercase">Reported</span></div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.reported}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-xs font-medium text-slate-500 uppercase">Processing</span></div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.processing}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs font-medium text-slate-500 uppercase">Resolved</span></div>
          <p className="text-2xl font-bold text-slate-900">{statusCounts.resolved}</p>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Input id="incident-search" placeholder="Search by type, description, reporter…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
      </div>

      <Table>
        <TableHead>
          <TableHeader>Type</TableHeader>
          <TableHeader>Description</TableHeader>
          <TableHeader className="hidden md:table-cell">Reporter</TableHeader>
          <TableHeader className="hidden lg:table-cell">Date</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        <TableBody>
          {filtered.map((inc) => (
            <TableRow key={inc._id}>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeStyles[inc.incident_type] || typeStyles.other}`}>
                  {typeLabels[inc.incident_type] || inc.incident_type}
                </span>
              </TableCell>
              <TableCell className="text-sm max-w-[200px] truncate">{inc.description || '—'}</TableCell>
              <TableCell className="hidden md:table-cell text-sm">{inc.reported_by?.full_name || '—'}</TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                {inc.createdAt ? new Date(inc.createdAt).toLocaleDateString('vi-VN') : '—'}
              </TableCell>
              <TableCell><StatusBadge status={inc.status} /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {inc.status !== 'resolved' && (
                    <button onClick={() => changeStatus(inc._id, 'resolved')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer" title="Mark Resolved">
                      <CheckCircle2 size={15} />
                    </button>
                  )}
                  <select value={inc.status} onChange={(e) => changeStatus(inc._id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer transition-all">
                    {statusOptions.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
                  </select>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell className="text-center text-slate-400 py-8" colSpan={6}>No incidents found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create Incident Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Incident">
        <div className="space-y-4">
          <div className="w-full">
            <label htmlFor="incident-assignment" className="block text-sm font-medium text-slate-700 mb-1.5">Related Assignment</label>
            <select id="incident-assignment" value={form.assignment_id} onChange={handleChange('assignment_id')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              <option value="">— None (Optional) —</option>
              {assignments.filter(a => a.assignment_status === 'in_progress' || a.assignment_status === 'assigned').map((a) => (
                <option key={a._id} value={a._id}>{a.order_id?.order_code || a._id} — {a.driver_id?.user_id?.full_name || 'Driver'}</option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label htmlFor="incident-type" className="block text-sm font-medium text-slate-700 mb-1.5">Type<span className="text-red-500 ml-0.5">*</span></label>
            <select id="incident-type" value={form.incident_type} onChange={handleChange('incident_type')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
              {incidentTypes.map((t) => (<option key={t} value={t}>{typeLabels[t] || t}</option>))}
            </select>
          </div>
          <div className="w-full">
            <label htmlFor="incident-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Description<span className="text-red-500 ml-0.5">*</span></label>
            <textarea id="incident-desc" value={form.description} onChange={handleChange('description')} rows={3}
              placeholder="Describe the incident…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none" />
          </div>
          {formError && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{formError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="save-incident-btn" onClick={handleCreate} loading={saveLoading} disabled={!form.description}>Report</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
