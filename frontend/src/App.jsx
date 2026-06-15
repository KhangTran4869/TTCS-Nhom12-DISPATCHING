import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import DriverDashboard from './components/DriverDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoleView, setCurrentRoleView] = useState(null); // 'driver', 'dispatcher', 'manager'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          setUsers(result.data);
          
          // Default to the first manager or dispatcher user, or the first user in the list
          const defaultUser = result.data.find(u => u.role === 'manager' || u.role === 'admin') || 
                              result.data.find(u => u.role === 'dispatcher') || 
                              result.data[0];
          
          setCurrentUser(defaultUser);
          if (defaultUser.role === 'admin' || defaultUser.role === 'manager') {
            setCurrentRoleView('manager');
          } else {
            setCurrentRoleView(defaultUser.role);
          }
        } else {
          setError('Không tìm thấy người dùng nào trong cơ sở dữ liệu. Vui lòng tạo tài khoản trước.');
        }
      } catch (err) {
        console.error("Lỗi fetch danh sách user:", err);
        setError('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra trạng thái backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    let targetUser = null;
    if (role === 'manager') {
      targetUser = users.find(u => u.role === 'manager' || u.role === 'admin');
    } else {
      targetUser = users.find(u => u.role === role);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setCurrentRoleView(role);
      showToast(`Đã chuyển sang giao diện: ${
        role === 'driver' ? 'Tài xế' : 
        role === 'dispatcher' ? 'Điều phối viên' : 'Quản trị'
      } (${targetUser.full_name})`, 'success');
    } else {
      showToast(`Không tìm thấy người dùng nào có vai trò này.`, 'warning');
    }
  };

  const handleDriverUserChange = (userId) => {
    const targetUser = users.find(u => u._id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(`Đã đổi sang tài xế: ${targetUser.full_name}`, 'info');
    }
  };

  const dummyLogout = () => {
    showToast('Chức năng đăng xuất bị tắt ở phiên bản không có login.', 'warning');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
        <Loader style={{ animation: 'statusPulse 1s infinite' }} size={48} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)' }}>Đang tải cấu hình người dùng & hệ thống...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h3 style={{ color: '#fff' }}>Kết nối thất bại</h3>
        <p style={{ color: 'var(--danger-text)', maxWidth: '400px' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Dev Switcher Bar */}
      <div className="dev-switcher">
        <div className="dev-switcher-title">
          Hệ Thống Điều Phối & Giám Sát: &nbsp;
          <span>
            {currentRoleView === 'driver' ? 'Giao diện Tài xế' : 
             currentRoleView === 'dispatcher' ? 'Giao diện Điều phối' : 'Giao diện Quản lý'}
          </span>
          
          {currentRoleView === 'driver' && (
            <select 
              value={currentUser?._id || ''} 
              onChange={(e) => handleDriverUserChange(e.target.value)}
              style={{
                marginLeft: '12px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {users.filter(u => u.role === 'driver').map(u => (
                <option key={u._id} value={u._id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          )}
        </div>
        
        <div className="dev-switcher-buttons">
          <button 
            className={`dev-btn ${currentRoleView === 'driver' ? 'active' : ''}`}
            onClick={() => handleRoleChange('driver')}
          >
            Tài xế
          </button>
          <button 
            className={`dev-btn ${currentRoleView === 'dispatcher' ? 'active' : ''}`}
            onClick={() => handleRoleChange('dispatcher')}
          >
            Điều phối
          </button>
          <button 
            className={`dev-btn ${currentRoleView === 'manager' ? 'active' : ''}`}
            onClick={() => handleRoleChange('manager')}
          >
            Quản lý
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <main style={{ flex: 1 }}>
        {currentRoleView === 'driver' && (
          <DriverDashboard user={currentUser} showToast={showToast} onLogout={dummyLogout} />
        )}
        {currentRoleView === 'dispatcher' && (
          <DispatcherDashboard user={currentUser} showToast={showToast} onLogout={dummyLogout} />
        )}
        {currentRoleView === 'manager' && (
          <ManagerDashboard user={currentUser} showToast={showToast} onLogout={dummyLogout} />
        )}
      </main>
    </div>
  );
}

export default App;

