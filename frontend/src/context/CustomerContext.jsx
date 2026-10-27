import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'unavailable' | 'checking'
  const [healthLoading, setHealthLoading] = useState(false);

  const [activeCustomerId, setActiveCustomerId] = useState('');
  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [explanationData, setExplanationData] = useState(null);

  // Search in progress guard & race-condition cancellation
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestIdRef = useRef(0);

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

  const handleSearch = useCallback(async (customerId) => {
    const trimmedId = customerId?.toString().trim().toUpperCase();
    if (!trimmedId) return;
    // Prevent duplicate concurrent requests for the exact same customer ID while already searching
    if (isSearching && activeCustomerId === trimmedId) return;

    // Track request sequence to prevent out-of-order race conditions
    const currentRequestId = ++searchRequestIdRef.current;

    // Reset previous search & dependent data
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
      if (searchRequestIdRef.current !== currentRequestId) return;
      setCustomer(customerData);
      setCustomerLoading(false);

      // Step 2: Retrieve Model Prediction
      setPredictionLoading(true);
      try {
        const predData = await api.getPrediction(trimmedId);
        if (searchRequestIdRef.current === currentRequestId) {
          setPrediction(predData);
        }
      } catch (predErr) {
        console.error('Prediction fetch failed:', predErr);
        if (searchRequestIdRef.current === currentRequestId) {
          setPredictionError('Unable to calculate prediction at this time.');
        }
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setPredictionLoading(false);
        }
      }

      // Step 3: Retrieve Financial Trends
      setTrendsLoading(true);
      try {
        const trends = await api.getFinancialTrends(trimmedId);
        if (searchRequestIdRef.current === currentRequestId) {
          setTrendsData(trends);
        }
      } catch (trendsErr) {
        console.error('Financial trends fetch failed:', trendsErr);
        if (searchRequestIdRef.current === currentRequestId) {
          setTrendsError("Unable to retrieve the customer's historical financial trends at this time.");
        }
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setTrendsLoading(false);
        }
      }

      // Step 4: Retrieve SHAP Explanations
      setExplanationLoading(true);
      try {
        const explData = await api.getExplanation(trimmedId);
        if (searchRequestIdRef.current === currentRequestId) {
          setExplanationData(explData);
        }
      } catch (explErr) {
        console.error('Explanation fetch failed:', explErr);
        if (searchRequestIdRef.current === currentRequestId) {
          setExplanationError('Unable to calculate SHAP explainability at this time.');
        }
      } finally {
        if (searchRequestIdRef.current === currentRequestId) {
          setExplanationLoading(false);
        }
      }

    } catch (err) {
      if (searchRequestIdRef.current !== currentRequestId) return;
      setCustomerLoading(false);
      if (
        err.status === 404 ||
        err.message?.toLowerCase().includes('not found') ||
        err.data?.detail?.toLowerCase().includes('not found')
      ) {
        setSearchError({ type: 'not_found', searchId: trimmedId });
      } else if (!err.status || err.message?.includes('Fetch') || err.message?.includes('Network')) {
        setSearchError({ type: 'backend_down' });
        setBackendStatus('unavailable');
      } else {
        setSearchError({ type: 'generic', customMessage: err.message });
      }
    } finally {
      if (searchRequestIdRef.current === currentRequestId) {
        setIsSearching(false);
      }
    }
  }, [isSearching, activeCustomerId]);

  const handleClear = useCallback(() => {
    if (isSearching) return;
    searchRequestIdRef.current++;
    setActiveCustomerId('');
    setCustomer(null);
    setPrediction(null);
    setTrendsData(null);
    setExplanationData(null);

    setSearchError(null);
    setPredictionError(null);
    setTrendsError(null);
    setExplanationError(null);
  }, [isSearching]);

  const value = {
    backendStatus,
    healthLoading,
    checkHealth,
    activeCustomerId,
    customer,
    prediction,
    trendsData,
    explanationData,
    isSearching,
    customerLoading,
    predictionLoading,
    trendsLoading,
    explanationLoading,
    searchError,
    predictionError,
    trendsError,
    explanationError,
    handleSearch,
    handleClear,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
