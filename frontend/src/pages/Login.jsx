import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('member@rentit.app');
  const [password, setPassword] = useState('123456');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (event) => {
    event.preventDefault();
    await login(email, password);
    const backTo = location.state?.from || '/dashboard';
    navigate(backTo, { replace: true });
  };

  return (
    <section className="section auth-wrap">
      <h2 className="section-title">Login</h2>
      <form className="auth-card" onSubmit={onSubmit}>
        <label>Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="error-text">{error}</p> : null}
        <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
        <p className="muted">No account? <Link to="/register">Create one</Link></p>
      </form>
    </section>
  );
}
