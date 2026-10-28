import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, UserSearch } from 'lucide-react';

export default function CustomerSearch({ onSearch, onClear, isLoading, activeSearchId, activeId }) {
  const currentActiveId = activeSearchId || activeId || '';
  const [inputVal, setInputVal]           = useState(currentActiveId);
  const [validationError, setValidationError] = useState('');
  const inputRef         = useRef(null);
  const lastActiveIdRef  = useRef(currentActiveId);

  // Synchronize input when active customer ID changes externally.
  // Do not overwrite while the user is actively focused and typing.
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
    const normalized = trimmed.toUpperCase().replace(
      /^(CUST)0*(\d+)$/,
      (_, prefix, num) => prefix + num.padStart(5, '0')
    );
    setInputVal(normalized);
    lastActiveIdRef.current = normalized;
    onSearch(normalized);
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    executeSearch(inputVal);
  };

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    if (validationError) setValidationError('');
  };

  const handleClearAction = () => {
    setInputVal('');
    lastActiveIdRef.current = '';
    setValidationError('');
    if (onClear) onClear();
  };

  return (
    <div className="
      bg-[var(--surface-card)]
      rounded-[var(--radius-xl)]
      border border-[var(--border-default)]
      shadow-[var(--shadow-sm)]
      p-5 sm:p-6
    ">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="
          p-2 rounded-[var(--radius-md)]
          bg-[rgba(123,138,65,0.10)]
          border border-[rgba(123,138,65,0.20)]
        ">
          <UserSearch className="w-4 h-4 text-[var(--brand-secondary)]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight tracking-tight">
            Customer Search
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Enter a customer ID to load their full credit profile
          </p>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
        <div className="relative flex-grow">
          <label htmlFor="customer-search-input" className="sr-only">
            Customer ID
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <input
            ref={inputRef}
            id="customer-search-input"
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Enter Customer ID  (e.g. CUST00001)"
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-2.5 text-sm
              bg-[var(--surface-bg)]
              border rounded-[var(--radius-md)]
              text-[var(--text-primary)]
              placeholder-[var(--text-muted)]
              font-mono
              focus:outline-none focus:ring-2 focus:bg-[var(--surface-card)]
              transition-all
              disabled:opacity-60
              ${validationError
                ? 'border-[var(--color-rose-soft)] focus:ring-[var(--color-warning-plum)] focus:border-[var(--color-warning-plum)]'
                : 'border-[var(--border-default)] focus:ring-[var(--brand-secondary)] focus:border-[var(--brand-secondary)]'
              }
            `}
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="submit"
            disabled={isLoading}
            className="
              inline-flex items-center justify-center
              px-5 py-2.5 text-sm font-semibold
              text-white
              bg-[var(--brand-primary)]
              hover:bg-[var(--brand-primary-hover)]
              active:bg-[var(--brand-primary-active)]
              border border-[var(--brand-primary)]
              rounded-[var(--radius-md)]
              shadow-[var(--shadow-sm)]
              focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-[var(--brand-secondary)]
              transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed
              cursor-pointer min-w-[110px]
            "
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching…
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
              title="Clear current customer view"
              className="
                inline-flex items-center gap-1.5
                px-3 py-2.5 text-sm font-medium
                text-[var(--text-secondary)]
                bg-transparent
                hover:bg-[var(--surface-bg)]
                border border-[var(--border-default)]
                rounded-[var(--radius-md)]
                transition-colors
                disabled:opacity-60 cursor-pointer
              "
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Validation error */}
      {validationError && (
        <p className="mt-2 text-xs font-medium text-[var(--color-warning-plum)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning-plum)] flex-shrink-0" />
          {validationError}
        </p>
      )}

      {/* Sample IDs */}
      <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-[var(--text-muted)]">
        <span>Try sample IDs:</span>
        {['CUST00001', 'CUST00002'].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => executeSearch(id)}
            className="
              font-mono text-[var(--brand-secondary)]
              hover:text-[var(--brand-primary-hover)]
              bg-[rgba(123,138,65,0.08)]
              hover:bg-[rgba(123,138,65,0.16)]
              px-2 py-0.5 rounded
              border border-[rgba(123,138,65,0.22)]
              transition-colors cursor-pointer
            "
          >
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}
