import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="section">
      <h2 className="section-title">Dashboard</h2>
      <div className="detail-card">
        <p>Welcome back, <strong>{user?.name || 'Member'}</strong>.</p>
        <p>Active routes are now connected and this page is protected by auth.</p>
      </div>
    </section>
  );
}
