import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Building2, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected', 'unavailable', 'checking'
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      if (data && data.status === 'ok') {
        setBackendStatus('connected');
        setHealthData(data);
      } else {
        setBackendStatus('unavailable');
        setHealthData(null);
      }
    } catch (err) {
      setBackendStatus('unavailable');
      setHealthData(null);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Enterprise Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight text-white">Apex Global Bank</h1>
              <p className="text-xs text-slate-400">Enterprise Decision Support</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Secure Environment
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Title Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md mb-4 border border-blue-100">
              <Layers className="w-3.5 h-3.5" />
              <span>Phase 5A Foundation Active</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
              AI-Based Credit Limit Recommendation System
            </h2>
            <p className="mt-2 text-base text-slate-600 font-medium">
              Bank Employee Decision Support Dashboard
            </p>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              This application provides explainable ML credit limit recommendations, real-time what-if scenario simulations, customer financial trend analysis, and comprehensive audit trail logging for bank loan underwriters.
            </p>
          </div>
        </div>

        {/* Backend Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">System Integration & Connectivity</h3>
            </div>
            {lastChecked && (
              <span className="text-xs text-slate-400">
                Last verified: {lastChecked}
              </span>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' :
                  backendStatus === 'unavailable' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {backendStatus === 'connected' && <CheckCircle2 className="w-6 h-6" />}
                  {backendStatus === 'unavailable' && <XCircle className="w-6 h-6" />}
                  {backendStatus === 'checking' && <Activity className="w-6 h-6 animate-pulse" />}
                </div>

                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    FastAPI Service Status
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {backendStatus === 'connected' && (
                      <span className="text-emerald-700 flex items-center">
                        Backend Connected
                      </span>
                    )}
                    {backendStatus === 'unavailable' && (
                      <span className="text-rose-700 flex items-center">
                        Backend Unavailable
                      </span>
                    )}
                    {backendStatus === 'checking' && (
                      <span className="text-amber-700 flex items-center">
                        Checking Connection...
                      </span>
                    )}
                  </div>
                  {healthData && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Service: {healthData.service} | Version: {healthData.version}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={checkHealth}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                  Check Backend
                </button>
              </div>
            </div>

            {/* Diagnostic Information */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-xs font-medium text-slate-400 block mb-1">Target Base URL</span>
                <code className="text-xs font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 block truncate">
                  {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}
                </code>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-xs font-medium text-slate-400 block mb-1">Health Endpoint</span>
                <code className="text-xs font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 block truncate">
                  GET /health
                </code>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-xs font-medium text-slate-400 block mb-1">CORS & Security</span>
                <span className="text-xs font-medium text-emerald-600 flex items-center mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Allowed (localhost:5173)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            AI-Based Credit Limit Recommendation System &copy; 2026. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 font-mono">
            FastAPI + React 19 + Vite + Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
