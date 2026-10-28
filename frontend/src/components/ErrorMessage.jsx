import React from 'react';
import { AlertTriangle, ServerOff, UserX, AlertCircle, TrendingDown } from 'lucide-react';

/* ── Shared error card wrapper ──────────────────────────────────── */
function ErrorCard({ icon: Icon, iconBg, iconColor, title, titleColor, children }) {
  return (
    <div className={`rounded-[var(--radius-xl)] border p-5 ${iconBg}`}>
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-[var(--radius-md)] flex-shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold leading-tight ${titleColor}`}>{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ErrorMessage(props) {
  // Support both direct props ({ type, searchId, customMessage, onRetry })
  // and composite error object prop ({ error: { type, searchId, customMessage }, onRetry })
  const errorObj     = (props.error && typeof props.error === 'object') ? props.error : {};
  const type         = props.type         || errorObj.type;
  const searchId     = props.searchId     || errorObj.searchId;
  const customMessage= props.customMessage|| errorObj.customMessage || (typeof props.error === 'string' ? props.error : undefined);
  const onRetry      = props.onRetry      || errorObj.onRetry;

  if (type === 'not_found') {
    return (
      <ErrorCard
        icon={UserX}
        iconBg="bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]"
        iconColor="bg-[rgba(140,88,18,0.12)] text-[var(--status-warning)]"
        title="Customer Not Found"
        titleColor="text-[var(--text-primary)]"
      >
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
          No customer record was found for ID{' '}
          <span className="font-mono font-bold text-[var(--text-primary)]">"{searchId}"</span> in the database.
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Please verify the customer ID and try again. Try sample IDs like{' '}
          <code className="font-mono bg-[var(--status-warning-bg)] px-1 py-0.5 rounded font-bold text-[var(--status-warning)]">CUST00001</code>{' '}
          or{' '}
          <code className="font-mono bg-[var(--status-warning-bg)] px-1 py-0.5 rounded font-bold text-[var(--status-warning)]">CUST00002</code>.
        </p>
      </ErrorCard>
    );
  }

  if (type === 'backend_down') {
    return (
      <ErrorCard
        icon={ServerOff}
        iconBg="bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]"
        iconColor="bg-[rgba(91,47,66,0.12)] text-[var(--status-danger)]"
        title="Unable to Connect to Backend"
        titleColor="text-[var(--text-primary)]"
      >
        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
          Could not reach the FastAPI server at{' '}
          <code className="font-mono bg-[var(--status-danger-bg)] px-1 py-0.5 rounded text-[var(--status-danger)]">
            {import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}
          </code>.
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Please ensure the FastAPI service is running using:{' '}
          <code className="font-mono bg-[var(--status-danger-bg)] px-1 py-0.5 rounded text-[var(--status-danger)]">
            uvicorn src.api.main:app --reload
          </code>
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="
              mt-3 text-xs font-semibold
              px-3 py-1.5
              bg-[var(--status-danger)] hover:bg-[var(--color-warning-plum)]
              text-white rounded-[var(--radius-md)]
              shadow-[var(--shadow-sm)] transition-colors cursor-pointer
            "
          >
            Retry Connection
          </button>
        )}
      </ErrorCard>
    );
  }

  if (type === 'prediction_error') {
    return (
      <ErrorCard
        icon={AlertCircle}
        iconBg="bg-[var(--surface-card-muted)] border-[var(--border-default)]"
        iconColor="bg-[rgba(116,141,164,0.12)] text-[var(--status-warning)]"
        title="Prediction Unavailable"
        titleColor="text-[var(--text-primary)]"
      >
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {customMessage || 'Unable to calculate the model prediction at this time. The customer profile above remains valid.'}
        </p>
      </ErrorCard>
    );
  }

  if (type === 'financial_trends_error') {
    return (
      <ErrorCard
        icon={TrendingDown}
        iconBg="bg-[var(--surface-card-muted)] border-[var(--border-default)]"
        iconColor="bg-[rgba(116,141,164,0.12)] text-[var(--status-warning)]"
        title="Financial Trends Unavailable"
        titleColor="text-[var(--text-primary)]"
      >
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {customMessage || "Unable to retrieve the customer's historical financial trends at this time."}
        </p>
      </ErrorCard>
    );
  }

  if (type === 'explanation_error') {
    return (
      <ErrorCard
        icon={AlertCircle}
        iconBg="bg-[var(--surface-card-muted)] border-[var(--border-default)]"
        iconColor="bg-[rgba(116,141,164,0.12)] text-[var(--status-warning)]"
        title="Explainable AI Unavailable"
        titleColor="text-[var(--text-primary)]"
      >
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {customMessage || 'Unable to calculate the SHAP explainability values at this time.'}
        </p>
      </ErrorCard>
    );
  }

  // Fallback generic error
  return (
    <ErrorCard
      icon={AlertTriangle}
      iconBg="bg-[var(--status-danger-bg)] border-[var(--status-danger-border)]"
      iconColor="bg-[rgba(91,47,66,0.12)] text-[var(--status-danger)]"
      title="An Error Occurred"
      titleColor="text-[var(--text-primary)]"
    >
      <p className="text-xs text-[var(--text-secondary)] mt-1">
        {customMessage || 'An unexpected error occurred while processing your request.'}
      </p>
    </ErrorCard>
  );
}
