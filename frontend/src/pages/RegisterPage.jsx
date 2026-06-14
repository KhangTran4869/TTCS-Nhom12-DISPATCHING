import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Phone, Lock, User, CheckCircle, Truck } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { apiRegister } from '../api';

const validateFullName = (name) => {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim())) return 'Name contains invalid characters';
  return '';
};

const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return '';
};

const validatePhone = (phone) => {
  if (!phone.trim()) return 'Phone number is required';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return 'Phone number must be at least 10 digits';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain a number';
  return '';
};

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { level: score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 4) return { level: score, label: 'Good', color: 'bg-emerald-400' };
  return { level: score, label: 'Strong', color: 'bg-emerald-600' };
};

const roleOptions = [
  { value: 'driver',     label: 'Driver' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'manager',    label: 'Manager' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'driver' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    if (touched.full_name) newErrors.full_name = validateFullName(form.full_name);
    if (touched.email)     newErrors.email = validateEmail(form.email);
    if (touched.phone)     newErrors.phone = validatePhone(form.phone);
    if (touched.password)  newErrors.password = validatePassword(form.password);
    setErrors(newErrors);
  }, [form, touched]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setServerError('');
  };

  const isFormValid =
    !validateFullName(form.full_name) &&
    !validateEmail(form.email) &&
    !validatePhone(form.phone) &&
    !validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ full_name: true, email: true, phone: true, password: true });
    setServerError('');

    if (!isFormValid) return;

    setLoading(true);
    try {
      await apiRegister({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.status === 409) {
        setServerError('Email đã được đăng ký. Vui lòng dùng email khác.');
      } else {
        setServerError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    }
    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(form.password);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 px-4">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
          <p className="text-sm text-slate-500">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/25">
            <Truck size={28} />
          </div>
          <h1 id="register-title" className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join the Logistics Dispatch platform</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="register-fullname"
              label="Full Name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={handleChange('full_name')}
              icon={User}
              error={touched.full_name ? errors.full_name : ''}
              success={touched.full_name && !errors.full_name ? 'Looks good' : ''}
              required
            />

            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              icon={Mail}
              error={touched.email ? errors.email : ''}
              success={touched.email && !errors.email ? 'Valid format' : ''}
              required
            />

            <Input
              id="register-phone"
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={handleChange('phone')}
              icon={Phone}
              error={touched.phone ? errors.phone : ''}
              success={touched.phone && !errors.phone ? 'Valid phone number' : ''}
              required
            />

            {/* Role Selection */}
            <div className="w-full">
              <label htmlFor="register-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                Role<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="register-role"
                value={form.role}
                onChange={handleChange('role')}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3.5 text-sm text-slate-900 transition-all duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Input
                id="register-password"
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={handleChange('password')}
                icon={Lock}
                error={touched.password ? errors.password : ''}
                required
              />
              {/* Password Strength Meter */}
              {form.password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength.level ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Strength: <span className="font-medium">{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100 animate-fade-in">
                {serverError}
              </p>
            )}

            <Button
              id="register-submit"
              type="submit"
              loading={loading}
              disabled={!isFormValid}
              className="w-full"
              size="lg"
              icon={UserPlus}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
