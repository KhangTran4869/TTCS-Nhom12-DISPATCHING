import { useState, useEffect } from 'react';
import { PlusCircle, ListTodo, Map, AlertOctagon, UserCheck, Truck, Loader, Calendar, FileText, Send } from 'lucide-react';

function DispatcherDashboard({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'dispatch', 'orders', 'tracking', 'incidents'
  
  // Data lists
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Order Form state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    order_code: '',
    sender_name: '',
    sender_phone: '',
    pickup_address: '',
    pickup_lat: 21.0285,
    pickup_lng: 105.8542,
    receiver_name: '',
    receiver_phone: '',
    delivery_address: '',
    delivery_lat: 21.0185,
    delivery_lng: 105.8442,
    cargo_description: '',
    cargo_weight: 150,
    priority: 'normal',
  });

  // Dispatch Form state
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [dispatching, setDispatching] = useState(false);

  // Load all required data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resOrders, resDrivers, resVehicles, resAssignments, resIncidents, resLocations] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/drivers'),
        fetch('/api/vehicles'),
        fetch('/api/dispatch-assignments'),
        fetch('/api/incidents'),
        fetch('/api/driver-locations')
      ]);

      const [dataOrders, dataDrivers, dataVehicles, dataAssignments, dataIncidents, dataLocations] = await Promise.all([
        resOrders.json(),
        resDrivers.json(),
        resVehicles.json(),
        resAssignments.json(),
        resIncidents.json(),
        resLocations.json()
      ]);

      if (dataOrders.success) setOrders(dataOrders.data || []);
      if (dataDrivers.success) setDrivers(dataDrivers.data || []);
      if (dataVehicles.success) setVehicles(dataVehicles.data || []);
      if (dataAssignments.success) setAssignments(dataAssignments.data || []);
      if (dataIncidents.success) setIncidents(dataIncidents.data || []);
      if (dataLocations.success) setLocations(dataLocations.data || []);

    } catch (error) {
      console.error(error);
      showToast('Lỗi khi tải dữ liệu từ server', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Tự động làm mới dữ liệu định kỳ mỗi 8 giây để mô phỏng real-time tracking!
    const interval = setInterval(() => {
      refreshTrackingData();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Chỉ làm mới tọa độ xe và phân công để tránh giật lag khi người dùng đang nhập form
  const refreshTrackingData = async () => {
    try {
      const [resAssignments, resLocations, resIncidents] = await Promise.all([
        fetch('/api/dispatch-assignments'),
        fetch('/api/driver-locations'),
        fetch('/api/incidents')
      ]);
      const [dataAssignments, dataLocations, dataIncidents] = await Promise.all([
        resAssignments.json(),
        resLocations.json(),
        resIncidents.json()
      ]);
      if (dataAssignments.success) setAssignments(dataAssignments.data || []);
      if (dataLocations.success) setLocations(dataLocations.data || []);
      if (dataIncidents.success) setIncidents(dataIncidents.data || []);
    } catch (error) {
      console.error('Lỗi tự động làm mới tracking:', error);
    }
  };

  // Helper: Trích xuất tên người dùng của driver
  const getDriverName = (driver) => {
    if (!driver) return 'Không rõ';
    return driver.user_id?.full_name || 'Hồ sơ chưa có tên';
  };

  // Tạo đơn hàng mới
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const orderCodeStr = newOrder.order_code || `ORD-${Date.now().toString().slice(-6)}`;
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: orderCodeStr,
          sender_name: newOrder.sender_name,
          sender_phone: newOrder.sender_phone,
          pickup_address: newOrder.pickup_address,
          pickup_location: { lat: parseFloat(newOrder.pickup_lat), lng: parseFloat(newOrder.pickup_lng) },
          receiver_name: newOrder.receiver_name,
          receiver_phone: newOrder.receiver_phone,
          delivery_address: newOrder.delivery_address,
          delivery_location: { lat: parseFloat(newOrder.delivery_lat), lng: parseFloat(newOrder.delivery_lng) },
          cargo_description: newOrder.cargo_description,
          cargo_weight: parseFloat(newOrder.cargo_weight),
          priority: newOrder.priority,
          status: 'pending'
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Tạo đơn hàng ${orderCodeStr} thành công!`, 'success');
        setShowOrderModal(false);
        // Reset form
        setNewOrder({
          order_code: '',
          sender_name: '',
          sender_phone: '',
          pickup_address: '',
          pickup_lat: 21.0285,
          pickup_lng: 105.8542,
          receiver_name: '',
          receiver_phone: '',
          delivery_address: '',
          delivery_lat: 21.0185,
          delivery_lng: 105.8442,
          cargo_description: '',
          cargo_weight: 150,
          priority: 'normal',
        });
        loadData();
      } else {
        showToast(result.message || 'Lỗi khi tạo đơn hàng', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối máy chủ', 'danger');
    }
  };

  // Tiến hành phân công xe & tài xế
  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDriver || !selectedVehicle) {
      showToast('Vui lòng chọn đầy đủ Đơn hàng, Tài xế và Phương tiện!', 'warning');
      return;
    }

    setDispatching(true);
    
    // Lấy thông tin tọa độ từ đơn hàng để gán vào lộ trình route_points
    const orderObj = orders.find(o => o._id === selectedOrder);
    const pickupAddress = orderObj?.pickup_address || '';
    const deliveryAddress = orderObj?.delivery_address || '';
    const pickupLoc = orderObj?.pickup_location || { lat: 21.0285, lng: 105.8542 };
    const deliveryLoc = orderObj?.delivery_location || { lat: 21.0185, lng: 105.8442 };

    const routePoints = [
      { sequence_no: 1, address: pickupAddress, lat: pickupLoc.lat, lng: pickupLoc.lng, point_type: 'pickup' },
      { sequence_no: 2, address: deliveryAddress, lat: deliveryLoc.lat, lng: deliveryLoc.lng, point_type: 'delivery' }
    ];

    try {
      const response = await fetch('/api/dispatch-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder,
          driver_id: selectedDriver,
          vehicle_id: selectedVehicle,
          dispatcher_id: user._id,
          assignment_status: 'assigned',
          route_points: routePoints,
          note: assignmentNote
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Phân công vận chuyển thành công! Đơn hàng đã chuyển sang trạng thái Assigned.', 'success');
        // Reset form chọn
        setSelectedOrder('');
        setSelectedDriver('');
        setSelectedVehicle('');
        setAssignmentNote('');
        loadData();
      } else {
        showToast(result.message || 'Phân công thất bại', 'danger');
      }
    } catch (error) {
      showToast('Lỗi máy chủ', 'danger');
    } finally {
      setDispatching(false);
    }
  };

  // Huỷ phân công
  const handleCancelAssignment = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy phân công này?')) return;
    try {
      const response = await fetch(`/api/dispatch-assignments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_status: 'cancelled' })
      });
      const result = await response.json();
      if (result.success) {
        showToast('Đã hủy phân công vận chuyển', 'info');
        loadData();
      } else {
        showToast('Hủy phân công thất bại', 'danger');
      }
    } catch (error) {
      showToast('Lỗi kết nối', 'danger');
    }
  };

  // Lọc tài xế và xe khả dụng
  const availableDrivers = drivers.filter(d => d.current_status === 'available');
  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      
      {/* Tiêu đề & Nút Tạo Đơn Hàng Nhanh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, textAlign: 'left', color: '#fff' }}>
            Bảng Điều Phối Vận Tải
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Chào {user.full_name}, quản lý đội xe và phân phối đơn hàng hiệu quả.
          </p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setShowOrderModal(true)}>
          <PlusCircle size={16} /> Tạo Đơn Hàng Mới
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${activeTab === 'dispatch' ? 'active' : ''}`} onClick={() => setActiveTab('dispatch')}>
          <UserCheck size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Phân Công Giao Nhận
        </div>
        <div className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ListTodo size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Danh Sách Đơn Hàng ({orders.length})
        </div>
        <div className={`tab ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
          <Map size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Giám Sát GPS & Lộ Trình
        </div>
        <div className={`tab ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
          <AlertOctagon size={14} style={{ inlineSize: '14px', marginRight: '6px' }} /> Sự Cố Khẩn Cấp ({incidents.filter(i => i.status !== 'resolved').length})
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '40px 0' }}>
          <Loader style={{ animation: 'statusPulse 1s infinite' }} size={32} />
        </div>
      )}

      {/* TABS CONTENT */}
      {!loading && (
        <>
          {/* TAB 1: PHÂN CÔNG GIAO NHẬN */}
          {activeTab === 'dispatch' && (
            <div className="dashboard-grid" style={{ padding: 0 }}>
              
              {/* Form Phân công */}
              <div className="col-4">
                <div className="card">
                  <div className="card-title">
                    <Send size={18} color="var(--primary)" />
                    Tạo Phân Công Mới
                  </div>
                  
                  <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Chọn Đơn Vận Chuyển Đang Chờ</label>
                      <select 
                        className="form-control"
                        value={selectedOrder}
                        onChange={(e) => setSelectedOrder(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn đơn hàng ({pendingOrders.length} đơn chờ) --</option>
                        {pendingOrders.map(o => (
                          <option key={o._id} value={o._id}>
                            #{o.order_code} - Giao {o.receiver_name} ({o.cargo_weight} kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Chọn Tài Xế Sẵn Sàng</label>
                      <select 
                        className="form-control"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn tài xế ({availableDrivers.length} rảnh) --</option>
                        {availableDrivers.map(d => (
                          <option key={d._id} value={d._id}>
                            {getDriverName(d)} (Bằng {d.license_type} - {d.experience_years} năm KN)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Chọn Xe Sẵn Sàng</label>
                      <select 
                        className="form-control"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn phương tiện ({availableVehicles.length} rảnh) --</option>
                        {availableVehicles.map(v => (
                          <option key={v._id} value={v._id}>
                            {v.plate_number} - {v.vehicle_type === 'truck' ? 'Xe Tải' : v.vehicle_type === 'van' ? 'Xe Van' : v.vehicle_type} (Tải {v.capacity} kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Ghi chú vận chuyển (nếu có)</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Yêu cầu giao đúng giờ, đi đường tránh..."
                        value={assignmentNote}
                        onChange={(e) => setAssignmentNote(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={dispatching}>
                      {dispatching ? 'Đang phân công...' : 'Xác Nhận Điều Xe & Phân Công'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Danh sách các phân công hiện tại */}
              <div className="col-8">
                <div className="card">
                  <div className="card-title">
                    <Truck size={18} color="var(--success)" />
                    Danh Sách Điều Xe Đang Vận Hành ({assignments.length})
                  </div>
                  
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Đơn hàng</th>
                          <th>Tài xế</th>
                          <th>Phương tiện</th>
                          <th>Trạng thái</th>
                          <th>Khởi hành</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có phân công vận chuyển nào.</td>
                          </tr>
                        ) : (
                          assignments.map(a => (
                            <tr key={a._id}>
                              <td>
                                <strong style={{ color: '#fff' }}>#{a.order_id?.order_code || 'N/A'}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Từ: {a.order_id?.pickup_address.substring(0, 20)}...
                                </div>
                              </td>
                              <td>{a.driver_id?.user_id?.full_name || 'N/A'}</td>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.vehicle_id?.plate_number || 'N/A'}</span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  a.assignment_status === 'assigned' ? 'badge-primary' :
                                  a.assignment_status === 'accepted' ? 'badge-info' :
                                  a.assignment_status === 'in_progress' ? 'badge-warning' :
                                  a.assignment_status === 'completed' ? 'badge-success' : 'badge-danger'
                                }`}>
                                  {a.assignment_status === 'assigned' ? 'Chờ nhận' :
                                   a.assignment_status === 'accepted' ? 'Đã nhận' :
                                   a.assignment_status === 'in_progress' ? 'Đang đi' :
                                   a.assignment_status === 'completed' ? 'Đã giao' : 'Đã huỷ'}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px' }}>
                                {a.start_time ? new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                              </td>
                              <td>
                                {['assigned', 'accepted'].includes(a.assignment_status) && (
                                  <button className="btn btn-danger btn-sm" onClick={() => handleCancelAssignment(a._id)}>
                                    Hủy
                                  </button>
                                )}
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
          )}

          {/* TAB 2: DANH SÁCH ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="card">
              <div className="card-title">
                <ListTodo size={18} />
                Tất Cả Đơn Vận Chuyển Trong Hệ Thống
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Người gửi (Điểm đi)</th>
                      <th>Người nhận (Điểm đến)</th>
                      <th>Mô tả & Cân nặng</th>
                      <th>Độ ưu tiên</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không có đơn hàng nào.</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o._id}>
                          <td><strong style={{ color: '#fff' }}>#{o.order_code}</strong></td>
                          <td>
                            <div>{o.sender_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.pickup_address}</div>
                          </td>
                          <td>
                            <div>{o.receiver_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.delivery_address}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>{o.cargo_description}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.cargo_weight} kg</div>
                          </td>
                          <td>
                            <span className={`badge ${
                              o.priority === 'urgent' ? 'badge-danger' : 
                              o.priority === 'high' ? 'badge-warning' : 'badge-primary'
                            }`}>
                              {o.priority === 'urgent' ? 'Khẩn cấp' : o.priority === 'high' ? 'Cao' : 'Thường'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              o.status === 'pending' ? 'badge-info' :
                              o.status === 'assigned' ? 'badge-primary' :
                              o.status === 'in_transit' ? 'badge-warning' :
                              o.status === 'delivered' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {o.status === 'pending' ? 'Chờ điều phối' :
                               o.status === 'assigned' ? 'Đã gán xe' :
                               o.status === 'in_transit' ? 'Đang đi giao' :
                               o.status === 'delivered' ? 'Đã hoàn thành' : 'Đã huỷ'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GIÁM SÁT HÀNH TRÌNH GPS */}
          {activeTab === 'tracking' && (
            <div className="dashboard-grid" style={{ padding: 0 }}>
              
              {/* Cột trái: Danh sách các xe đang chạy */}
              <div className="col-4">
                <div className="card">
                  <div className="card-title">
                    <Truck size={18} color="var(--info)" />
                    Xe Đang Giao Hàng
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignments.filter(a => a.assignment_status === 'in_progress').length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                        Hiện không có chuyến đi nào đang trong tiến trình giao nhận.
                      </p>
                    ) : (
                      assignments.filter(a => a.assignment_status === 'in_progress').map(a => {
                        // Tìm tọa độ GPS mới nhất của tài xế này
                        const activeLocs = locations.filter(l => l.assignment_id && l.assignment_id._id === a._id);
                        const latestLoc = activeLocs[0]; // Sắp xếp giảm dần nên phần tử đầu tiên là mới nhất

                        return (
                          <div 
                            key={a._id}
                            style={{ 
                              padding: '12px', 
                              borderRadius: '8px', 
                              background: 'rgba(255,255,255,0.03)', 
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ color: '#fff', fontSize: '14px' }}>#{a.order_id?.order_code}</strong>
                              <span className="pulse-dot"></span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Tài xế: {getDriverName(a.driver_id)} ({a.vehicle_id?.plate_number})
                            </p>
                            {latestLoc ? (
                              <p style={{ fontSize: '11px', color: 'var(--info-text)', fontFamily: 'monospace' }}>
                                Tọa độ: {latestLoc.lat.toFixed(5)}, {latestLoc.lng.toFixed(5)} ({latestLoc.speed} km/h)
                              </p>
                            ) : (
                              <p style={{ fontSize: '11px', color: 'var(--text-dark)' }}>
                                Chưa cập nhật tín hiệu GPS
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Bản đồ giám sát tổng hợp mô phỏng */}
              <div className="col-8">
                <div className="card">
                  <div className="card-title">
                    <Map size={18} color="var(--primary)" />
                    Bản Đồ Vận Tải Trực Tuyến
                  </div>

                  <div className="map-simulation" style={{ height: '450px' }}>
                    <div className="map-grid-bg"></div>
                    
                    {/* Vẽ các tuyến đường và vị trí xe */}
                    {assignments.filter(a => a.assignment_status === 'in_progress').map((a, index) => {
                      const activeLocs = locations.filter(l => l.assignment_id && l.assignment_id._id === a._id);
                      const latestLoc = activeLocs[0];
                      
                      // Vẽ marker xe trên bản đồ ở các vị trí khác nhau để phân biệt
                      const offsetLat = 21.0285 + (index * 0.005) - 0.002;
                      const offsetLng = 105.8542 + (index * 0.005) - 0.002;
                      
                      const latVal = latestLoc ? latestLoc.lat : offsetLat;
                      const lngVal = latestLoc ? latestLoc.lng : offsetLng;

                      // Chuyển đổi tọa độ thành phần trăm pixel trên màn hình mô phỏng
                      const mapX = 30 + ((lngVal - 105.85) * 800) % 60;
                      const mapY = 70 - ((latVal - 21.02) * 800) % 60;

                      return (
                        <div key={a._id}>
                          {/* Point A (Pickup) */}
                          <div className="map-point pickup" style={{ left: `${mapX - 10}%`, top: `${mapY + 15}%`, fontSize: '7px' }}>
                            A
                          </div>
                          
                          {/* Point B (Delivery) */}
                          <div className="map-point delivery" style={{ left: `${mapX + 15}%`, top: `${mapY - 15}%`, fontSize: '7px' }}>
                            B
                          </div>

                          {/* Xe tải */}
                          <div 
                            className="map-car-marker" 
                            style={{ 
                              left: `${mapX}%`, 
                              top: `${mapY}%`,
                              background: index % 2 === 0 ? 'var(--primary)' : 'var(--info)'
                            }}
                          >
                            <Truck size={14} className="map-car-icon" />
                          </div>

                          <div className="map-label" style={{ left: `${mapX}%`, top: `${mapY - 7}%`, transform: 'translateX(-50%)' }}>
                            #{a.order_id?.order_code} ({getDriverName(a.driver_id)})
                          </div>
                        </div>
                      );
                    })}

                    {assignments.filter(a => a.assignment_status === 'in_progress').length === 0 && (
                      <p style={{ zIndex: 10 }}>Không có xe nào đang vận hành trên đường.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: DANH SÁCH SỰ CỐ KHẨN CẤP */}
          {activeTab === 'incidents' && (
            <div className="card">
              <div className="card-title" style={{ color: 'var(--danger-text)' }}>
                <AlertOctagon size={18} />
                Báo Cáo Sự Cố Trên Lộ Trình Giao Hàng
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Chuyến đi</th>
                      <th>Người báo cáo</th>
                      <th>Loại sự cố</th>
                      <th>Nội dung chi tiết</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa ghi nhận sự cố nào.</td>
                      </tr>
                    ) : (
                      incidents.map(i => (
                        <tr key={i._id}>
                          <td>
                            <strong style={{ color: '#fff' }}>
                              #{i.assignment_id?.order_id?.order_code || i.assignment_id?._id?.substring(18) || 'N/A'}
                            </strong>
                          </td>
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
                              i.status === 'resolved' ? 'badge-success' : 
                              i.status === 'processing' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {i.status === 'resolved' ? 'Đã xử lý' : 
                               i.status === 'processing' ? 'Đang xử lý' : 'Mới tiếp nhận'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </>
      )}

      {/* MODAL TẠO ĐƠN HÀNG MỚI */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} color="var(--primary)" />
                Tạo Đơn Hàng Vận Chuyển Mới
              </h3>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mã Đơn Hàng (Tự động nếu để trống)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: ORD-998"
                    value={newOrder.order_code}
                    onChange={(e) => setNewOrder({...newOrder, order_code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trọng lượng hàng (kg)</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={newOrder.cargo_weight}
                    onChange={(e) => setNewOrder({...newOrder, cargo_weight: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Người Gửi (Họ tên)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn Gửi"
                    value={newOrder.sender_name}
                    onChange={(e) => setNewOrder({...newOrder, sender_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại gửi</label>
                  <input 
                    type="tel"
                    className="form-control"
                    placeholder="09XXXXXXXX"
                    value={newOrder.sender_phone}
                    onChange={(e) => setNewOrder({...newOrder, sender_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ NHẬN HÀNG (Điểm đi)</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Cảng ICD Gia Lâm, Hà Nội"
                  value={newOrder.pickup_address}
                  onChange={(e) => setNewOrder({...newOrder, pickup_address: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Người Nhận (Họ tên)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Trần Thị Nhận"
                    value={newOrder.receiver_name}
                    onChange={(e) => setNewOrder({...newOrder, receiver_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại nhận</label>
                  <input 
                    type="tel"
                    className="form-control"
                    placeholder="09XXXXXXXX"
                    value={newOrder.receiver_phone}
                    onChange={(e) => setNewOrder({...newOrder, receiver_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Địa chỉ GIAO HÀNG (Điểm đến)</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: KCN Bắc Thăng Long, Đông Anh, Hà Nội"
                  value={newOrder.delivery_address}
                  onChange={(e) => setNewOrder({...newOrder, delivery_address: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mô tả hàng hóa</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Thiết bị điện tử đóng thùng gỗ"
                    value={newOrder.cargo_description}
                    onChange={(e) => setNewOrder({...newOrder, cargo_description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Độ ưu tiên</label>
                  <select 
                    className="form-control"
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                  >
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowOrderModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Xác nhận Tạo đơn hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DispatcherDashboard;
