import { useState, useEffect } from 'react';
import { Plus, Pencil, Search, Star, Loader2, AlertTriangle } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { apiGetDrivers, apiCreateDriver, apiUpdateDriver, apiRegister } from '../api';

const licenseTypes = ['A1', 'A2', 'B1', 'B2', 'C', 'D', 'E'];
const statusOptions = ['available', 'assigned', 'on_trip', 'off'];

const emptyForm = { full_name: '', email: '', phone: '', password: '', license_number: '', license_type: 'B2', experience_years: '' };

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pageLoading, setPageLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch drivers from API
  const fetchDrivers = async () => {
    try {
      setPageError('');
      const result = await apiGetDrivers();
      setDrivers(result.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = drivers.filter((d) => {
    const name = d.user_id?.full_name || '';
    const license = d.license_number || '';
    return name.toLowerCase().includes(search.toLowerCase()) ||
      license.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => { setEditingDriver(null); setForm(emptyForm); setFormError(''); setModalOpen(true); };
  const openEdit = (driver) => {
    setEditingDriver(driver);
    setForm({
      full_name: driver.user_id?.full_name || '',
      email: '',
      phone: driver.user_id?.phone || '',
      password: '',
      license_number: driver.license_number,
      license_type: driver.license_type,
      experience_years: driver.experience_years?.toString() || '0',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.license_number || !form.license_type) return;
    setSaveLoading(true);
    setFormError('');

    try {
      if (editingDriver) {
        // Cập nhật driver
        await apiUpdateDriver(editingDriver._id, {
          license_number: form.license_number,
          license_type: form.license_type,
          experience_years: parseInt(form.experience_years) || 0,
        });
      } else {
        // Tạo mới: bước 1 - tạo User, bước 2 - tạo Driver
        if (!form.email || !form.password) {
          setFormError('Email and password are required for new drivers.');
          setSaveLoading(false);
          return;
        }
        const userResult = await apiRegister({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'driver',
        });
        await apiCreateDriver({
          user_id: userResult.data._id,
          license_number: form.license_number,
          license_type: form.license_type,
          experience_years: parseInt(form.experience_years) || 0,
        });
      }
      await fetchDrivers();
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    }
    setSaveLoading(false);
  };

  const changeStatus = async (id, newStatus) => {
    try {
      await apiUpdateDriver(id, { current_status: newStatus });
      setDrivers((prev) => prev.map((d) => d._id === id ? { ...d, current_status: newStatus } : d));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

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
        <Button variant="secondary" onClick={() => { setPageLoading(true); fetchDrivers(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Management</h1>
          <p className="text-sm text-slate-500 mt-1">{drivers.length} drivers registered</p>
        </div>
        <Button id="add-driver-btn" icon={Plus} onClick={openAdd}>Add Driver</Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input id="driver-search" placeholder="Search by name or license…" value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} />
      </div>

      <Table>
        <TableHead>
          <TableHeader>Name</TableHeader>
          <TableHeader>License</TableHeader>
          <TableHeader className="hidden md:table-cell">Type</TableHeader>
          <TableHeader className="hidden lg:table-cell">Phone</TableHeader>
          <TableHeader className="hidden xl:table-cell">Exp.</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </TableHead>
        <TableBody>
          {filtered.map((driver) => (
            <TableRow key={driver._id}>
              <TableCell className="font-medium text-slate-900">
                <div className="flex items-center gap-2">
                  {driver.user_id?.full_name || 'N/A'}
                  {driver.rating >= 4.5 && <Star size={14} className="text-amber-400 fill-amber-400" />}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{driver.license_number}</TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-semibold text-slate-600">{driver.license_type}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">{driver.user_id?.phone || '—'}</TableCell>
              <TableCell className="hidden xl:table-cell">{driver.experience_years} yr{driver.experience_years !== 1 ? 's' : ''}</TableCell>
              <TableCell>
                <StatusBadge status={driver.current_status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(driver)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer" title="Edit">
                    <Pencil size={15} />
                  </button>
                  <select
                    id={`driver-status-${driver._id}`}
                    value={driver.current_status}
                    onChange={(e) => changeStatus(driver._id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer transition-all"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell className="text-center text-slate-400 py-8" colSpan={7}>No drivers found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDriver ? 'Edit Driver' : 'Add New Driver'}>
        <div className="space-y-4">
          <Input id="driver-name" label="Full Name" placeholder="John Doe" value={form.full_name} onChange={handleChange('full_name')} disabled={!!editingDriver} required />

          {/* Email & Password chỉ hiển thị khi thêm mới */}
          {!editingDriver && (
            <>
              <Input id="driver-email" label="Email" type="email" placeholder="driver@example.com" value={form.email} onChange={handleChange('email')} required />
              <Input id="driver-phone" label="Phone" placeholder="(555) 123-4567" value={form.phone} onChange={handleChange('phone')} />
              <Input id="driver-password" label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange('password')} required />
            </>
          )}

          <Input id="driver-license" label="License Number" placeholder="DL-2024-XXX" value={form.license_number} onChange={handleChange('license_number')} required />
          <div className="w-full">
            <label htmlFor="driver-license-type" className="block text-sm font-medium text-slate-700 mb-1.5">
              License Type<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              id="driver-license-type"
              value={form.license_type}
              onChange={handleChange('license_type')}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 transition-all duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              {licenseTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input id="driver-experience" label="Experience (years)" type="number" placeholder="0" value={form.experience_years} onChange={handleChange('experience_years')} />

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100 animate-fade-in">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button id="save-driver-btn" onClick={handleSave} loading={saveLoading} disabled={!form.full_name || !form.license_number}>
              {editingDriver ? 'Save Changes' : 'Add Driver'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
