import { useState, useEffect } from 'react';
import {
  BarChart3, Users, Truck, Package, Shield, UserPlus, Pencil, Trash2,
  Loader, CheckCircle, XCircle, Search, RefreshCw, ChevronDown
} from 'lucide-react';

function AdminDashboard({ user, showToast, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Data
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'driver',
    status: 'active',
    password: '',
  });
  const [savingUser, setSavingUser] = useState(false);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resUsers, resDrivers, resVehicles, resOrders] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/orders'),
      ]);

      const [dataUsers, dataDrivers, dataVehicles, dataOrders] = await Promise.all([
        resUsers.json(),
        resDrivers.json(),
        resVehicles.json(),
        resOrders.json(),
      ]);

      if (dataUsers.success) setUsers(dataUsers.data || []);
      if (dataDrivers.success) setDrivers(dataDrivers.data || []);
      if (dataVehicles.success) setVehicles(dataVehicles.data || []);
      if (dataOrders.success) setOrders(dataOrders.data || []);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi tải dữ liệu hệ thống', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open modal to create new user
  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      full_name: '',
      email: '',
      phone: '',
      role: 'driver',
      status: 'active',
      password: '',
    });
    setShowUserModal(true);
  };

  // Open modal to edit existing user
  const openEditModal = (u) => {
    setEditingUser(u);
    setUserForm({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status,
      password: '',
    });
    setShowUserModal(true);
  };

  // Save user (create or update)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.full_name || !userForm.email) {
      showToast('Vui lòng điền đầy đủ họ tên và email', 'warning');
      return;
    }

    if (!editingUser && !userForm.password) {
      showToast('Vui lòng nhập mật khẩu cho tài khoản mới', 'warning');
      return;
    }

    setSavingUser(true);
    try {
      const payload = {
        full_name: userForm.full_name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        status: userForm.status,
      };

      if (userForm.password) {
        payload.password_hash = userForm.password;
      }

      let response;
      if (editingUser) {
        response = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (result.success) {
        showToast(
          editingUser
            ? `Cập nhật người dùng "${userForm.full_name}" thành công!`
            : `Tạo người dùng "${userForm.full_name}" thành công!`,
          'success'
        );
        setShowUserModal(false);
        loadData();
      } else {
        showToast(result.message || 'Lỗi lưu người dùng', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'danger');
    } finally {
      setSavingUser(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${u.full_name}"?`)) return;

    try {
      const response = await fetch(`/api/users/${u._id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        showToast(`Đã xóa người dùng "${u.full_name}"`, 'info');
        loadData();
      } else {
        showToast(result.message || 'Xóa người dùng thất bại', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'danger');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`/api/users/${u._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (result.success) {
        showToast(
          `Đã ${nextStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản "${u.full_name}"`,
          'success'
        );
        loadData();
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'danger');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const totalUsers = users.length;
  const totalDrivers = drivers.length;
  const totalVehicles = vehicles.length;
  const totalOrders = orders.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const roleCount = {
    admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    dispatcher: users.filter((u) => u.role === 'dispatcher').length,
    driver: users.filter((u) => u.role === 'driver').length,
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'dispatcher': return 'Điều phối viên';
      case 'driver': return 'Tài xế';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-danger';
      case 'manager': return 'badge-warning';
      case 'dispatcher': return 'badge-info';
      case 'driver': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <Shield size={24} />
          Quản Trị Hệ Thống
        </div>
        <div className="nav-user">
          <div className="user-badge">
            <span>{user?.full_name}</span>
            <span className="role-tag admin">{getRoleName(user?.role)}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>
              Bảng Quản Trị Hệ Thống
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Quản lý người dùng, tài xế, phương tiện và giám sát toàn bộ hoạt động hệ thống.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={14} style={{ marginRight: '6px' }} />
            Tổng quan
          </div>
          <div
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={14} style={{ marginRight: '6px' }} />
            Quản lý người dùng ({totalUsers})
          </div>
          <div
            className={`tab ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <Truck size={14} style={{ marginRight: '6px' }} />
            Tài xế ({totalDrivers})
          </div>
          <div
            className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            <Package size={14} style={{ marginRight: '6px' }} />
            Phương tiện ({totalVehicles})
          </div>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0' }}>
            <Loader style={{ animation: 'statusPulse 1s infinite' }} size={36} />
          </div>
        )}

        {!loading && (
          <>
            {/* ===== TAB: TỔNG QUAN ===== */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                {/* Stats Cards */}
                <div className="stats-container" style={{ marginBottom: '24px' }}>
                  <div className="stat-card">
                    <div className="stat-icon primary"><Users size={24} /></div>
                    <div className="stat-info">
                      <span className="stat-label">Tổng người dùng</span>
                      <span className="stat-value">{totalUsers}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon success"><Truck size={24} /></div>
                    <div className="stat-info">
                      <span className="stat-label">Tài xế</span>
                      <span className="stat-value">{totalDrivers}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon warning"><Package size={24} /></div>
                    <div className="stat-info">
                      <span className="stat-label">Phương tiện</span>
                      <span className="stat-value">{totalVehicles}</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon info"><BarChart3 size={24} /></div>
                    <div className="stat-info">
                      <span className="stat-label">Đơn hàng</span>
                      <span className="stat-value">{totalOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Role distribution + Active users */}
                <div className="dashboard-grid" style={{ padding: 0 }}>
                  <div className="col-6">
                    <div className="card">
                      <div className="card-title">
                        <Users size={18} color="#818cf8" />
                        Phân bổ vai trò
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {Object.entries(roleCount).map(([role, count]) => (
                          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={`badge ${getRoleBadgeClass(role)}`} style={{ minWidth: '120px', justifyContent: 'center' }}>
                              {getRoleName(role)}
                            </span>
                            <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: totalUsers > 0 ? `${(count / totalUsers) * 100}%` : '0%',
                                  background: role === 'admin' ? 'var(--danger)' : role === 'manager' ? 'var(--warning)' : role === 'dispatcher' ? 'var(--info)' : 'var(--success)',
                                  borderRadius: '4px',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, color: '#fff', minWidth: '30px', textAlign: 'right' }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="card">
                      <div className="card-title">
                        <CheckCircle size={18} color="var(--success)" />
                        Trạng thái tài khoản
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
                        <div className="list-detail-item">
                          <span className="list-detail-label">Đang hoạt động</span>
                          <span className="list-detail-value" style={{ color: 'var(--success-text)' }}>{activeUsers}</span>
                        </div>
                        <div className="list-detail-item">
                          <span className="list-detail-label">Đã vô hiệu hóa</span>
                          <span className="list-detail-value" style={{ color: 'var(--danger-text)' }}>{totalUsers - activeUsers}</span>
                        </div>
                        <div className="list-detail-item" style={{ borderBottom: 'none' }}>
                          <span className="list-detail-label">Tỉ lệ hoạt động</span>
                          <span className="list-detail-value">
                            {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB: QUẢN LÝ NGƯỜI DÙNG ===== */}
            {activeTab === 'users' && (
              <div className="animate-fade-in">
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="auth-input-wrapper" style={{ flex: 1, minWidth: '240px', maxWidth: '400px' }}>
                    <span className="auth-input-icon" style={{ color: 'var(--text-muted)' }}>
                      <Search size={16} />
                    </span>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ fontSize: '13px', padding: '8px 12px 8px 40px' }}
                    />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-control"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      style={{ padding: '8px 32px 8px 12px', fontSize: '13px', minWidth: '160px' }}
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="admin">Quản trị viên</option>
                      <option value="manager">Quản lý</option>
                      <option value="dispatcher">Điều phối viên</option>
                      <option value="driver">Tài xế</option>
                    </select>
                  </div>

                  <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                    <UserPlus size={14} />
                    Thêm người dùng
                  </button>
                </div>

                {/* Users Table */}
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-container" style={{ border: 'none' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Họ và tên</th>
                          <th>Email</th>
                          <th>Điện thoại</th>
                          <th>Vai trò</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                              {userSearch || userRoleFilter !== 'all'
                                ? 'Không tìm thấy người dùng phù hợp.'
                                : 'Chưa có người dùng nào trong hệ thống.'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div className="admin-user-avatar">
                                    {u.full_name.charAt(0).toUpperCase()}
                                  </div>
                                  <strong style={{ color: '#fff' }}>{u.full_name}</strong>
                                </div>
                              </td>
                              <td style={{ fontSize: '13px' }}>{u.email}</td>
                              <td style={{ fontSize: '13px' }}>{u.phone || '—'}</td>
                              <td>
                                <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                                  {getRoleName(u.role)}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleToggleStatus(u)}
                                  title="Click để thay đổi trạng thái"
                                >
                                  <span
                                    className="badge-dot"
                                    style={{
                                      backgroundColor: u.status === 'active' ? 'var(--success)' : 'var(--danger)',
                                    }}
                                  ></span>
                                  {u.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => openEditModal(u)}
                                    title="Chỉnh sửa"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteUser(u)}
                                    title="Xóa"
                                    disabled={u._id === user._id}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-dark)', marginTop: '12px', textAlign: 'right' }}>
                  Hiển thị {filteredUsers.length} / {totalUsers} người dùng
                </p>
              </div>
            )}

            {/* ===== TAB: TÀI XẾ ===== */}
            {activeTab === 'drivers' && (
              <div className="animate-fade-in">
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-container" style={{ border: 'none' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Tài xế</th>
                          <th>Số bằng lái</th>
                          <th>Hạng bằng</th>
                          <th>Kinh nghiệm</th>
                          <th>Đánh giá</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drivers.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                              Chưa có hồ sơ tài xế nào.
                            </td>
                          </tr>
                        ) : (
                          drivers.map((d) => (
                            <tr key={d._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div className="admin-user-avatar" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-text)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                    {(d.user_id?.full_name || 'T').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <strong style={{ color: '#fff' }}>{d.user_id?.full_name || 'Chưa liên kết'}</strong>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.user_id?.email || ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.license_number}</td>
                              <td>{d.license_type}</td>
                              <td>{d.experience_years} năm</td>
                              <td>
                                <span style={{ color: 'var(--warning-text)', fontWeight: 700 }}>
                                  ★ {d.rating || '—'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  d.current_status === 'available' ? 'badge-success' :
                                  d.current_status === 'off' ? 'badge-danger' : 'badge-warning'
                                }`}>
                                  <span className="badge-dot" style={{
                                    backgroundColor:
                                      d.current_status === 'available' ? 'var(--success)' :
                                      d.current_status === 'off' ? 'var(--danger)' : 'var(--warning)',
                                  }}></span>
                                  {d.current_status === 'available' ? 'Sẵn sàng' :
                                   d.current_status === 'off' ? 'Nghỉ' :
                                   d.current_status === 'assigned' ? 'Đã phân công' : 'Đang đi'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== TAB: PHƯƠNG TIỆN ===== */}
            {activeTab === 'vehicles' && (
              <div className="animate-fade-in">
                <div className="card" style={{ padding: 0 }}>
                  <div className="table-container" style={{ border: 'none' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Biển số</th>
                          <th>Loại xe</th>
                          <th>Tải trọng (kg)</th>
                          <th>Vị trí hiện tại</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
                              Chưa có phương tiện nào.
                            </td>
                          </tr>
                        ) : (
                          vehicles.map((v) => (
                            <tr key={v._id}>
                              <td>
                                <strong style={{ fontFamily: 'monospace', color: '#fff', fontSize: '15px' }}>
                                  {v.plate_number}
                                </strong>
                              </td>
                              <td>
                                {v.vehicle_type === 'truck' ? '🚛 Xe tải' :
                                 v.vehicle_type === 'van' ? '🚐 Xe van' :
                                 v.vehicle_type === 'motorcycle' ? '🏍️ Xe máy' : v.vehicle_type}
                              </td>
                              <td style={{ fontWeight: 600 }}>{v.capacity?.toLocaleString()}</td>
                              <td style={{ fontSize: '13px' }}>{v.current_location || '—'}</td>
                              <td>
                                <span className={`badge ${
                                  v.status === 'available' ? 'badge-success' :
                                  v.status === 'in_use' ? 'badge-warning' :
                                  v.status === 'maintenance' ? 'badge-info' : 'badge-danger'
                                }`}>
                                  {v.status === 'available' ? 'Sẵn sàng' :
                                   v.status === 'in_use' ? 'Đang sử dụng' :
                                   v.status === 'maintenance' ? 'Bảo dưỡng' : v.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAL: THÊM/SỬA NGƯỜI DÙNG ===== */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingUser ? <Pencil size={18} color="var(--primary)" /> : <UserPlus size={18} color="var(--primary)" />}
                {editingUser ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
              </h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@example.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="09XXXXXXXX"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu {editingUser ? '(bỏ trống nếu không đổi)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select
                    className="form-control"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="driver">Tài xế</option>
                    <option value="dispatcher">Điều phối viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-control"
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowUserModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={savingUser}
                >
                  {savingUser ? (
                    <>
                      <Loader size={14} className="animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    editingUser ? 'Cập Nhật' : 'Tạo Người Dùng'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
