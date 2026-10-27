import React from 'react';
import { Activity, Cpu, TrendingUp, Lightbulb } from 'lucide-react';

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-5 h-5 bg-slate-200 rounded"></div>
        <div className="h-5 bg-slate-200 rounded w-40"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-5 bg-slate-300 rounded w-32"></div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400 py-2">
        <Activity className="w-4 h-4 animate-spin text-blue-600" />
        <span>Retrieving customer record from database...</span>
      </div>
    </div>
  );
}

export function PredictionSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-5 h-5 bg-slate-200 rounded"></div>
        <div className="h-5 bg-slate-200 rounded w-56"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-800 rounded-xl p-6 h-48 flex flex-col justify-between">
          <div className="h-4 bg-slate-700 rounded w-36"></div>
          <div className="h-10 bg-slate-600 rounded w-60"></div>
          <div className="h-3 bg-slate-700 rounded w-full"></div>
        </div>
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200 h-48">
          <div className="h-4 bg-slate-200 rounded w-44 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400 py-2">
        <Cpu className="w-4 h-4 animate-spin text-blue-600" />
        <span>Calculating model prediction...</span>
      </div>
    </div>
  );
}

export function FinancialTrendSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-5 h-5 bg-slate-200 rounded"></div>
        <div className="h-5 bg-slate-200 rounded w-52"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-100 rounded-xl h-64"></div>
        <div className="bg-slate-100 rounded-xl h-64"></div>
        <div className="bg-slate-100 rounded-xl h-64"></div>
        <div className="bg-slate-100 rounded-xl h-64"></div>
      </div>
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400 py-2">
        <TrendingUp className="w-4 h-4 animate-spin text-blue-600" />
        <span>Loading six-month financial trends...</span>
      </div>
    </div>
  );
}

export function ExplainabilitySkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-5 h-5 bg-slate-200 rounded"></div>
        <div className="h-5 bg-slate-200 rounded w-48"></div>
      </div>
      <div className="bg-slate-100 rounded-xl h-80 mb-4"></div>
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-slate-400 py-2">
        <Lightbulb className="w-4 h-4 animate-spin text-blue-600" />
        <span>Computing SHAP explainability values...</span>
      </div>
    </div>
  );
}

export default { ProfileSkeleton, PredictionSkeleton, FinancialTrendSkeleton, ExplainabilitySkeleton };
