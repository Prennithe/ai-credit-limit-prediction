import React from 'react';
import { User, CreditCard, Calendar, GraduationCap, Heart, Users } from 'lucide-react';
import { formatCurrency, formatSex, formatEducation, formatMarriage } from '../utils/formatters';

/* ── Profile field cell ──────────────────────────────────────── */
function ProfileCell({ icon: Icon, label, value, accent = false }) {
  return (
    <div className={`
      p-4 rounded-[var(--radius-lg)] border
      ${accent
        ? 'bg-[rgba(123,138,65,0.07)] border-[rgba(123,138,65,0.25)]'
        : 'bg-[var(--surface-bg)] border-[var(--border-muted)]'
      }
    `}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-1.5">
        <Icon className={`w-3 h-3 flex-shrink-0 ${accent ? 'text-[var(--brand-secondary)]' : 'text-[var(--text-muted)]'}`} />
        <span className={accent ? 'text-[var(--brand-secondary)]' : 'text-[var(--text-muted)]'}>{label}</span>
      </div>
      <div className={`text-sm font-bold leading-tight ${accent ? 'text-[var(--text-primary)] font-mono' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
    </div>
  );
}

export default function CustomerProfile({ customer }) {
  if (!customer) return null;

  const { customer_id, profile, credit_history } = customer;
  const age               = profile?.age ?? 'N/A';
  const sexFormatted      = formatSex(profile?.sex);
  const educationFormatted = formatEducation(profile?.education);
  const marriageFormatted = formatMarriage(profile?.marriage);
  const currentLimit      = credit_history?.current_credit_limit;

  return (
    <div className="
      bg-[var(--surface-card)]
      rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)]
      p-5 sm:p-6
    ">
      {/* Header row */}
      <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="
            p-2 rounded-[var(--radius-md)]
            bg-[rgba(116,141,164,0.10)]
            border border-[rgba(116,141,164,0.20)]
          ">
            <User className="w-4 h-4 text-[var(--color-blue-grey)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight tracking-tight">
              Customer Profile
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Demographic and credit history overview
            </p>
          </div>
        </div>

        <span className="
          font-mono text-xs font-bold
          px-2.5 py-1
          bg-[rgba(123,138,65,0.10)]
          text-[var(--brand-secondary)]
          rounded border border-[rgba(123,138,65,0.25)]
        ">
          {customer_id}
        </span>
      </div>

      {/* Profile data grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <ProfileCell icon={Users}         label="Customer ID"      value={customer_id} />
        <ProfileCell icon={Calendar}      label="Age"              value={`${age} years`} />
        <ProfileCell icon={User}          label="Sex"              value={sexFormatted} />
        <ProfileCell icon={GraduationCap} label="Education"        value={educationFormatted} />
        <ProfileCell icon={Heart}         label="Marital Status"   value={marriageFormatted} />
        <ProfileCell
          icon={CreditCard}
          label="Current Credit Limit"
          value={formatCurrency(currentLimit)}
          accent
        />
      </div>
    </div>
  );
}
