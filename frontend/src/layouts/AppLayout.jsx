import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useCustomer } from '../context/CustomerContext';
import {
  Activity,
  ShieldCheck,
  User,
  ChevronRight,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

const ROUTE_TITLES = {
  '/app': { title: 'Overview', crumb: 'Overview' },
  '/app/customers': { title: 'Customer Search & Profile', crumb: 'Customers' },
  '/app/prediction': { title: 'Credit Limit Prediction', crumb: 'Prediction' },
  '/app/financial-trends': { title: 'Financial Trends & History', crumb: 'Financial Trends' },
  '/app/explainability': { title: 'SHAP Model Explainability', crumb: 'Explainability' },
  '/app/simulator': { title: 'What-If Risk Scenario Simulator', crumb: 'Simulator' },
  '/app/decisions': { title: 'Employee Decision & History', crumb: 'Decisions' },
  '/app/audit': { title: 'System Audit Log', crumb: 'Audit Log' },
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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
          <div
            className="fixed inset-0 bg-[var(--surface-overlay)] transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-[260px] bg-[var(--surface-sidebar)] shadow-xl">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <header className="h-[var(--topbar-height)] bg-[var(--surface-header)] border-b border-[var(--border-sidebar)] text-white px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1 text-[var(--text-on-dark-muted)] hover:text-white rounded-md md:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Title */}
            <div className="flex items-center gap-2 min-w-0 text-sm">
              <span className="text-[var(--text-on-dark-muted)] hidden sm:inline">Workspace</span>
              <ChevronRight className="w-4 h-4 text-[rgba(168,194,238,0.5)] hidden sm:inline" />
              <h1 className="font-semibold text-white truncate text-base">
                {currentRoute.title}
              </h1>
            </div>
          </div>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Active Customer pill */}
            {customer && (
              <Link
                to="/app/customers"
                className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(20,196,171,0.15)] text-[var(--color-teal-300)] border border-[rgba(20,196,171,0.3)] hover:bg-[rgba(20,196,171,0.25)] transition-colors"
                title="View customer profile"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">{customer.customer_id}</span>
              </Link>
            )}

            {/* Backend status indicator */}
            <button
              onClick={checkHealth}
              disabled={healthLoading}
              className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] text-slate-200 border border-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
              title="Click to check backend connectivity"
            >
              {backendStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 font-semibold hidden sm:inline">Connected</span>
                </>
              )}
              {backendStatus === 'unavailable' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-300 font-semibold hidden sm:inline">Unavailable</span>
                </>
              )}
              {backendStatus === 'checking' && (
                <>
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="text-amber-300 hidden sm:inline">Checking...</span>
                </>
              )}
            </button>

            {/* Enterprise badge */}
            <span className="hidden xl:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.06)] text-[var(--text-on-dark-muted)] border border-[rgba(255,255,255,0.08)]">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[var(--color-teal-400)]" />
              Secure Session
            </span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-[var(--surface-bg)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[var(--content-max-width)] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
