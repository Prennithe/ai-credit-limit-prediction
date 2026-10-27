import React from 'react';
import { AlertTriangle, ServerOff, UserX, AlertCircle, TrendingDown } from 'lucide-react';

export default function ErrorMessage(props) {
  // Support both direct props ({ type, searchId, customMessage, onRetry })
  // and composite error object prop ({ error: { type, searchId, customMessage }, onRetry })
  const errorObj = (props.error && typeof props.error === 'object') ? props.error : {};
  const type = props.type || errorObj.type;
  const searchId = props.searchId || errorObj.searchId;
  const customMessage = props.customMessage || errorObj.customMessage || (typeof props.error === 'string' ? props.error : undefined);
  const onRetry = props.onRetry || errorObj.onRetry;

  if (type === 'not_found') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">Customer Not Found</h3>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              No customer record was found for ID <span className="font-mono font-bold">"{searchId}"</span> in the database.
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Please verify the customer ID and try again. Customer IDs use 5 digits with leading zeros; try sample IDs like <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">CUST00001</code> or <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">CUST00002</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'backend_down') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 flex-shrink-0">
            <ServerOff className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-bold text-rose-900">Unable to Connect to Backend</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Could not reach the FastAPI server at <code className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-800">{import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}</code>.
            </p>
            <p className="text-xs text-rose-600 mt-2">
              Please ensure the FastAPI service is running using: <code className="font-mono bg-rose-100 px-1 py-0.5 rounded text-rose-800">uvicorn src.api.main:app --reload</code>
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-sm transition-colors cursor-pointer"
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'prediction_error') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-200 rounded-lg text-slate-700 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Prediction Unavailable</h3>
            <p className="text-xs text-slate-600 mt-1">
              {customMessage || 'Unable to calculate the model prediction at this time. The customer profile above remains valid.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'financial_trends_error') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-200 rounded-lg text-slate-700 flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Financial Trends Unavailable</h3>
            <p className="text-xs text-slate-600 mt-1">
              {customMessage || 'Unable to retrieve the customer\'s historical financial trends at this time.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'explanation_error') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-slate-200 rounded-lg text-slate-700 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Explainable AI Unavailable</h3>
            <p className="text-xs text-slate-600 mt-1">
              {customMessage || 'Unable to calculate the SHAP explainability values at this time.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-6">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-rose-100 rounded-lg text-rose-700 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-rose-900">An Error Occurred</h3>
          <p className="text-xs text-rose-700 mt-1">
            {customMessage || 'An unexpected error occurred while processing your request.'}
          </p>
        </div>
      </div>
    </div>
  );
}
