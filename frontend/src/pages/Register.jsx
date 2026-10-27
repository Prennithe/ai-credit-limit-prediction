import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/ui/Button';

const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

function PasswordStrength({ password }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ['var(--status-danger)', 'var(--status-warning)', 'var(--color-teal-500)', 'var(--status-success)'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < passed ? colors[passed] : 'var(--border-default)',
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[passed] ?? 'var(--text-muted)' }}>
        {labels[passed] ?? ''}
      </p>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.employeeId.trim()) errs.employeeId = 'Employee ID is required.';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.department.trim()) errs.department = 'Department is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    /*
     * NOTE: Registration is UI-only in this phase.
     * When the backend auth endpoints are implemented
     * (POST /auth/register), this will be wired to api.register().
     */
    await new Promise((res) => setTimeout(res, 800));
    setLoading(false);
    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    background: errors[field] ? 'var(--status-danger-bg)' : 'var(--color-navy-50)',
    borderColor: errors[field] ? 'var(--status-danger)' : 'var(--border-default)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
  });

  /* ── Success state ─────────────────────────────────────── */
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--surface-bg)', fontFamily: 'var(--font-sans)' }}
      >
        <div
          className="w-full max-w-md text-center p-10 rounded-2xl border"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-teal-100)', color: 'var(--color-teal-600)' }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
            Request Submitted
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Your access request has been submitted. An administrator will review and activate your account.
            You will be notified at <strong>{form.email}</strong>.
          </p>
          <Link to="/login">
            <Button variant="primary" size="md" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main form ─────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--surface-bg)', fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Left decorative panel ──────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12"
        style={{
          background: `linear-gradient(160deg, var(--color-navy-900) 0%, var(--color-teal-800) 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--color-teal-600)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <p className="text-white font-bold text-sm">Credit Limit AI</p>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Join the Decision<br />Support Platform
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-on-dark-muted)' }}>
            Request access to the AI-powered credit limit recommendation system.
            Your account will be reviewed by an administrator.
          </p>
          <div className="space-y-3">
            {[
              'AI model-generated recommendations',
              'Explainable AI with SHAP analysis',
              'Full decision audit trail',
              'What-if credit scenario simulator',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-teal-300)' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'rgba(168,194,238,0.4)' }}>
          Internal system. Unauthorised access is strictly prohibited.
        </p>
      </div>

      {/* ── Registration form ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-6 sm:p-12 py-10">
        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="p-2 rounded-lg" style={{ background: 'var(--color-teal-600)' }}>
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Credit Limit AI</p>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              Request Access
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Complete the form below. Your account will be activated by an administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="reg-full-name" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4" style={{ color: errors.fullName ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="reg-full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all"
                  style={inputStyle('fullName')}
                />
              </div>
              {errors.fullName && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.fullName}</p>}
            </div>

            {/* Employee ID + Department — 2-col */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-employee-id" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Employee ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Briefcase className="w-4 h-4" style={{ color: errors.employeeId ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                  </div>
                  <input
                    id="reg-employee-id"
                    name="employeeId"
                    type="text"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="EMP001"
                    className="w-full pl-10 pr-3 py-3 text-sm rounded-xl border outline-none transition-all font-mono"
                    style={{ ...inputStyle('employeeId'), fontFamily: 'var(--font-mono)' }}
                  />
                </div>
                {errors.employeeId && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.employeeId}</p>}
              </div>

              <div>
                <label htmlFor="reg-department" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Department
                </label>
                <select
                  id="reg-department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-3 py-3 text-sm rounded-xl border outline-none transition-all appearance-none"
                  style={inputStyle('department')}
                >
                  <option value="">Select…</option>
                  <option value="credit">Credit Risk</option>
                  <option value="retail">Retail Banking</option>
                  <option value="compliance">Compliance</option>
                  <option value="analytics">Analytics</option>
                  <option value="operations">Operations</option>
                </select>
                {errors.department && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.department}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4" style={{ color: errors.email ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="officer@yourbank.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition-all"
                  style={inputStyle('email')}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: errors.password ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border outline-none transition-all"
                  style={inputStyle('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
              {errors.password && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: errors.confirmPassword ? 'var(--status-danger)' : 'var(--text-muted)' }} />
                </div>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border outline-none transition-all"
                  style={inputStyle('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--status-danger)' }}>{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              leftIcon={!loading ? <UserPlus className="w-4 h-4" /> : null}
              className="w-full mt-2"
            >
              {loading ? 'Submitting request…' : 'Submit Access Request'}
            </Button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-teal-600)' }}>
              Sign in
            </Link>
          </p>

          {/* Compliance note */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-teal-500)' }} />
            <span>All access requests are reviewed by a system administrator.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
