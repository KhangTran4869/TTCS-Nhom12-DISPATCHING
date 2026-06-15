import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import DriverDashboard from './components/DriverDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Check for saved session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('dispatching_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed._id) {
          setCurrentUser(parsed);
        }
      }
    } catch (err) {
      localStorage.removeItem('dispatching_user');
    }
    setIsCheckingSession(false);
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('dispatching_user', JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dispatching_user');
    setAuthView('login');
  };

  // Handle register success — switch to login
  const handleRegisterSuccess = () => {
    setAuthView('login');
  };

  // Initial loading
  if (isCheckingSession) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
        <Loader style={{ animation: 'statusPulse 1s infinite' }} size={48} color="var(--primary)" />
        <p style={{ color: 'var(--text-muted)' }}>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  // Not logged in — show Login or Register
  if (!currentUser) {
    return (
      <div className="app-container">
        {authView === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView('register')}
            showToast={showToast}
          />
        ) : (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setAuthView('login')}
            showToast={showToast}
          />
        )}

        {/* Toast Notifications */}
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              <div>{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Logged in — render dashboard based on role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard user={currentUser} showToast={showToast} onLogout={handleLogout} />;
      case 'manager':
        return <ManagerDashboard user={currentUser} showToast={showToast} onLogout={handleLogout} />;
      case 'dispatcher':
        return <DispatcherDashboard user={currentUser} showToast={showToast} onLogout={handleLogout} />;
      case 'driver':
        return <DriverDashboard user={currentUser} showToast={showToast} onLogout={handleLogout} />;
      default:
        return (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <h2 style={{ color: '#fff' }}>Vai trò không xác định</h2>
            <p style={{ color: 'var(--text-muted)' }}>Tài khoản có role: "{currentUser.role}". Vui lòng liên hệ quản trị viên.</p>
            <button className="btn btn-primary" onClick={handleLogout} style={{ marginTop: '20px' }}>Đăng xuất</button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <main style={{ flex: 1 }}>
        {renderDashboard()}
      </main>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div>{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
