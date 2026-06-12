import { useState } from 'react';
import { Shield, Mail, Lock, Loader } from 'lucide-react';

function Login({ onLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle manual login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng điền đầy đủ email và mật khẩu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Vì backend không có API login riêng, ta sẽ giả lập đăng nhập bằng cách tìm user phù hợp từ danh sách
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        const foundUser = result.data.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (foundUser) {
          // Thành công
          onLogin(foundUser);
        } else {
          showToast('Tài khoản không tồn tại trong hệ thống', 'danger');
        }
      } else {
        showToast('Không thể đăng nhập', 'danger');
      }
    } catch (error) {
      showToast('Lỗi hệ thống khi đăng nhập', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <Shield />
          </div>
          <h2 className="login-title">Hệ Thống Điều Phối</h2>
          <p className="login-subtitle">Đăng nhập tài khoản điều hành và vận chuyển</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="ten@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px', width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', width: '100%' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
            {isSubmitting ? <Loader className="animate-spin" size={16} /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
