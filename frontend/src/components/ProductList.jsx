// مثال على مكون في React | Example React Component
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/api';

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'device',
    city: 'الرياض',
    page: 1,
    limit: 10,
  });
  const { token } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll(filters);
      const apiProducts = response.data?.products || response.data || [];
      setProducts(Array.isArray(apiProducts) ? apiProducts : []);
    } catch (err) {
      console.warn('Failed to fetch products.', err);
      setError(err?.response?.data?.message || 'تعذر تحميل المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, token]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error-text">{error}</div>;

  return (
    <section className="section">
      <h2 className="section-title">المنتجات المتاحة</h2>
      <div className="product-filters">
        <select 
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="input"
        >
          <option value="device">أجهزة</option>
          <option value="costume">ملابس تنكرية</option>
          <option value="service">خدمات</option>
        </select>

        <input 
          type="text" 
          placeholder="المدينة" 
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="input"
        />

        <button 
          onClick={fetchProducts}
          className="btn-primary"
        >
          بحث
        </button>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article key={product._id} className="product-card">
            <img 
              src={product.images[0]?.url || 'placeholder.jpg'} 
              alt={product.name}
              className="product-image"
            />
            <div className="product-content">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-badges">
                <span className={`inventory-chip ${product.isAvailable ? '' : 'inventory-chip-out'}`}>
                  {product.availabilityLabel || ((product.quantity || 0) > 0 ? 'متوفر' : 'غير متوفر')}
                </span>
                <span className="inventory-chip inventory-chip-neutral">
                  الكمية المتاحة: {product.availableQuantity ?? product.quantity ?? 0}
                </span>
              </div>
              <div className="product-meta">
                <span className="price">
                  {product.pricePerDay} ريال/يوم
                </span>
                <span>⭐ {product.rating}</span>
              </div>
              <Link className="btn-secondary" to={`/products/${product._id}`}>عرض التفاصيل</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
