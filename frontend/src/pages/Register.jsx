import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { operationsService } from '../services/api';

export default function Register() {
  const [message, setMessage] = useState('');

  const resetDemo = async () => {
    await operationsService.resetDemoData();
    setMessage('Demo data has been reset successfully');
  };

  return (
    <section className="page-shell" dir="ltr">
      <div className="panel helper-panel">
        <p className="eyebrow">Quick access</p>
        <h1>Seeded accounts ready for testing</h1>
        <p>
          Instead of creating users here, this page lists the seeded accounts so you can test the admin and technician
          flows immediately.
        </p>

        <div className="demo-grid">
          <article className="preset-card static-card">
            <strong>Administrator</strong>
            <span>bobkumeel@gmail.com</span>
            <span>Kom123asd@</span>
          </article>
          <article className="preset-card static-card">
            <strong>Eastern Technician</strong>
            <span>kumeelalnahab@gmail.com</span>
            <span>Komeil@123</span>
          </article>
        </div>

        <div className="helper-actions">
          <Link className="btn-primary" to="/login">Go to sign in</Link>
          <button className="btn-light" onClick={resetDemo} type="button">Reset demo data</button>
        </div>

        {message ? <p className="success-text">{message}</p> : null}
      </div>
    </section>
  );
}
