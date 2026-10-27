import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ employeeId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.employeeId.trim()) errs.employeeId = 'Employee ID is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setAuthError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setAuthError('');

    /*
     * NOTE: Real authentication is not yet implemented.
     * This form is UI-only. When the backend auth endpoints are
     * added (POST /auth/login returning a JWT), this section
     * will be wired to api.login() and the token stored in
     * an AuthContext.
     *
     * For now, route to the existing Home page so all
     * currently-working functionality remains accessible.
     */
    await new Promise((res) => setTimeout(res, 700)); // simulate latency
    setLoading(false);
    navigate('/app');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--surface-bg)', fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Left panel (decorative, hidden on mobile) ──────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
        style={{
          background: `linear-gradient(160deg, var(--color-navy-900) 0%, var(--color-navy-700) 55%, var(--color-teal-800) 100%)`,
        }}
      >
        {/* Background orb */}
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-teal-400)' }}
          aria-hidden="true"
        />

        {/* Brand */}
        <div className="flex items-center gap-3 relative">
          <div className="p-2 rounded-lg" style={{ background: 'var(--color-teal-600)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Credit Limit AI</p>
            <p className="text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>Decision Support System</p>
          </div>
        </div>

        {/* Highlight cards */}
        <div className="relative space-y-4">
          {[
            { icon: ShieldCheck, title: 'Secure & Auditable', desc: 'Every decision is logged with officer ID and timestamp.' },
            { icon: Building2, title: 'Bank-Grade Platform', desc: 'Built for internal employee use with enterprise-level controls.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="flex-shrink-0 p-2 rounded-lg"
                style={{ background: 'rgba(14,168,146,0.2)', color: 'var(--color-teal-400)' }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-on-dark-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="relative text-xs" style={{ color: 'rgba(168,194,238,0.45)' }}>
          Internal system — authorised bank employees only.
        </p>
      </div>

      {/* ── Right panel — Login form ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="p-2 rounded-lg" style={{ background: 'var(--color-teal-600)' }}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Credit Limit AI</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-extrabold tracking-tight mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in with your employee credentials to continue.
            </p>
          </div>

          {/* Auth-level error */}
          {authError && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-6 text-sm"
              style={{
                background: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                color: 'var(--status-danger)',
              }}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Employee ID */}
            <div>
              <label
                htmlFor="login-employee-id"
                className="block text-sm font-semibold mb-1.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4" style={{ color: errors.employeeId ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="login-employee-id"
                  name="employeeId"
                  type="text"
                  autoComplete="username"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP001 or officer@bank.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all font-mono"
                  style={{
                    background: errors.employeeId ? 'var(--status-danger-bg)' : 'var(--color-navy-50)',
                    borderColor: errors.employeeId ? 'var(--status-danger)' : 'var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={e => !errors.employeeId && (e.target.style.borderColor = 'var(--color-navy-400)')}
                  onBlur={e => !errors.employeeId && (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>
              {errors.employeeId && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>
                  {errors.employeeId}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Password
                </label>
                <Link
                  to="#"
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-teal-600)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: errors.password ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border outline-none transition-all"
                  style={{
                    background: errors.password ? 'var(--status-danger-bg)' : 'var(--color-navy-50)',
                    borderColor: errors.password ? 'var(--status-danger)' : 'var(--border-default)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onFocus={e => !errors.password && (e.target.style.borderColor = 'var(--color-navy-400)')}
                  onBlur={e => !errors.password && (e.target.style.borderColor = 'var(--border-default)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              leftIcon={!loading ? <LogIn className="w-4 h-4" /> : null}
              className="w-full mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>

          </form>

          {/* Footer link */}
          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
            Need access?{' '}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: 'var(--color-teal-600)' }}
            >
              Request an account
            </Link>
          </p>

          {/* Compliance note */}
          <div
            className="flex items-center justify-center gap-2 mt-8 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-teal-500)' }} />
            <span>Authorised bank employees only. Unauthorised access is prohibited.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
