import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Brain,
  TrendingUp,
  Lightbulb,
  Calculator,
  ClipboardCheck,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import Button from '../components/ui/Button';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Predictions',
    description:
      'XGBoost model trained on historical credit data delivers accurate credit-limit recommendations in milliseconds.',
    color: 'bg-[var(--color-navy-100)] text-[var(--color-navy-700)]',
  },
  {
    icon: TrendingUp,
    title: 'Financial Trend Analysis',
    description:
      'Visualize 6-month billing, payment, and repayment-delay trends to understand customer behavior at a glance.',
    color: 'bg-[var(--color-teal-100)] text-[var(--color-teal-700)]',
  },
  {
    icon: Lightbulb,
    title: 'Explainable AI (SHAP)',
    description:
      'SHAP-based feature importance explains exactly why the model recommends a specific credit limit.',
    color: 'bg-[var(--color-navy-100)] text-[var(--color-navy-700)]',
  },
  {
    icon: Calculator,
    title: 'What-If Simulator',
    description:
      'Adjust customer parameters in real time to explore how changes in financial behavior affect the recommendation.',
    color: 'bg-[var(--color-teal-100)] text-[var(--color-teal-700)]',
  },
  {
    icon: ClipboardCheck,
    title: 'Employee Decision Workflow',
    description:
      'Authorize, reject, or flag credit decisions with mandatory rationale — all captured in a structured audit trail.',
    color: 'bg-[var(--color-navy-100)] text-[var(--color-navy-700)]',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Audit Log',
    description:
      'Every model prediction and employee decision is timestamped and stored for compliance and review.',
    color: 'bg-[var(--color-teal-100)] text-[var(--color-teal-700)]',
  },
];

const STATS = [
  { value: 'XGBoost', label: 'ML Model' },
  { value: 'SHAP', label: 'Explainability' },
  { value: '6-Month', label: 'Trend Window' },
  { value: 'MongoDB', label: 'Audit Storage' },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-bg)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Topbar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          background: 'var(--surface-header)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{ background: 'var(--color-teal-600)' }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Credit Limit AI</p>
              <p className="text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>Decision Support System</p>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-on-dark-muted)' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'var(--text-on-dark-muted)'}
            >
              Sign In
            </Link>
            <Link to="/register">
              <Button variant="teal" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--color-navy-900) 0%, var(--color-navy-700) 60%, var(--color-teal-900) 100%)`,
            minHeight: '520px',
          }}
        >
          {/* Decorative background orbs */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--color-teal-500)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10 blur-3xl"
            style={{ background: 'var(--color-navy-400)' }}
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mb-8"
              style={{
                background: 'rgba(14,168,146,0.15)',
                borderColor: 'rgba(14,168,146,0.4)',
                color: 'var(--color-teal-300)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-teal-400)' }} />
              Enterprise Banking Intelligence Platform
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6"
            >
              AI-Based Credit Limit<br />
              <span style={{ color: 'var(--color-teal-400)' }}>Recommendation System</span>
            </h1>

            <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--text-on-dark-muted)' }}>
              Empower bank employees with machine-learning predictions, explainable AI insights, 
              financial trend analysis, and a complete decision audit trail — all in one secure platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button variant="teal" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Sign In to Dashboard
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="!text-white !border-[rgba(255,255,255,0.3)] hover:!bg-[rgba(255,255,255,0.08)]"
                >
                  Request Access
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ───────────────────────────────────────────── */}
        <section
          className="border-b"
          style={{ background: 'var(--color-navy-800)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-on-dark-muted)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-extrabold tracking-tight mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Everything you need for{' '}
              <span style={{ color: 'var(--color-teal-600)' }}>informed credit decisions</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              A complete decision-support toolkit built for internal bank employees — from prediction 
              to audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="group rounded-xl p-6 border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--surface-card)',
                    borderColor: 'var(--border-default)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA Banner ──────────────────────────────────────────── */}
        <section
          className="mx-4 sm:mx-6 lg:mx-auto max-w-6xl mb-20 rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-xl)' }}
        >
          <div
            className="px-8 py-14 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, var(--color-navy-800) 0%, var(--color-teal-800) 100%)`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"
              style={{ background: 'var(--color-teal-400)' }}
              aria-hidden="true"
            />
            <Lock className="w-10 h-10 mx-auto mb-4 text-white opacity-80" />
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Secure. Auditable. Compliant.
            </h2>
            <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-on-dark-muted)' }}>
              Every prediction, simulation, and employee decision is logged, timestamped, and stored — 
              ready for compliance review at any time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {[
                'Model-supported decisions',
                'Full audit trail',
                'Officer accountability',
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--color-teal-300)' }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/login">
                <Button variant="teal" size="lg" rightIcon={<ChevronRight className="w-5 h-5" />}>
                  Access the Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="border-t py-8"
        style={{
          background: 'var(--color-navy-900)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-teal-400)' }} />
            <span>AI-Based Credit Limit Recommendation System © 2026 — Internal Bank Employee System</span>
          </div>
          <div className="text-xs font-mono" style={{ color: 'rgba(168,194,238,0.4)' }}>
            FastAPI · React 19 · XGBoost · MongoDB
          </div>
        </div>
      </footer>

    </div>
  );
}
