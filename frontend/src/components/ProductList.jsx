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
      console.warn('Using local product fallback because API call failed.', err);
      setError(null);
      setProducts([
        {
          _id: '1',
          name: 'PlayStation 5',
          description: '4K console with two controllers and FIFA.',
          pricePerDay: 80,
          rating: 4.9,
          city: 'الرياض',
          images: [{ url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80' }]
        },
        {
          _id: '2',
          name: 'DSLR Camera Kit',
          description: 'Canon DSLR with lens set and tripod.',
          pricePerDay: 120,
          rating: 4.7,
          city: 'جدة',
          images: [{ url: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=900&q=80' }]
        },
        {
          _id: '3',
          name: 'Party Costume Bundle',
          description: 'Premium costume set for events and theme nights.',
          pricePerDay: 60,
          rating: 4.6,
          city: 'الدمام',
          images: [{ url: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=900&q=80' }]
        }
      ]);
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
