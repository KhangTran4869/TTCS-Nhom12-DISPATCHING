import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Truck, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { apiLogin } from '../api';

const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 5;

const roleInfo = {
  manager:    { icon: Shield,      color: 'text-primary-600', bg: 'bg-primary-50',   label: 'Manager Dashboard' },
  dispatcher: { icon: Truck,       color: 'text-emerald-600', bg: 'bg-emerald-50',   label: 'Dispatch Console' },
  driver:     { icon: CheckCircle, color: 'text-amber-600',   bg: 'bg-amber-50',     label: 'Driver Portal' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [loggedInRole, setLoggedInRole] = useState(null);

  // Clear stale session on mount
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutUntil) return;
    const timer = setInterval(() => {
      const remaining = lockoutUntil - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setTimeRemaining('');
        setError('');
        clearInterval(timer);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setError('');
    setLoading(true);

    try {
      const result = await apiLogin({ email, password });

      // Lưu thông tin user và token vào localStorage
      localStorage.setItem('user', JSON.stringify(result.data));
      if (result.token) localStorage.setItem('token', result.token);

      setLoggedInRole(result.data.role);
      setFailedAttempts(0);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
        setError('Account locked due to too many failed attempts.');
      } else {
        setError(`${err.message}. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-primary-50/30 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-600/25">
            <Truck size={28} />
          </div>
          <h1 id="login-title" className="text-2xl font-bold text-slate-900">Logistics Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
          {/* Lockout Alert */}
          {isLocked && (
            <div id="lockout-alert" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Account Temporarily Locked</p>
                <p className="text-xs text-red-600 mt-1">
                  Too many failed login attempts. Try again in{' '}
                  <span className="font-mono font-bold">{timeRemaining}</span>
                </p>
              </div>
            </div>
          )}

          {/* Success Role Indicator */}
          {loggedInRole && roleInfo[loggedInRole] && (
            <div className={`mb-6 p-4 rounded-xl ${roleInfo[loggedInRole].bg} border flex items-center gap-3 animate-fade-in`}>
              {(() => {
                const RoleIcon = roleInfo[loggedInRole].icon;
                return <RoleIcon size={20} className={roleInfo[loggedInRole].color} />;
              })()}
              <div>
                <p className={`text-sm font-semibold ${roleInfo[loggedInRole].color}`}>
                  Authenticated as {loggedInRole.charAt(0).toUpperCase() + loggedInRole.slice(1)}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Redirecting to {roleInfo[loggedInRole].label}…
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              disabled={isLocked || !!loggedInRole}
              required
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              disabled={isLocked || !!loggedInRole}
              required
            />

            {error && !isLocked && (
              <p id="login-error" className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100 animate-fade-in">
                {error}
              </p>
            )}

            {/* Attempt progress */}
            {failedAttempts > 0 && !isLocked && !loggedInRole && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Failed attempts</span>
                  <span className="font-mono">{failedAttempts}/{MAX_ATTEMPTS}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-red-500"
                    style={{ width: `${(failedAttempts / MAX_ATTEMPTS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              id="login-submit"
              type="submit"
              loading={loading}
              disabled={isLocked || !email || !password || !!loggedInRole}
              className="w-full"
              size="lg"
            >
              {isLocked ? 'Account Locked' : loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Create account
              </Link>
            </p>
          </div>

          {/* Role-Based Routing Legend */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 text-center">
              Role-Based Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(roleInfo).map(([role, info]) => {
                const RIcon = info.icon;
                return (
                  <div key={role} className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg ${info.bg} transition-all`}>
                    <RIcon size={16} className={info.color} />
                    <span className={`text-xs font-medium ${info.color}`}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-white/80 rounded-xl border border-slate-200 backdrop-blur">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Getting Started</p>
          <p className="text-xs text-slate-600">
            Register a new account first, then sign in with your email and password.
          </p>
        </div>
      </div>
    </div>
  );
}
