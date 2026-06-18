import { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Truck, Users, PlusCircle, Wrench, Settings, Trash2, CheckCircle, Clock, Loader, Star, LogOut } from 'lucide-react';

function ManagerDashboard({ user, showToast, onLogout }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'fleet', 'incidents'
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Vehicle Form State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate_number: '',
    vehicle_type: 'truck',
    capacity: 2500,
    status: 'available',
    current_location: 'Hà Nội'
  });

  // New Driver Form State
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    user_id: '',
    license_number: '',
    license_type: 'C',
    experience_years: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resVehicles, resDrivers, resIncidents, resUsers] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
        fetch('/api/incidents'),
        fetch('/api/users')
      ]);

      const [dataOrders, dataVehicles, dataDrivers, dataIncidents, dataUsers] = await Promise.all([
        resOrders.json(),
        resVehicles.json(),
        resDrivers.json(),
        resIncidents.json(),
        resUsers.json()
      ]);

      if (dataOrders.success) setOrders(dataOrders.data || []);
      if (dataVehicles.success) setVehicles(dataVehicles.data || []);
      if (dataDrivers.success) setDrivers(dataDrivers.data || []);
      if (dataIncidents.success) setIncidents(dataIncidents.data || []);
      if (dataUsers.success) setUsers(dataUsers.data || []);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi đồng bộ dữ liệu quản lý', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Thêm phương tiện mới
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.plate_number) {
      showToast('Vui lòng điền biển số xe!', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });
      const result = await response.json();
      
      if (result.success) {
        showToast(`Đã thêm xe ${newVehicle.plate_number} vào đội xe thành công!`, 'success');
        setShowVehicleModal(false);
        setNewVehicle({
          plate_number: '',
          vehicle_type: 'truck',
          capacity: 2500,
          status: 'available',
          current_location: 'Hà Nội'
        });
        loadData();
      } else {
        showToast(result.message || 'Lỗi thêm phương tiện', 'danger');
      }
    } catch (error) {
      showToast('Lỗi máy chủ', 'danger');
    }
  };

  // Thêm hồ sơ tài xế (Liên kết với User có sẵn)
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.user_id || !newDriver.license_number) {
      showToast('Vui lòng chọn tài khoản và điền đủ thông tin!', 'warning');
      return;
    }

    try {
      const driverRes = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: newDriver.user_id,
          license_number: newDriver.license_number,
          license_type: newDriver.license_type,
          experience_years: newDriver.experience_years
        })
      });
      const driverResult = await driverRes.json();

      if (driverResult.success) {
        showToast('Đã thêm hồ sơ tài xế thành công!', 'success');
        setShowDriverModal(false);
        setNewDriver({
          user_id: '', license_number: '', license_type: 'C', experience_years: 0
        });
        loadData();
      } else {
        showToast(driverResult.message || 'Lỗi tạo hồ sơ tài xế', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'danger');
    }
  };

  // Cập nhật trạng thái xe (ví dụ: đưa đi bảo dưỡng)
  const handleUpdateVehicleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Cập nhật trạng thái xe thành công!`, 'success');
        loadData();
      } else {
        showToast('Cập nhật thất bại', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'danger');
    }
  };

  // Xoá phương tiện khỏi hệ thống
  const handleDeleteVehicle = async (id, plate) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện ${plate}?`)) return;
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Đã xóa xe ${plate} khỏi hệ thống`, 'info');
        loadData();
      } else {
        showToast('Xóa phương tiện thất bại', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'danger');
    }
  };

  // Giải quyết sự cố khẩn cấp
  const handleResolveIncident = async (id) => {
    try {
      const response = await fetch(`/api/incidents/${id}/resolve`, {
        method: 'PATCH'
      });
      const result = await response.json();
      if (result.success) {
        showToast('Đã xử lý sự cố và báo cho tài xế thành công!', 'success');
        loadData();
      } else {
        showToast('Không thể xử lý sự cố', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'danger');
    }
  };

  // Tính toán các thông số thống kê
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  
  const inUseVehiclesCount = vehicles.filter(v => v.status === 'in_use').length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'maintenance').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'available').length;
  
  const activeDriversCount = drivers.filter(d => d.current_status !== 'off').length;
  
  const availableUsersForDriver = users.filter(u => 
    u.role === 'driver' && !drivers.some(d => d.user_id?._id === u._id)
  );

  // Tỷ lệ công suất sử dụng xe (%)
  const vehicleUtilizationRate = vehicles.length > 0 
    ? Math.round((inUseVehiclesCount / vehicles.length) * 100) 
    : 0;

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      
      {/* Tiêu đề & Quản lý */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, textAlign: 'left', color: '#fff' }}>
            Bảng Quản Trị Cấp Cao (Manager View)
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Xem báo cáo tổng hợp và điều hành hoạt động của doanh nghiệp vận tải.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={onLogout}>
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          <BarChart3 size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Số Liệu Thống Kê
        </div>
        <div className={`tab ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')}>
          <Users size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Tài Xế Doanh Nghiệp ({drivers.length})
        </div>
        <div className={`tab ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}>
          <Truck size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Đội Xe Doanh Nghiệp ({vehicles.length})
        </div>
        <div className={`tab ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
          <ShieldAlert size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Logs Sự Cố ({incidents.length})
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <Loader style={{ animation: 'statusPulse 1s infinite' }} size={32} />
        </div>
      )}

      {/* NỘI DUNG TỪNG TAB */}
      {!loading && (
        <>
          {/* TAB 1: THỐNG KÊ DOANH NGHIỆP */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Thẻ số liệu chính */}
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon primary"><BarChart3 size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Tổng đơn vận chuyển</span>
                    <span className="stat-value">{totalOrdersCount}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon success"><CheckCircle size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Đã giao thành công</span>
                    <span className="stat-value">{completedOrdersCount}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon warning"><Truck size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Xe đang lăn bánh</span>
                    <span className="stat-value">{inTransitCount}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon info"><Users size={20} /></div>
                  <div className="stat-info">
                    <span className="stat-label">Tài xế hoạt động</span>
                    <span className="stat-value">{activeDriversCount} / {drivers.length}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid" style={{ padding: 0 }}>
                {/* Cột trái: Tình trạng đội xe */}
                <div className="col-6">
                  <div className="card">
                    <div className="card-title">
                      <Truck size={18} color="var(--primary)" />
                      Tình Trạng Sử Dụng Đội Xe ({vehicleUtilizationRate}% Công Suất)
                    </div>
                    
                    <div style={{ height: '14px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden', display: 'flex', marginTop: '10px', marginBottom: '20px' }}>
                      <div style={{ width: `${(inUseVehiclesCount/vehicles.length)*100}%`, backgroundColor: 'var(--primary)' }}></div>
                      <div style={{ width: `${(availableVehiclesCount/vehicles.length)*100}%`, backgroundColor: 'var(--success)' }}></div>
                      <div style={{ width: `${(maintenanceVehiclesCount/vehicles.length)*100}%`, backgroundColor: 'var(--danger)' }}></div>
                    </div>

                    <div className="list-detail">
                      <div className="list-detail-item">
                        <span className="list-detail-label">Xe đang sử dụng giao nhận</span>
                        <span className="list-detail-value">{inUseVehiclesCount} xe</span>
                      </div>
                      <div className="list-detail-item">
                        <span className="list-detail-label">Xe sẵn sàng ở bãi</span>
                        <span className="list-detail-value">{availableVehiclesCount} xe</span>
                      </div>
                      <div className="list-detail-item">
                        <span className="list-detail-label">Xe đang bảo trì bảo dưỡng</span>
                        <span className="list-detail-value">{maintenanceVehiclesCount} xe</span>
                      </div>
                      <div className="list-detail-item" style={{ borderBottom: 'none' }}>
                        <span className="list-detail-label">Đơn hàng đang chờ điều phối</span>
                        <span className="list-detail-value" style={{ color: 'var(--warning-text)' }}>{pendingCount} đơn</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Thống kê hiệu suất tài xế */}
                <div className="col-6">
                  <div className="card">
                    <div className="card-title">
                      <Users size={18} color="var(--success)" />
                      Danh Sách Tài Xế & Đánh Giá
                    </div>

                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Tên tài xế</th>
                            <th>Bằng lái</th>
                            <th>Kinh nghiệm</th>
                            <th>Đánh giá</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drivers.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tài xế nào.</td>
                            </tr>
                          ) : (
                            drivers.map(d => (
                              <tr key={d._id}>
                                <td><strong style={{ color: '#fff' }}>{d.user_id?.full_name || 'N/A'}</strong></td>
                                <td>{d.license_type}</td>
                                <td>{d.experience_years} năm</td>
                                <td style={{ color: 'var(--warning-text)', fontWeight: 'bold' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
                                    {d.rating}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    d.current_status === 'available' ? 'badge-success' :
                                    d.current_status === 'off' ? 'badge-danger' : 'badge-warning'
                                  }`}>
                                    {d.current_status === 'available' ? 'Rảnh' :
                                     d.current_status === 'off' ? 'Nghỉ' : 'Đang chạy'}
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
              </div>

            </div>
          )}

          {/* TAB 2: QUẢN LÝ ĐỘI XE */}
          {activeTab === 'fleet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setShowVehicleModal(true)}>
                  <PlusCircle size={16} /> Thêm Phương Tiện Mới
                </button>
              </div>

              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Biển số xe</th>
                        <th>Loại xe</th>
                        <th>Tải trọng tối đa</th>
                        <th>Vị trí hiện tại</th>
                        <th>Trạng thái hoạt động</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có xe nào trong bãi.</td>
                        </tr>
                      ) : (
                        vehicles.map(v => (
                          <tr key={v._id}>
                            <td>
                              <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '15px' }}>
                                {v.plate_number}
                              </strong>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>
                              {v.vehicle_type === 'truck' ? 'Xe tải' : 
                               v.vehicle_type === 'van' ? 'Xe Van' : 
                               v.vehicle_type === 'motorbike' ? 'Xe máy' : 'Container'}
                            </td>
                            <td>{v.capacity} kg</td>
                            <td>📍 {v.current_location || 'Trung tâm bãi xe'}</td>
                            <td>
                              <span className={`badge ${
                                v.status === 'available' ? 'badge-success' :
                                v.status === 'in_use' ? 'badge-primary' : 'badge-danger'
                              }`}>
                                {v.status === 'available' ? 'Có sẵn' :
                                 v.status === 'in_use' ? 'Đang chạy đơn' : 'Bảo trì'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleUpdateVehicleStatus(v._id, v.status)}
                                  disabled={v.status === 'in_use'}
                                  style={{ gap: '4px' }}
                                >
                                  <Wrench size={12} />
                                  {v.status === 'maintenance' ? 'Đưa vào bãi' : 'Bảo dưỡng'}
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteVehicle(v._id, v.plate_number)}
                                  disabled={v.status === 'in_use'}
                                >
                                  <Trash2 size={12} />
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
            </div>
          )}

          {/* TAB 3: QUẢN LÝ SỰ CỐ KHẨN CẤP */}
          {activeTab === 'incidents' && (
            <div className="card">
              <div className="card-title">
                <ShieldAlert size={18} color="var(--danger-text)" />
                Báo Cáo Sự Cố & Tiến Trình Xử Lý
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Người báo cáo</th>
                      <th>Loại sự cố</th>
                      <th>Chi tiết sự cố</th>
                      <th>Thời điểm báo</th>
                      <th>Trạng thái</th>
                      <th>Giải pháp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sự cố nào xảy ra.</td>
                      </tr>
                    ) : (
                      incidents.map(i => (
                        <tr key={i._id}>
                          <td><strong>#{i.assignment_id?.order_id?.order_code || 'N/A'}</strong></td>
                          <td>{i.reported_by?.full_name || 'N/A'}</td>
                          <td>
                            <span className="badge badge-danger">
                              {i.incident_type === 'traffic' ? 'Kẹt xe' : 
                               i.incident_type === 'accident' ? 'Tai nạn' : 
                               i.incident_type === 'vehicle_breakdown' ? 'Hỏng xe' : 
                               i.incident_type === 'customer_issue' ? 'Khách hàng' : 'Khác'}
                            </span>
                          </td>
                          <td>{i.description}</td>
                          <td style={{ fontSize: '12px' }}>
                            {new Date(i.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </td>
                          <td>
                            <span className={`badge ${
                              i.status === 'resolved' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {i.status === 'resolved' ? 'Đã giải quyết' : 'Đang xử lý'}
                            </span>
                          </td>
                          <td>
                            {i.status !== 'resolved' ? (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleResolveIncident(i._id)}
                                style={{ gap: '4px' }}
                              >
                                <CheckCircle size={12} /> Xác nhận giải quyết
                              </button>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} color="var(--success)" /> Hoàn tất
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: QUẢN LÝ TÀI XẾ */}
          {activeTab === 'drivers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" onClick={() => setShowDriverModal(true)}>
                  <PlusCircle size={16} /> Thêm Tài Xế Mới
                </button>
              </div>

              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Tên tài xế</th>
                        <th>Email / SĐT</th>
                        <th>Bằng lái</th>
                        <th>Kinh nghiệm</th>
                        <th>Đánh giá</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tài xế nào.</td>
                        </tr>
                      ) : (
                        drivers.map(d => (
                          <tr key={d._id}>
                            <td><strong style={{ color: '#fff' }}>{d.user_id?.full_name || 'N/A'}</strong></td>
                            <td>
                              <div style={{ fontSize: '13px' }}>{d.user_id?.email || 'N/A'}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.user_id?.phone || 'N/A'}</div>
                            </td>
                            <td>
                              <strong style={{ fontFamily: 'monospace' }}>{d.license_number}</strong>
                              <br/> Hạng: {d.license_type}
                            </td>
                            <td>{d.experience_years} năm</td>
                            <td style={{ color: 'var(--warning-text)', fontWeight: 'bold' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={12} style={{ fill: 'var(--warning)', color: 'var(--warning)' }} />
                                {d.rating}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                d.current_status === 'available' ? 'badge-success' :
                                d.current_status === 'off' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {d.current_status === 'available' ? 'Rảnh' :
                                 d.current_status === 'off' ? 'Nghỉ' : 'Đang chạy'}
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

      {/* MODAL THÊM PHƯƠNG TIỆN MỚI */}
      {showVehicleModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3 className="modal-title">
                <Truck size={18} color="var(--primary)" />
                Thêm Phương Tiện Mới Vào Đội Xe
              </h3>
              <button className="modal-close" onClick={() => setShowVehicleModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateVehicle}>
              <div className="form-group">
                <label className="form-label">Biển số xe</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: 29C-999.99"
                  value={newVehicle.plate_number}
                  onChange={(e) => setNewVehicle({...newVehicle, plate_number: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Loại xe</label>
                  <select 
                    className="form-control"
                    value={newVehicle.vehicle_type}
                    onChange={(e) => setNewVehicle({...newVehicle, vehicle_type: e.target.value})}
                  >
                    <option value="truck">Xe tải</option>
                    <option value="van">Xe Van</option>
                    <option value="motorbike">Xe máy</option>
                    <option value="container">Container</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tải trọng chứa tối đa (kg)</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa điểm hiện tại</label>
                <input 
                  type="text"
                  className="form-control"
                  value={newVehicle.current_location}
                  onChange={(e) => setNewVehicle({...newVehicle, current_location: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowVehicleModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Xác Nhận Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM TÀI XẾ MỚI */}
      {showDriverModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Users size={18} color="var(--primary)" />
                Thêm Tài Xế Mới
              </h3>
              <button className="modal-close" onClick={() => setShowDriverModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateDriver}>
              <h4 style={{ marginBottom: '12px', color: '#fff', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>1. Chọn tài khoản Tài xế</h4>
              <div className="form-group">
                <label className="form-label">Tài khoản (Email) *</label>
                <select 
                  className="form-control"
                  value={newDriver.user_id}
                  onChange={(e) => setNewDriver({...newDriver, user_id: e.target.value})}
                  required
                >
                  <option value="">-- Chọn tài khoản --</option>
                  {availableUsersForDriver.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.email} ({u.full_name})
                    </option>
                  ))}
                </select>
                {availableUsersForDriver.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--warning-text)', marginTop: '6px' }}>
                    * Không có tài khoản tài xế nào trống. Vui lòng hướng dẫn tài xế đăng ký tài khoản trước.
                  </p>
                )}
              </div>

              <h4 style={{ marginTop: '16px', marginBottom: '12px', color: '#fff', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>2. Thông tin bằng lái</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Số bằng lái *</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="VD: 123456789"
                    value={newDriver.license_number}
                    onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hạng bằng *</label>
                  <select 
                    className="form-control"
                    value={newDriver.license_type}
                    onChange={(e) => setNewDriver({...newDriver, license_type: e.target.value})}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Số năm kinh nghiệm</label>
                <input 
                  type="number"
                  className="form-control"
                  value={newDriver.experience_years}
                  onChange={(e) => setNewDriver({...newDriver, experience_years: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDriverModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Xác Nhận Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManagerDashboard;