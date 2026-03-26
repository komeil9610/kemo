import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();

  return (
    <section className="section">
      <h2 className="section-title">Product Details</h2>
      <div className="detail-card">
        <p>Viewing item ID: <strong>{id}</strong></p>
        <p>This is the active detail route. Connect it to backend product data when ready.</p>
        <Link className="btn-primary" to="/products">Back to products</Link>
      </div>
    </section>
  );
}
