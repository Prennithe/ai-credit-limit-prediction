import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, UserSearch } from 'lucide-react';

export default function CustomerSearch({ onSearch, onClear, isLoading, activeSearchId, activeId }) {
  const currentActiveId = activeSearchId || activeId || '';
  const [inputVal, setInputVal] = useState(currentActiveId);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);
  const lastActiveIdRef = useRef(currentActiveId);

  // Synchronize input when active customer ID changes externally
  // Do not overwrite while the user is actively focused and typing
  useEffect(() => {
    if (currentActiveId !== lastActiveIdRef.current) {
      lastActiveIdRef.current = currentActiveId;
      if (document.activeElement !== inputRef.current) {
        setInputVal(currentActiveId);
      }
    }
  }, [currentActiveId]);

  // Unified execution for sample buttons, manual Search button click, and Enter key
  const executeSearch = (rawId) => {
    const trimmed = (rawId ?? '').toString().trim();
    if (!trimmed) {
      setValidationError('Please enter a valid customer ID.');
      return;
    }
    setValidationError('');
    const normalized = trimmed.toUpperCase();
    setInputVal(normalized);
    lastActiveIdRef.current = normalized;
    onSearch(normalized);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    executeSearch(inputVal);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleClearAction = () => {
    setInputVal('');
    lastActiveIdRef.current = '';
    setValidationError('');
    if (onClear) onClear();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <UserSearch className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Customer Search</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-grow">
          <label htmlFor="customer-search-input" className="sr-only">
            Customer ID
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            id="customer-search-input"
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Enter Customer ID (e.g. CUST00001)"
            disabled={isLoading}
            className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border ${
              validationError ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 focus:ring-blue-500'
            } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-60 font-mono`}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 cursor-pointer min-w-[110px]"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>

          {currentActiveId && (
            <button
              type="button"
              onClick={handleClearAction}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-3 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Clear current customer view"
            >
              <RotateCcw className="w-4 h-4 mr-1 text-slate-500" />
              Clear
            </button>
          )}
        </div>
      </form>

      {validationError && (
        <p className="mt-2 text-xs font-medium text-rose-600 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
          {validationError}
        </p>
      )}

      <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400">
        <span>Try sample IDs:</span>
        <button
          type="button"
          onClick={() => executeSearch('CUST00001')}
          className="font-mono text-blue-600 hover:underline cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100"
        >
          CUST00001
        </button>
        <button
          type="button"
          onClick={() => executeSearch('CUST00002')}
          className="font-mono text-blue-600 hover:underline cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100"
        >
          CUST00002
        </button>
      </div>
    </div>
  );
}
