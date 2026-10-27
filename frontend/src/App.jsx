import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Phase 2 App Shell & Context
import { CustomerProvider } from './context/CustomerContext';
import AppLayout from './layouts/AppLayout';

// Phase 2 Feature Pages
import OverviewPage from './pages/app/OverviewPage';
import CustomersPage from './pages/app/CustomersPage';
import PredictionPage from './pages/app/PredictionPage';
import FinancialTrendsPage from './pages/app/FinancialTrendsPage';
import ExplainabilityPage from './pages/app/ExplainabilityPage';
import SimulatorPage from './pages/app/SimulatorPage';
import DecisionsPage from './pages/app/DecisionsPage';
import AuditPage from './pages/app/AuditPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ──────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Feature routes with shared customer context & shell ── */}
        <Route
          path="/app"
          element={
            <CustomerProvider>
              <AppLayout />
            </CustomerProvider>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="prediction" element={<PredictionPage />} />
          <Route path="financial-trends" element={<FinancialTrendsPage />} />
          <Route path="explainability" element={<ExplainabilityPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>

        {/* ── Fallback ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
