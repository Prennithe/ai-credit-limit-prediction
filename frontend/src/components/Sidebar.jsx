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

  return (
    <NavLink
      id={item.id}
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `
        group relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
        transition-all duration-[var(--transition-fast)]
        ${collapsed ? 'justify-center' : ''}
        ${isActive
          ? 'bg-[var(--color-teal-600)] text-white shadow-[var(--shadow-teal)] font-semibold'
          : 'text-[var(--text-on-dark-muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white'
        }
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <span className="truncate flex-1">{item.label}</span>
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
      {/* ── Brand ─────────────────────────────────────── */}
      <div
        className={`
          flex items-center gap-3 px-4 py-4
          border-b border-[var(--border-sidebar)] h-[var(--topbar-height)]
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        <div className="flex-shrink-0 p-1.5 bg-[var(--color-teal-600)] rounded-[var(--radius-md)] shadow-[var(--shadow-teal)]">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">
              Credit Limit AI
            </p>
            <p className="text-[10px] text-[var(--text-on-dark-muted)] truncate mt-0.5">
              Decision Support System
            </p>
          </div>
        )}
      </div>

      {/* ── Customer Badge (if selected) ──────────────── */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          {hasCustomer ? (
            <div className="px-2.5 py-2 rounded-lg bg-[rgba(20,196,171,0.12)] border border-[rgba(20,196,171,0.25)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--color-teal-400)] flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-[var(--color-teal-300)] tracking-wider">
                  Active Customer
                </p>
                <p className="text-xs font-mono font-bold text-white truncate">
                  {customer.customer_id}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[11px] text-[rgba(168,194,238,0.7)] text-center">
              No customer selected
            </div>
          )}
        </div>
      )}

      {/* ── Nav Items ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[rgba(168,194,238,0.45)]">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} collapsed={collapsed} hasCustomer={hasCustomer} />
        ))}
      </nav>

      {/* ── Bottom Bar ────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-[var(--border-sidebar)] space-y-1">
        <button
          id="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
            text-[var(--text-on-dark-muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white
            transition-all duration-[var(--transition-fast)] cursor-pointer text-sm font-medium
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
