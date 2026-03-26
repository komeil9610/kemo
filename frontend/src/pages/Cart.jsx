import React from 'react';
import { Link } from 'react-router-dom';

export default function Cart() {
  return (
    <section className="section">
      <h2 className="section-title">Your Cart</h2>
      <div className="detail-card">
        <p>Your cart is empty for now.</p>
        <Link className="btn-primary" to="/products">Browse products</Link>
      </div>
    </section>
  );
}
