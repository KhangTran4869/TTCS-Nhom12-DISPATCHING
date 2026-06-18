import { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Loader,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

function Register({ onRegisterSuccess, onSwitchToLogin, showToast }) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "driver",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      showToast("Vui lòng nhập họ và tên", "warning");
      return false;
    }

    if (!formData.email.trim()) {
      showToast("Vui lòng nhập email", "warning");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Email không hợp lệ", "warning");
      return false;
    }

    if (!formData.role) {
      showToast("Vui lòng chọn vai trò tài khoản", "warning");
      return false;
    }

    const allowedRoles = ["admin", "dispatcher", "driver", "manager"];

    if (!allowedRoles.includes(formData.role)) {
      showToast("Vai trò tài khoản không hợp lệ", "warning");
      return false;
    }

    if (formData.password.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự", "warning");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("Xác nhận mật khẩu không khớp", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          role: formData.role,
          password: formData.password,
        }),
      });
      const result = await response.json();

      if (result.success) {
        showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
        onRegisterSuccess();
      } else {
        showToast(
          result.message || "Đăng ký thất bại. Email có thể đã tồn tại.",
          "danger",
        );
      }
    } catch (error) {
      showToast(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.",
        "danger",
      );
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
          <h1 className="auth-title">Tạo Tài Khoản</h1>
          <p className="auth-subtitle">
            Đăng ký tài khoản mới để sử dụng hệ thống điều phối
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label className="auth-label">Họ và tên</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <User size={18} />
              </span>
              <input
                id="register-fullname"
                type="text"
                className="auth-input"
                placeholder="Nguyễn Văn A"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Mail size={18} />
              </span>
              <input
                id="register-email"
                type="email"
                className="auth-input"
                placeholder="yourname@company.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">
              Số điện thoại <span className="auth-optional">(tùy chọn)</span>
            </label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Phone size={18} />
              </span>
              <input
                id="register-phone"
                type="tel"
                className="auth-input"
                placeholder="09XXXXXXXX"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Vai trò tài khoản</label>
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">
                <Shield size={18} />
              </span>
              <select
                id="register-role"
                className="auth-input"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                required
              >
                <option value="driver">Tài xế</option>
                <option value="dispatcher">Nhân viên điều phối</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>
          </div>

          <div className="auth-row">
            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
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

            <div className="auth-input-group">
              <label className="auth-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  className="auth-input"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            id="register-submit"
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
                <UserPlus size={18} />
                Đăng Ký Tài Khoản
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Đã có tài khoản?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={onSwitchToLogin}
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
