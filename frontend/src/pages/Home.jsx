import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';
import CustomerSearch from '../components/CustomerSearch';
import CustomerProfile from '../components/CustomerProfile';
import PredictionCard from '../components/PredictionCard';
import ErrorMessage from '../components/ErrorMessage';
import { ProfileSkeleton, PredictionSkeleton, FinancialTrendSkeleton, ExplainabilitySkeleton } from '../components/LoadingState';
import { ShieldCheck, Info } from 'lucide-react';

// Lazy-load heavy chart/form components to split the JS bundle
const FinancialTrendDashboard = lazy(() => import('../components/FinancialTrendDashboard'));
const ExplainabilityDashboard = lazy(() => import('../components/ExplainabilityDashboard'));
const WhatIfSimulator = lazy(() => import('../components/WhatIfSimulator'));
const EmployeeDecisionPanel = lazy(() => import('../components/EmployeeDecisionPanel'));

export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'unavailable' | 'checking'
  const [healthLoading, setHealthLoading] = useState(false);

  const [activeCustomerId, setActiveCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [explanationData, setExplanationData] = useState(null);

  // Search-in-progress guard: prevents duplicate concurrent API calls
  const [isSearching, setIsSearching] = useState(false);

  const [customerLoading, setCustomerLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);

  const [searchError, setSearchError] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [trendsError, setTrendsError] = useState(null);
  const [explanationError, setExplanationError] = useState(null);

  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await api.getHealth();
      if (data && data.status === 'ok') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('unavailable');
      }
    } catch {
      setBackendStatus('unavailable');
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSearch = async (customerId) => {
    const trimmedId = customerId.trim();
    if (!trimmedId) return;
    // Prevent duplicate concurrent searches
    if (isSearching) return;

    // Reset previous search state
    setActiveCustomerId(trimmedId);
    setCustomer(null);
    setPrediction(null);
    setTrendsData(null);
    setExplanationData(null);

    setSearchError(null);
    setPredictionError(null);
    setTrendsError(null);
    setExplanationError(null);

    setCustomerLoading(true);
    setIsSearching(true);

    try {
      // Step 1: Retrieve Customer Profile
      const customerData = await api.getCustomer(trimmedId);
      setCustomer(customerData);
      setCustomerLoading(false);

      // Step 2: Retrieve Model Prediction
      setPredictionLoading(true);
      try {
        const predData = await api.getPrediction(trimmedId);
        setPrediction(predData);
      } catch (predErr) {
        console.error('Prediction fetch failed:', predErr);
        setPredictionError('Unable to calculate prediction at this time.');
      } finally {
        setPredictionLoading(false);
      }

      // Step 3: Retrieve Financial Trends
      setTrendsLoading(true);
      try {
        const trends = await api.getFinancialTrends(trimmedId);
        setTrendsData(trends);
      } catch (trendsErr) {
        console.error('Financial trends fetch failed:', trendsErr);
        setTrendsError('Unable to retrieve the customer\'s historical financial trends at this time.');
      } finally {
        setTrendsLoading(false);
      }

      // Step 4: Retrieve SHAP Explanations
      setExplanationLoading(true);
      try {
        const explData = await api.getExplanation(trimmedId);
        setExplanationData(explData);
      } catch (explErr) {
        console.error('Explanation fetch failed:', explErr);
        setExplanationError('Unable to calculate SHAP explainability at this time.');
      } finally {
        setExplanationLoading(false);
      }

    } catch (err) {
      setCustomerLoading(false);
      if (err.status === 404) {
        setSearchError({ type: 'not_found', searchId: trimmedId });
      } else if (!err.status || err.message?.includes('Fetch') || err.message?.includes('Network')) {
        setSearchError({ type: 'backend_down' });
        setBackendStatus('unavailable');
      } else {
        setSearchError({ type: 'generic', customMessage: err.message });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    if (isSearching) return;
    setActiveCustomerId('');
    setCustomer(null);
    setPrediction(null);
    setTrendsData(null);
    setExplanationData(null);

    setSearchError(null);
    setPredictionError(null);
    setTrendsError(null);
    setExplanationError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div>
        {/* Navigation & Status Header */}
        <Header
          backendStatus={backendStatus}
          onCheckHealth={checkHealth}
          healthLoading={healthLoading}
        />

        {/* Main Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Customer Search Bar */}
          <CustomerSearch
            onSearch={handleSearch}
            onClear={handleClear}
            isLoading={customerLoading || isSearching}
            activeSearchId={activeCustomerId}
          />

          {/* Search Level Error Messages */}
          {searchError && (
            <ErrorMessage
              type={searchError.type}
              searchId={searchError.searchId}
              customMessage={searchError.customMessage}
              onRetry={checkHealth}
            />
          )}

          {/* Customer Profile Section */}
          {customerLoading && <ProfileSkeleton />}
          {!customerLoading && customer && (
            <CustomerProfile customer={customer} />
          )}

          {/* Model Prediction Section */}
          {customer && predictionLoading && <PredictionSkeleton />}
          {customer && !predictionLoading && predictionError && (
            <ErrorMessage type="prediction_error" customMessage={predictionError} />
          )}
          {customer && !predictionLoading && prediction && (
            <PredictionCard
              prediction={prediction}
              currentCreditLimit={customer?.credit_history?.current_credit_limit}
            />
          )}

          {/* Financial Trend Dashboard Section */}
          {customer && trendsLoading && <FinancialTrendSkeleton />}
          {customer && !trendsLoading && trendsError && (
            <ErrorMessage type="financial_trends_error" customMessage={trendsError} />
          )}
          {customer && !trendsLoading && trendsData && (
            <Suspense fallback={<FinancialTrendSkeleton />}>
              <FinancialTrendDashboard trendsData={trendsData} />
            </Suspense>
          )}

          {/* Explainability Section */}
          {customer && explanationLoading && <ExplainabilitySkeleton />}
          {customer && !explanationLoading && explanationError && (
            <ErrorMessage type="explanation_error" customMessage={explanationError} />
          )}
          {customer && !explanationLoading && explanationData && (
            <Suspense fallback={<ExplainabilitySkeleton />}>
              <ExplainabilityDashboard explanationData={explanationData} />
            </Suspense>
          )}

          {/* What-If Simulator Section */}
          {customer && !customerLoading && (
            <Suspense fallback={<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 text-sm text-slate-400 text-center">Loading simulator...</div>}>
              <WhatIfSimulator customer={customer} />
            </Suspense>
          )}

          {/* Employee Decision Panel */}
          {customer && !customerLoading && (
            <Suspense fallback={<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-sm text-slate-400 text-center">Loading decision panel...</div>}>
              <EmployeeDecisionPanel 
                customer={customer} 
                prediction={prediction} 
              />
            </Suspense>
          )}

          {/* Empty / Initial Welcome Banner if no search performed */}
          {!customerLoading && !customer && !searchError && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center my-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Welcome to Credit Recommendation Decision Support
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                Enter a Customer ID above (such as <code className="font-mono text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">CUST00001</code>) to retrieve the customer's financial profile, generate a model-predicted credit limit recommendation, and analyze 6-month historical trends.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>AI-Based Credit Limit Recommendation System &copy; 2026. Internal Bank Employee System.</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Phase 5G Active | FastAPI + React 19 + Recharts + Vite
          </div>
        </div>
      </footer>
    </div>
  );
}
