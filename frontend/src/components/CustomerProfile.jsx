import React from 'react';
import { User, CreditCard, Calendar, GraduationCap, Heart, Users } from 'lucide-react';
import { formatCurrency, formatSex, formatEducation, formatMarriage } from '../utils/formatters';

export default function CustomerProfile({ customer }) {
  if (!customer) return null;

  const { customer_id, profile, credit_history } = customer;
  const age = profile?.age ?? 'N/A';
  const sexFormatted = formatSex(profile?.sex);
  const educationFormatted = formatEducation(profile?.education);
  const marriageFormatted = formatMarriage(profile?.marriage);
  const currentLimit = credit_history?.current_credit_limit;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Customer Profile</h3>
        </div>
        <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
          ID: {customer_id}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Customer ID */}
        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer ID</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-900">{customer_id}</div>
        </div>

        {/* Age */}
        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Age</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{age} years</div>
        </div>

        {/* Sex */}
        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Sex</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{sexFormatted}</div>
        </div>

        {/* Education */}
        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span>Education</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{educationFormatted}</div>
        </div>

        {/* Marriage */}
        <div className="p-4 bg-slate-50/70 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 text-slate-400" />
            <span>Marital Status</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{marriageFormatted}</div>
        </div>

        {/* Current Credit Limit */}
        <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            <span>Current Credit Limit</span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            {formatCurrency(currentLimit)}
          </div>
        </div>
      </div>
    </div>
  );
}
