const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Generic helper for handling fetch requests and responses
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health Check
  getHealth: () => request('/health'),

  // Customer Profile & Data
  getCustomer: (customerId) => request(`/customers/${customerId}`),

  // Model Prediction
  getPrediction: (customerId) => request(`/customers/${customerId}/prediction`),

  // Financial Trend Analysis
  getFinancialTrends: (customerId) => request(`/customers/${customerId}/financial-trends`),

  // SHAP Explainability
  getExplanation: (customerId) => request(`/customers/${customerId}/explanation`),

  // What-If Credit Limit Simulator
  simulateWhatIf: (customerId, simulationData) =>
    request(`/customers/${customerId}/simulate`, {
      method: 'POST',
      body: JSON.stringify(simulationData),
    }),

  // Employee Decision Recording
  saveDecision: (customerId, decisionData) =>
    request(`/customers/${customerId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decisionData),
    }),

  // Customer Decision History
  getCustomerDecisions: (customerId) => request(`/customers/${customerId}/decisions`),

  // Audit History
  getRecentAudit: (limit = 50) => request(`/audit/recent?limit=${limit}`),
};

export default api;
