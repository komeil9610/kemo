import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const presets = {
  admin: { email: 'bobkumeel@gmail.com', password: 'Kom123asd@' },
  technician: { email: 'kumeelalnahab@gmail.com', password: 'Komeil@123' },
};

export default function Login() {
  const [email, setEmail] = useState(presets.admin.email);
  const [password, setPassword] = useState(presets.admin.password);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (event) => {
    event.preventDefault();
    const success = await login(email, password);
    if (success) {
      const backTo = location.state?.from || '/';
      navigate(backTo, { replace: true });
    }
  };

  return (
    <section className="page-shell auth-page" dir="ltr">
      <div className="auth-layout">
        <div className="auth-info">
          <p className="eyebrow">Demo access</p>
          <h1>Sign in to Tarkeeb Pro</h1>
          <p>
            This build ships with demo accounts so we can move quickly in the first phase, then connect it to a real
            backend when needed.
          </p>

          <div className="demo-grid">
            <button
              className="preset-card"
              onClick={() => {
                setEmail(presets.admin.email);
                setPassword(presets.admin.password);
              }}
              type="button"
            >
              <strong>Administrator</strong>
              <span>bobkumeel@gmail.com</span>
              <span>Kom123asd@</span>
            </button>
            <button
              className="preset-card"
              onClick={() => {
                setEmail(presets.technician.email);
                setPassword(presets.technician.password);
              }}
              type="button"
            >
              <strong>Technician</strong>
              <span>kumeelalnahab@gmail.com</span>
              <span>Komeil@123</span>
            </button>
          </div>
        </div>

        <form className="auth-card" onSubmit={onSubmit}>
          <label>Email address</label>
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />

          {error ? <p className="error-text">{error}</p> : null}

          <button className="btn-primary" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="muted">
            Need a quick look at the seeded accounts? <Link to="/register">Open demo accounts</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
