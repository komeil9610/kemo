/**
 * Developed by [Kumeel Taher Al Nahab / كميل طاهر ال نهاب]
 * For TrkeebPro
 * Build date: 2026-04-10
 */
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import WorkspaceSidebar from './components/WorkspaceSidebar';
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
<<<<<<< Updated upstream
=======
import OperationsManagerWorkspace from './pages/OperationsManagerWorkspace';
import TechnicianWorkspace from './pages/TechnicianWorkspace';
import OAuthConsent from './pages/OAuthConsent';
import HomepageEditor from './pages/HomepageEditor';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ContactUs from './pages/ContactUs';
import { getWorkspaceBasePath } from './utils/workspaceRoles';
>>>>>>> Stashed changes
import './index.css';

function getHomeRouteForRole(role) {
  return getWorkspaceBasePath(role);
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
<<<<<<< Updated upstream
  const isMobileShell = false;
=======
  const location = useLocation();
  const { token } = useAuth();
  const isMobileShell = location.pathname === '/oauth/consent';
  const isWorkspaceRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/customer-service') ||
    location.pathname.startsWith('/operations-manager') ||
    location.pathname.startsWith('/technician') ||
    location.pathname.startsWith('/dashboard');
  const showSidebar = Boolean(token && isWorkspaceRoute && !isMobileShell);
  const showAccessBanner = Boolean(token && isWorkspaceRoute && !isMobileShell);
>>>>>>> Stashed changes

  return (
    <div className={`app-layout ${isMobileShell ? 'mobile-route-layout' : ''}`}>
      {isMobileShell ? null : <Navbar />}
<<<<<<< Updated upstream
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
=======
      {showAccessBanner ? <AppAccessBanner /> : null}
      <main className={`app-shell ${isMobileShell ? 'mobile-route-shell' : ''} ${showSidebar ? 'app-shell-with-sidebar' : ''}`}>
        {showSidebar ? <WorkspaceSidebar /> : null}
        <div className={`app-route-shell ${showSidebar ? 'workspace-route-shell' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/consent" element={<OAuthConsent />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/daily" element={<ProtectedRoute allowedRoles={['admin']}><InternalDailyTasks /></ProtectedRoute>} />
            <Route path="/admin/weekly" element={<ProtectedRoute allowedRoles={['admin']}><InternalWeeklyTasks /></ProtectedRoute>} />
            <Route path="/admin/monthly" element={<ProtectedRoute allowedRoles={['admin']}><InternalMonthlyTasks /></ProtectedRoute>} />
            <Route path="/admin/operations-date" element={<ProtectedRoute allowedRoles={['admin']}><OperationsDatePage /></ProtectedRoute>} />
            <Route path="/admin/homepage" element={<ProtectedRoute allowedRoles={['admin']}><HomepageEditor /></ProtectedRoute>} />
            <Route path="/admin/:viewKey" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/customer-service" element={<ProtectedRoute allowedRoles={['customer_service']}><Dashboard /></ProtectedRoute>} />
            <Route path="/customer-service/daily" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalDailyTasks /></ProtectedRoute>} />
            <Route path="/customer-service/weekly" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalWeeklyTasks /></ProtectedRoute>} />
            <Route path="/customer-service/monthly" element={<ProtectedRoute allowedRoles={['customer_service']}><InternalMonthlyTasks /></ProtectedRoute>} />
            <Route path="/customer-service/operations-date" element={<ProtectedRoute allowedRoles={['customer_service']}><OperationsDatePage /></ProtectedRoute>} />
            <Route path="/customer-service/:viewKey" element={<ProtectedRoute allowedRoles={['customer_service']}><Dashboard /></ProtectedRoute>} />
            <Route path="/operations-manager" element={<ProtectedRoute allowedRoles={['operations_manager']}><OperationsManagerWorkspace /></ProtectedRoute>} />
            <Route path="/operations-manager/daily" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalDailyTasks /></ProtectedRoute>} />
            <Route path="/operations-manager/weekly" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalWeeklyTasks /></ProtectedRoute>} />
            <Route path="/operations-manager/monthly" element={<ProtectedRoute allowedRoles={['operations_manager']}><InternalMonthlyTasks /></ProtectedRoute>} />
            <Route path="/operations-manager/:viewKey" element={<ProtectedRoute allowedRoles={['operations_manager']}><Dashboard /></ProtectedRoute>} />
            <Route path="/technician" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianWorkspace /></ProtectedRoute>} />
            <Route path="/technician/:viewKey" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianWorkspace /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><WorkspaceRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/operations-date" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><LegacyDashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/daily" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><LegacyDashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/weekly" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><LegacyDashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/monthly" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><LegacyDashboardRedirect /></ProtectedRoute>} />
            <Route path="/dashboard/:viewKey" element={<ProtectedRoute allowedRoles={['admin', 'customer_service', 'operations_manager', 'technician']}><LegacyDashboardRedirect /></ProtectedRoute>} />
            <Route path="/orders" element={<Navigate to="/dashboard/daily" replace />} />
            <Route path="/tasks" element={<Navigate to="/dashboard/daily" replace />} />
            <Route path="/tasks/daily" element={<Navigate to="/dashboard/daily" replace />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/products" element={<Navigate to="/" replace />} />
            <Route path="/products/:id" element={<Navigate to="/" replace />} />
            <Route path="/cart" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
>>>>>>> Stashed changes
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
