import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cartStorage, productService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    startDate: '2026-03-28',
    endDate: '2026-03-30',
    quantity: 1,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productService.getById(id);
        setProduct(response.data?.product || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <section className="section"><div className="loading">Loading product...</div></section>;
  }

  if (!product) {
    return (
      <section className="section">
        <div className="detail-card">
          <p>Product not found.</p>
          <Link className="btn-primary" to="/products">Back to products</Link>
        </div>
      </section>
    );
  }

  const addToCart = (event) => {
    event.preventDefault();
    const quantity = Number(booking.quantity);
    const availableQuantity = Number(product.availableQuantity ?? product.quantity ?? 0);

    if (quantity <= 0) {
      setMessage('الكمية يجب أن تكون 1 على الأقل');
      return;
    }

    if (availableQuantity <= 0) {
      setMessage('هذا المنتج غير متوفر حاليًا');
      return;
    }

    if (quantity > availableQuantity) {
      setMessage(`الكمية المتاحة حاليًا هي ${availableQuantity} فقط`);
      return;
    }

    cartStorage.addItem({
      id: `${id}-${booking.startDate}-${booking.endDate}`,
      productId: Number(id),
      productName: product.name,
      productImage: product.images?.[0]?.url,
      city: product.city,
      pricePerDay: Number(product.pricePerDay || 0),
      startDate: booking.startDate,
      endDate: booking.endDate,
      quantity,
      availableQuantity,
    });

    setMessage('تمت إضافة المنتج إلى السلة بنجاح');
  };

  const availableQuantity = Number(product.availableQuantity ?? product.quantity ?? 0);
  const isAvailable = availableQuantity > 0;

  return (
    <section className="section">
      <h2 className="section-title">{product.name}</h2>
      <div className="detail-card detail-layout">
        <img src={product.images?.[0]?.url} alt={product.name} className="product-image" />
        <div className="detail-stack">
          <p><strong>الوصف:</strong> {product.description}</p>
          <p><strong>الفئة:</strong> {product.category}</p>
          <p><strong>المدينة:</strong> {product.city}</p>
          <p><strong>السعر:</strong> {product.pricePerDay} ريال/يوم</p>
          <div className="product-badges">
            <span className={`inventory-chip ${isAvailable ? '' : 'inventory-chip-out'}`}>
              {product.availabilityLabel || (isAvailable ? 'متوفر' : 'غير متوفر')}
            </span>
            <span className="inventory-chip inventory-chip-neutral">
              الكمية المتاحة: {availableQuantity}
            </span>
          </div>
          <p><strong>التقييم:</strong> {product.rating}</p>

          {token ? (
            <form className="booking-form" onSubmit={addToCart}>
              <h3>أضف هذا المنتج إلى السلة</h3>
              <div className="dashboard-grid-2">
                <div>
                  <label>من</label>
                  <input className="input" type="date" value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value })} required />
                </div>
                <div>
                  <label>إلى</label>
                  <input className="input" type="date" value={booking.endDate} onChange={(e) => setBooking({ ...booking, endDate: e.target.value })} required />
                </div>
              </div>
              <label>الكمية</label>
              <input
                className="input"
                type="number"
                min={isAvailable ? '1' : '0'}
                max={Math.max(availableQuantity, 0)}
                value={isAvailable ? booking.quantity : 0}
                onChange={(e) => setBooking({ ...booking, quantity: Number(e.target.value) })}
                disabled={!isAvailable}
                required
              />
              {message ? <p className={message.includes('بنجاح') ? 'success-text' : 'error-text'}>{message}</p> : null}
              {!isAvailable ? <p className="muted">المنتج نافد حاليًا، ويمكنك العودة لاحقًا عند تحديث المخزون.</p> : null}
              <button className="btn-primary" type="submit" disabled={!isAvailable}>إضافة إلى السلة</button>
              <Link className="btn-secondary" to="/cart">فتح السلة</Link>
            </form>
          ) : (
            <p className="muted">سجّل الدخول أولًا حتى تتمكن من إضافة المنتجات إلى السلة وإتمام الطلب.</p>
          )}
        </div>
        <Link className="btn-primary" to="/products">Back to products</Link>
      </div>
    </section>
  );
}
