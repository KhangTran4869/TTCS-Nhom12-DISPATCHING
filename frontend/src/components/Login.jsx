import { useState } from 'react';
import { Shield, Mail, Lock, Loader, Eye, EyeOff, LogIn, KeyRound } from 'lucide-react';

function Login({ onLogin, onSwitchToRegister, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth steps: 'login', 'forgot', 'reset'
  const [step, setStep] = useState('login');
  
  // Forgot/Reset state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setStep('reset');
      } else {
        showToast(result.message || 'Lỗi gửi mã xác nhận', 'danger');
      }
    } catch (error) {
      showToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail, 
          code: resetCode, 
          newPassword 
        }),
      });
      const result = await response.json();

      if (result.success) {
        showToast(result.message, 'success');
        setStep('login');
        setEmail(forgotEmail);
        setPassword('');
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(result.message || 'Lỗi đặt lại mật khẩu', 'danger');
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
            {step === 'forgot' ? "Khôi phục mật khẩu tài khoản" : 
             step === 'reset' ? "Đặt lại mật khẩu mới" : 
             "Đăng nhập để truy cập bảng điều khiển vận tải"}
          </p>
        </div>

        {/* Form */}
        {step === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
              Nhập email của bạn, hệ thống sẽ gửi một mã xác nhận 6 số về email này.
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
                  Đang gửi mã...
                </>
              ) : (
                "Gửi Mã Xác Nhận"
              )}
            </button>

            <button
              type="button"
              className="auth-link"
              onClick={() => setStep('login')}
              style={{ width: "100%", marginTop: "12px", textAlign: "center", display: "block" }}
            >
              Quay lại đăng nhập
            </button>
          </form>
        ) : step === 'reset' ? (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
              Mã xác nhận đã được gửi đến <strong>{forgotEmail}</strong>
            </p>
            
            <div className="auth-input-group">
              <label className="auth-label">Mã xác nhận (6 số)</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <KeyRound size={18} />
                </span>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Nhập mã 6 số"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu mới</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Đang xử lý...
                </>
              ) : (
                "Xác Nhận & Đổi Mật Khẩu"
              )}
            </button>

            <button
              type="button"
              className="auth-link"
              onClick={() => setStep('forgot')}
              style={{ width: "100%", marginTop: "12px", textAlign: "center", display: "block" }}
            >
              Gửi lại mã
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
                onClick={() => setStep('forgot')}
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
        {step === 'login' && (
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
