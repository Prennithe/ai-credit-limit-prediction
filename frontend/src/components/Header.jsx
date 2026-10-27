import React from 'react';
import { Building2, ShieldCheck, CheckCircle2, XCircle, Activity } from 'lucide-react';

export default function Header({ backendStatus, onCheckHealth, healthLoading }) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight text-white">
              AI-Based Credit Limit Recommendation System
            </h1>
            <p className="text-xs text-slate-400">
              Bank Employee Decision Support Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onCheckHealth}
            disabled={healthLoading}
            className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Click to check backend status"
          >
            {backendStatus === 'connected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-semibold">Backend Connected</span>
              </>
            )}
            {backendStatus === 'unavailable' && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-semibold">Backend Unavailable</span>
              </>
            )}
            {backendStatus === 'checking' && (
              <>
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-300">Checking...</span>
              </>
            )}
          </button>

          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Enterprise Secure
          </span>
        </div>
      </div>
    </header>
  );
}
