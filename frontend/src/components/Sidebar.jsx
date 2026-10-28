import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Search,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Calculator,
  ClipboardCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Lock,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

const NAV_ITEMS = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    to: '/app',
    id: 'nav-overview',
    end: true,
  },
  {
    label: 'Customer Profile',
    icon: Search,
    to: '/app/customers',
    id: 'nav-customers',
  },
  {
    label: 'Model Prediction',
    icon: Sparkles,
    to: '/app/prediction',
    id: 'nav-prediction',
    requiresCustomer: true,
  },
  {
    label: 'Financial Trends',
    icon: TrendingUp,
    to: '/app/financial-trends',
    id: 'nav-trends',
    requiresCustomer: true,
  },
  {
    label: 'Explainability (SHAP)',
    icon: Lightbulb,
    to: '/app/explainability',
    id: 'nav-explain',
    requiresCustomer: true,
  },
  {
    label: 'What-If Simulator',
    icon: Calculator,
    to: '/app/simulator',
    id: 'nav-simulate',
    requiresCustomer: true,
  },
  {
    label: 'Employee Decision',
    icon: ClipboardCheck,
    to: '/app/decisions',
    id: 'nav-decision',
    requiresCustomer: true,
  },
  {
    label: 'Audit Log',
    icon: ShieldCheck,
    to: '/app/audit',
    id: 'nav-audit',
  },
];

function NavItem({ item, collapsed, hasCustomer }) {
  const Icon = item.icon;
  const locked = item.requiresCustomer && !hasCustomer;

  return (
    <NavLink
      id={item.id}
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : locked ? `${item.label} — select a customer first` : undefined}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-3 py-2.5
        rounded-[var(--radius-md)] text-sm font-medium
        transition-all duration-[var(--transition-fast)]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[var(--color-olive-400)]
        focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-sidebar)]
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? [
              'bg-[rgba(123,138,65,0.28)] text-white font-semibold',
              'before:absolute before:left-0 before:top-1 before:bottom-1',
              'before:w-[3px] before:rounded-r-full before:bg-[var(--color-olive-400)]',
            ].join(' ')
          : locked
          ? 'text-[rgba(197,211,193,0.35)] cursor-not-allowed'
          : 'text-[var(--text-on-dark-muted)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
        }
      `}
    >
      <Icon
        className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-[var(--transition-fast)]
          ${locked ? 'opacity-35' : 'group-hover:text-white'}
        `}
      />
      {!collapsed && (
        <span className="truncate flex-1 leading-tight">{item.label}</span>
      )}
      {!collapsed && locked && (
        <Lock className="w-3 h-3 opacity-30 flex-shrink-0" />
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { customer } = useCustomer();
  const hasCustomer = Boolean(customer?.customer_id);

  return (
    <aside
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      className={`
        flex flex-col h-full
        bg-[var(--surface-sidebar)]
        border-r border-[var(--border-sidebar)]
        transition-[width] duration-[var(--transition-slow)]
        overflow-hidden flex-shrink-0 select-none
      `}
      aria-label="Application navigation"
    >
      {/* ── Brand ──────────────────────────────────────── */}
      <div
        className={`
          flex items-center h-[var(--topbar-height)] flex-shrink-0
          border-b border-[var(--border-sidebar)]
          ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}
        `}
      >
        {/* Logo mark */}
        <div className="
          flex-shrink-0 w-8 h-8 flex items-center justify-center
          rounded-[var(--radius-md)]
          bg-[var(--color-olive-600)]
          shadow-[0_2px_8px_rgba(123,138,65,0.45)]
          ring-1 ring-[rgba(255,255,255,0.12)]
        ">
          <Building2 className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white leading-tight tracking-tight truncate">
              Credit Limit AI
            </p>
            <p className="text-[10px] text-[var(--text-on-dark-muted)] truncate mt-0.5 tracking-wide">
              Decision Support System
            </p>
          </div>
        )}
      </div>

      {/* ── Customer Context Badge ──────────────────────── */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1 flex-shrink-0">
          {hasCustomer ? (
            <div className="
              flex items-center gap-2.5 px-3 py-2.5
              rounded-[var(--radius-md)]
              bg-[rgba(123,138,65,0.18)]
              border border-[rgba(123,138,65,0.38)]
              ring-1 ring-inset ring-[rgba(255,255,255,0.04)]
            ">
              <div className="
                flex-shrink-0 w-6 h-6 rounded-full
                flex items-center justify-center
                bg-[rgba(123,138,65,0.4)]
                border border-[rgba(255,255,255,0.15)]
              ">
                <UserCheck className="w-3.5 h-3.5 text-[var(--color-olive-200)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] uppercase font-bold text-[var(--color-olive-300)] tracking-widest leading-none mb-0.5">
                  Active Customer
                </p>
                <p className="text-xs font-mono font-bold text-white truncate leading-tight">
                  {customer.customer_id}
                </p>
              </div>
            </div>
          ) : (
            <div className="
              px-3 py-2 rounded-[var(--radius-md)]
              bg-[rgba(255,255,255,0.03)]
              border border-[rgba(255,255,255,0.07)]
              text-[11px] text-[var(--text-on-dark-muted)] opacity-70 text-center
              leading-tight
            ">
              No customer selected
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5"
        aria-label="Main navigation"
      >
        {!collapsed && (
          <p className="
            px-3 pt-2 pb-1.5
            text-[10px] font-bold uppercase tracking-[0.1em]
            text-[var(--text-on-dark-muted)] opacity-45
            leading-none
          ">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            hasCustomer={hasCustomer}
          />
        ))}
      </nav>

      {/* ── Collapse Toggle ─────────────────────────────── */}
      <div className="px-2 py-3 flex-shrink-0 border-t border-[var(--border-sidebar)]">
        <button
          id="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5
            rounded-[var(--radius-md)]
            text-[var(--text-on-dark-muted)]
            hover:bg-[rgba(255,255,255,0.07)] hover:text-white
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-[var(--color-olive-400)]
            focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-sidebar)]
            transition-all duration-[var(--transition-fast)]
            cursor-pointer text-sm font-medium
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
