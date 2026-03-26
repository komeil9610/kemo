import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('New Member');
  const [email, setEmail] = useState('new@rentit.app');
  const [password, setPassword] = useState('123456');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    const success = await register({ name, email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <section className="section auth-wrap">
      <h2 className="section-title">Register</h2>
      <form className="auth-card" onSubmit={onSubmit}>
        <label>Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="error-text">{error}</p> : null}
        <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Creating...' : 'Create account'}</button>
        <p className="muted">Have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </section>
  );
}
