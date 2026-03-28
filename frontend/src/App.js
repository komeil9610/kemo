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
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MobileEntry from './pages/MobileEntry';
import './index.css';

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
          <Toaster
            position="bottom-right"
            toastOptions={{ style: { background: '#1a1916', color: '#fff', border: '1px solid #333129' } }}
          />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const isMobileEntry = pathname.startsWith('/mobile/');

  return (
    <div className="app-layout">
      {isMobileEntry ? null : <Navbar />}
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mobile/admin" element={<MobileEntry mode="admin" />} />
          <Route path="/mobile/technician" element={<MobileEntry mode="technician" />} />
          <Route path="/mobile/admin/login" element={<Login />} />
          <Route path="/mobile/technician/login" element={<Login />} />
          <Route path="/mobile/technician/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={['technician']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/orders" element={<Navigate to="/tasks" replace />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="/products/:id" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {isMobileEntry ? null : <Footer />}
    </div>
  );
}
