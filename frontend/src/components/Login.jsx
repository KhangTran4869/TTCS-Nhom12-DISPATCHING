import { useState } from 'react';
import { Shield, Mail, Lock, Loader, Eye, EyeOff, LogIn } from 'lucide-react';

function Login({ onLogin, onSwitchToRegister, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng điền đầy đủ email và mật khẩu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        showToast(`Chào mừng ${result.data.full_name}!`, 'success');
        onLogin(result.data, result.token);
      } else {
        showToast(result.message || 'Email hoặc mật khẩu không đúng', 'danger');
      }
    } catch (error) {
      showToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Vui lòng nhập email', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const result = await response.json();

      if (result.success) {
        showToast(result.message, 'success');
        setIsForgotPassword(false);
        setForgotEmail('');
      } else {
        showToast(result.message || 'Lỗi khôi phục mật khẩu', 'danger');
      }
    } catch (error) {
      showToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>
      <div className="auth-bg-orb auth-bg-orb-3"></div>

      <div className="auth-card animate-fade-in">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={32} />
          </div>
          <h1 className="auth-title">Hệ Thống Điều Phối</h1>
          <p className="auth-subtitle">
            {isForgotPassword ? "Khôi phục mật khẩu tài khoản" : "Đăng nhập để truy cập bảng điều khiển vận tải"}
          </p>
        </div>

        {/* Form */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
              Nhập email của bạn, hệ thống sẽ gửi một mật khẩu mới ngẫu nhiên về email này.
            </p>
            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="yourname@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Khôi Phục Mật Khẩu"
              )}
            </button>

            <button
              type="button"
              className="auth-link"
              onClick={() => setIsForgotPassword(false)}
              style={{ width: "100%", marginTop: "12px", textAlign: "center", display: "block" }}
            >
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  placeholder="yourname@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-12px", marginBottom: "16px" }}>
              <button
                type="button"
                className="auth-link"
                style={{ fontSize: "12px" }}
                onClick={() => setIsForgotPassword(true)}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        {!isForgotPassword && (
          <div className="auth-footer">
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                className="auth-link"
                onClick={onSwitchToRegister}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
