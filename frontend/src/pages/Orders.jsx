import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data?.orders || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'تعذر تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadOrders();
  }, [token]);

  const cancelOrder = async (orderId) => {
    try {
      setMessage('');
      await orderService.cancel(orderId);
      await loadOrders();
      setMessage('تم إلغاء الطلب بنجاح');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'تعذر إلغاء الطلب');
    }
  };

  if (!token) {
    return (
      <section className="section">
        <h2 className="section-title">طلباتي</h2>
        <div className="detail-card">
          <p className="muted">سجّل الدخول أولًا حتى تتمكن من عرض طلباتك.</p>
          <Link className="btn-primary" to="/login">تسجيل الدخول</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <h2 className="section-title">طلباتي</h2>
      <div className="detail-card orders-panel">
        <div className="table-head">
          <h3>سجل الطلبات</h3>
          <p>كل الطلبات التي أنشأتها من السلة أو من الحجز المباشر تظهر هنا.</p>
        </div>
        {message ? <p className={message.includes('بنجاح') ? 'success-text' : 'error-text'}>{message}</p> : null}
        {loading ? (
          <div className="loading">جارٍ تحميل الطلبات...</div>
        ) : !orders.length ? (
          <div>
            <p className="muted">لا توجد طلبات حتى الآن.</p>
            <Link className="btn-primary" to="/products">ابدأ بالتصفح</Link>
          </div>
        ) : (
          <div className="admin-table">
            {orders.map((order) => (
              <article className="table-row booking-row" key={order.id}>
                <div>
                  <strong>{order.product.name}</strong>
                  <p>{order.product.city}</p>
                  <p>
                    {order.startDate} إلى {order.endDate} | الكمية: {order.quantity}
                  </p>
                  <p>الإجمالي: {order.totalPrice} ريال</p>
                  <p>رقم الطلب: #{order.id}</p>
                </div>
                <div className="table-controls">
                  <span className="inventory-chip">{order.status}</span>
                  {order.status !== 'cancelled' && order.status !== 'completed' ? (
                    <button className="btn-danger" type="button" onClick={() => cancelOrder(order.id)}>
                      إلغاء الطلب
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
