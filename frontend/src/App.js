import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InternalDailyTasks from './pages/InternalDailyTasks';
import InternalWeeklyTasks from './pages/InternalWeeklyTasks';
import InternalMonthlyTasks from './pages/InternalMonthlyTasks';
import DailyTasks from './pages/DailyTasks';
import Orders from './pages/Orders';
import Register from './pages/Register';
import MobileEntry from './pages/MobileEntry';
import OperationsDatePage from './pages/OperationsDatePage';
import './index.css';

function AppChrome() {
  const location = useLocation();
  const isMobileShell = location.pathname.startsWith('/mobile/') || location.pathname.startsWith('/tasks');

  return (
    <div className={`app-layout ${isMobileShell ? 'mobile-route-layout' : ''}`}>
      {isMobileShell ? null : <Navbar />}
      <main className={`app-shell ${isMobileShell ? 'mobile-route-shell' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/operations-date" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><OperationsDatePage /></ProtectedRoute>} />
          <Route path="/dashboard/daily" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><InternalDailyTasks /></ProtectedRoute>} />
          <Route path="/dashboard/weekly" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><InternalWeeklyTasks /></ProtectedRoute>} />
          <Route path="/dashboard/monthly" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><InternalMonthlyTasks /></ProtectedRoute>} />
          <Route path="/dashboard/:viewKey" element={<ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}><Dashboard /></ProtectedRoute>} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/orders" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<ProtectedRoute allowedRoles={['technician', 'regional_dispatcher']}><Orders /></ProtectedRoute>} />
          <Route path="/tasks/daily" element={<ProtectedRoute allowedRoles={['technician']}><DailyTasks /></ProtectedRoute>} />
          <Route path="/mobile/admin" element={<MobileEntry mode="admin" />} />
          <Route path="/mobile/technician" element={<MobileEntry mode="technician" />} />
          <Route path="/mobile/admin/login" element={<Login appMode="operations" />} />
          <Route path="/mobile/technician/login" element={<Login appMode="technician" />} />
          <Route path="/mobile/technician/register" element={<Register />} />
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
