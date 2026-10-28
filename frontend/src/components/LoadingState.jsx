import React from 'react';
import { Activity, Cpu, TrendingUp, Lightbulb } from 'lucide-react';

/* ── Shared skeleton cell ──────────────────────────────────────── */
function SkeletonCell() {
  return (
    <div className="p-4 bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)]">
      <div className="h-2.5 bg-[var(--color-slate-200)] rounded w-24 mb-2.5" />
      <div className="h-4 bg-[var(--color-slate-300)] rounded w-32 opacity-70" />
    </div>
  );
}

/* ── Shared skeleton header row ──────────────────────────────────── */
function SkeletonHeader() {
  return (
    <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-muted)] pb-4">
      <div className="w-8 h-8 bg-[var(--color-slate-200)] rounded-[var(--radius-md)]" />
      <div className="h-5 bg-[var(--color-slate-200)] rounded w-48" />
    </div>
  );
}

/* ── Shared spinner footer ───────────────────────────────────────── */
function SkeletonFooter({ icon: Icon, message }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] py-2">
      <Icon className="w-4 h-4 animate-spin text-[var(--brand-secondary)]" />
      <span>{message}</span>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="
      bg-[var(--surface-card)] rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)] p-5 sm:p-6 animate-pulse
    ">
      <SkeletonHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[...Array(6)].map((_, i) => <SkeletonCell key={i} />)}
      </div>
      <SkeletonFooter icon={Activity} message="Retrieving customer record from database…" />
    </div>
  );
}

export function PredictionSkeleton() {
  return (
    <div className="
      bg-[var(--surface-card)] rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)] p-5 sm:p-6 animate-pulse
    ">
      <SkeletonHeader />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[var(--color-forest-dark)] rounded-[var(--radius-xl)] p-6 h-48 flex flex-col justify-between">
          <div className="h-3.5 bg-[rgba(255,255,255,0.15)] rounded w-36" />
          <div className="h-10 bg-[rgba(255,255,255,0.18)] rounded w-52" />
          <div className="h-3 bg-[rgba(255,255,255,0.10)] rounded w-full" />
        </div>
        <div className="lg:col-span-5 bg-[var(--surface-bg)] rounded-[var(--radius-xl)] p-5 border border-[var(--border-muted)] h-48">
          <div className="h-3.5 bg-[var(--color-slate-200)] rounded w-44 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-full" />
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-full" />
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-3/4" />
          </div>
        </div>
      </div>
      <SkeletonFooter icon={Cpu} message="Calculating model prediction…" />
    </div>
  );
}

export function FinancialTrendSkeleton() {
  return (
    <div className="
      bg-[var(--surface-card)] rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)] p-5 sm:p-6 animate-pulse
    ">
      <SkeletonHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)] h-64" />
        ))}
      </div>
      <SkeletonFooter icon={TrendingUp} message="Loading six-month financial trends…" />
    </div>
  );
}

export function ExplainabilitySkeleton() {
  return (
    <div className="
      bg-[var(--surface-card)] rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)] p-5 sm:p-6 animate-pulse
    ">
      <SkeletonHeader />
      <div className="bg-[var(--surface-bg)] rounded-[var(--radius-lg)] border border-[var(--border-muted)] h-80 mb-4" />
      <SkeletonFooter icon={Lightbulb} message="Computing SHAP explainability values…" />
    </div>
  );
}

export default { ProfileSkeleton, PredictionSkeleton, FinancialTrendSkeleton, ExplainabilitySkeleton };
