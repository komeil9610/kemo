import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppAccessBanner from './components/AppAccessBanner';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InternalDailyTasks from './pages/InternalDailyTasks';
import InternalWeeklyTasks from './pages/InternalWeeklyTasks';
import InternalMonthlyTasks from './pages/InternalMonthlyTasks';
import OperationsDatePage from './pages/OperationsDatePage';
import './index.css';

function getHomeRouteForRole(role) {
  if (role === 'customer_service') {
    return '/customer-service';
  }

  if (role === 'operations_manager') {
    return '/operations-manager';
  }

  return '/login';
}

function WorkspaceRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
}

function LegacyDashboardRedirect() {
  const { user } = useAuth();
  const location = useLocation();
  const nextBase = getHomeRouteForRole(user?.role);
  const nextPath = location.pathname.replace(/^\/dashboard/, nextBase);
  return <Navigate to={nextPath} replace />;
}

function AppChrome() {
  const isMobileShell = false;

  return (
    <div className={`app-layout ${isMobileShell ? 'mobile-route-layout' : ''}`}>
      {isMobileShell ? null : <Navbar />}
      <AppAccessBanner />
      <main className={`app-shell ${isMobileShell ? 'mobile-route-shell' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/customer-service" element={<ProtectedRoute allowedRoles={['customer_service']}><Dashboard /></ProtectedRoute>} />
          <Route path="/customer-service/daily" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalDailyTasks /></ProtectedRoute>} />
          <Route path="/customer-service/weekly" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalWeeklyTasks /></ProtectedRoute>} />
          <Route path="/customer-service/monthly" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalMonthlyTasks /></ProtectedRoute>} />
          <Route path="/customer-service/operations-date" element={<ProtectedRoute allowedRoles={['customer_service']}><OperationsDatePage /></ProtectedRoute>} />
          <Route path="/customer-service/:viewKey" element={<ProtectedRoute allowedRoles={['customer_service']}><Dashboard /></ProtectedRoute>} />
          <Route path="/operations-manager" element={<ProtectedRoute allowedRoles={['operations_manager']}><Dashboard /></ProtectedRoute>} />
          <Route path="/operations-manager/daily" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalDailyTasks /></ProtectedRoute>} />
          <Route path="/operations-manager/weekly" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalWeeklyTasks /></ProtectedRoute>} />
          <Route path="/operations-manager/monthly" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalMonthlyTasks /></ProtectedRoute>} />
          <Route path="/operations-manager/operations-date" element={<ProtectedRoute allowedRoles={['operations_manager']}><OperationsDatePage /></ProtectedRoute>} />
          <Route path="/operations-manager/:viewKey" element={<ProtectedRoute allowedRoles={['operations_manager']}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><WorkspaceRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/operations-date" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><LegacyDashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/daily" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><LegacyDashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/weekly" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><LegacyDashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/monthly" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><LegacyDashboardRedirect /></ProtectedRoute>} />
          <Route path="/dashboard/:viewKey" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><LegacyDashboardRedirect /></ProtectedRoute>} />
          <Route path="/orders" element={<Navigate to="/dashboard/daily" replace />} />
          <Route path="/tasks" element={<Navigate to="/dashboard/daily" replace />} />
          <Route path="/tasks/daily" element={<Navigate to="/dashboard/daily" replace />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="/products/:id" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isMobileShell ? null : <Footer />}
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { background: '#1a1916', color: '#fff', border: '1px solid #333129' } }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppChrome />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
