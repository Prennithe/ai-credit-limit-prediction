import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useCustomer } from '../context/CustomerContext';
import {
  Activity,
  ShieldCheck,
  ChevronRight,
  Menu,
  CreditCard,
  Wifi,
  WifiOff,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/app':                 { title: 'Overview',                    crumb: 'Overview' },
  '/app/customers':       { title: 'Customer Search & Profile',   crumb: 'Customers' },
  '/app/prediction':      { title: 'Credit Limit Prediction',     crumb: 'Prediction' },
  '/app/financial-trends':{ title: 'Financial Trends & History',  crumb: 'Financial Trends' },
  '/app/explainability':  { title: 'SHAP Model Explainability',   crumb: 'Explainability' },
  '/app/simulator':       { title: 'What-If Risk Scenario Simulator', crumb: 'Simulator' },
  '/app/decisions':       { title: 'Employee Decision & History', crumb: 'Decisions' },
  '/app/audit':           { title: 'System Audit Log',            crumb: 'Audit Log' },
};

export default function AppLayout() {
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const location                      = useLocation();

  const {
    backendStatus,
    healthLoading,
    checkHealth,
    customer,
  } = useCustomer();

  const currentRoute = ROUTE_TITLES[location.pathname] || {
    title: 'Workspace',
    crumb: 'App',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--surface-bg)] text-[var(--text-primary)] font-sans antialiased">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <div className="hidden md:block h-full">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[var(--surface-overlay)] transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-10 h-full w-[260px] bg-[var(--surface-sidebar)] shadow-[var(--shadow-xl)]">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* ── Top Header Bar ──────────────────────────────── */}
        <header
          className="
            h-[var(--topbar-height)] flex-shrink-0
            bg-[var(--surface-header)]
            border-b border-[rgba(255,255,255,0.08)]
            px-4 sm:px-5
            flex items-center justify-between gap-3
          "
        >
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="
                flex-shrink-0 p-1.5 -ml-0.5
                rounded-[var(--radius-md)]
                text-[var(--text-on-dark-muted)]
                hover:bg-[rgba(255,255,255,0.08)] hover:text-white
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--color-olive-400)]
                transition-colors duration-[var(--transition-fast)]
                md:hidden cursor-pointer
              "
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Vertical divider (desktop) */}
            <span className="hidden md:block w-px h-5 bg-[rgba(255,255,255,0.12)] flex-shrink-0" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[var(--text-on-dark-muted)] text-sm hidden sm:inline whitespace-nowrap">
                Workspace
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[rgba(197,211,193,0.4)] flex-shrink-0 hidden sm:block" />
              <h1 className="text-sm font-semibold text-white truncate leading-tight">
                {currentRoute.title}
              </h1>
            </div>
          </div>

          {/* Right: status controls */}
          <div className="flex items-center gap-2.5 flex-shrink-0">

            {/* Active Customer pill */}
            {customer && (
              <Link
                to="/app/customers"
                title="View customer profile"
                className="
                  hidden sm:flex items-center gap-1.5
                  px-2.5 py-1 rounded-full
                  text-[11px] font-semibold font-mono
                  bg-[rgba(123,138,65,0.22)]
                  text-[#d9e8b0]
                  border border-[rgba(123,138,65,0.45)]
                  hover:bg-[rgba(123,138,65,0.35)] hover:text-white
                  transition-colors duration-[var(--transition-fast)]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[var(--color-olive-400)]
                "
              >
                <CreditCard className="w-3 h-3 text-[var(--color-olive-300)] flex-shrink-0" />
                <span className="tracking-wide">{customer.customer_id}</span>
              </Link>
            )}

            {/* Backend connectivity button */}
            <button
              onClick={checkHealth}
              disabled={healthLoading}
              title="Click to check backend connectivity"
              aria-label={
                backendStatus === 'connected'   ? 'Backend connected — click to recheck' :
                backendStatus === 'unavailable' ? 'Backend unavailable — click to recheck' :
                'Checking backend status…'
              }
              className="
                flex items-center gap-1.5
                px-2.5 py-1 rounded-full
                text-[11px] font-medium
                bg-[rgba(255,255,255,0.07)]
                border border-[rgba(255,255,255,0.12)]
                hover:bg-[rgba(255,255,255,0.13)]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[var(--color-olive-400)]
                transition-colors duration-[var(--transition-fast)]
                cursor-pointer disabled:cursor-default
              "
            >
              {backendStatus === 'connected' && (
                <>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-sage-muted)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-sage-muted)]" />
                  </span>
                  <span className="text-[#C5D3C1] font-semibold hidden sm:inline">Connected</span>
                </>
              )}
              {backendStatus === 'unavailable' && (
                <>
                  <WifiOff className="w-3 h-3 text-[var(--color-rose-soft)] flex-shrink-0" />
                  <span className="text-[var(--color-rose-soft)] font-semibold hidden sm:inline">Unavailable</span>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <Activity className="w-3 h-3 text-amber-300 animate-spin flex-shrink-0" />
                  <span className="text-amber-200 hidden sm:inline">Checking…</span>
                </>
              )}
            </button>

            {/* Enterprise secure badge */}
            <span className="
              hidden xl:inline-flex items-center gap-1.5
              px-2.5 py-1 rounded-full
              text-[11px] font-medium
              bg-[rgba(255,255,255,0.05)]
              text-[var(--text-on-dark-muted)]
              border border-[rgba(255,255,255,0.08)]
            ">
              <ShieldCheck className="w-3 h-3 text-[var(--color-olive-400)] flex-shrink-0" />
              Secure Session
            </span>
          </div>
        </header>

        {/* ── Scrollable Page Body ─────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[var(--surface-bg)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[var(--content-max-width)] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
