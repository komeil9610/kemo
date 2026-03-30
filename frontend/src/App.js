import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import OperationsDatePage from './pages/OperationsDatePage';
import './index.css';

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />
            <main className="app-shell">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/operations-date"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <OperationsDatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/daily"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <InternalDailyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/weekly"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <InternalWeeklyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/monthly"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <InternalMonthlyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/:viewKey"
                  element={
                    <ProtectedRoute allowedRoles={['customer_service', 'operations_manager']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/orders" element={<Navigate to="/dashboard" replace />} />
                <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
                <Route path="/tasks/daily" element={<Navigate to="/dashboard/daily" replace />} />
                <Route path="/mobile/admin" element={<Navigate to="/login" replace />} />
                <Route path="/mobile/technician" element={<Navigate to="/login" replace />} />
                <Route path="/mobile/admin/login" element={<Navigate to="/login" replace />} />
                <Route path="/mobile/technician/login" element={<Navigate to="/login" replace />} />
                <Route path="/mobile/technician/register" element={<Navigate to="/login" replace />} />
                <Route path="/products" element={<Navigate to="/" replace />} />
                <Route path="/products/:id" element={<Navigate to="/" replace />} />
                <Route path="/cart" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{ style: { background: '#1a1916', color: '#fff', border: '1px solid #333129' } }}
          />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}
