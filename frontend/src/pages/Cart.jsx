import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartService, cartStorage, orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export default function Cart() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState('');
  const hasUnavailableItems = items.some((item) => Number(item.availableQuantity ?? 0) <= 0);
  const hasInvalidQuantities = items.some((item) => {
    const availableQuantity = Number(item.availableQuantity ?? 0);
    const quantity = Number(item.quantity ?? 0);
    return availableQuantity > 0 && quantity > availableQuantity;
  });

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const days = calculateDays(item.startDate, item.endDate);
        return sum + Number(item.pricePerDay || 0) * Number(item.quantity || 0) * days;
      }, 0),
    [items]
  );

  useEffect(() => {
    setItems(cartStorage.getItems());
  }, []);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const response = await orderService.getAll();
        setOrders(response.data?.orders || []);
      } catch (error) {
        setMessage(error?.response?.data?.message || 'تعذر تحميل الطلبات');
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [token]);

  const syncCart = (nextItems) => {
    setItems(nextItems);
  };

  const updateItem = (cartItemId, nextValues) => {
    const nextItems = cartStorage.updateItem(cartItemId, nextValues);
    syncCart(nextItems);
  };

  const removeItem = (cartItemId) => {
    const nextItems = cartStorage.removeItem(cartItemId);
    syncCart(nextItems);
  };

  const checkout = async () => {
    if (!items.length) {
      setMessage('السلة فارغة');
      return;
    }

    if (hasUnavailableItems || hasInvalidQuantities) {
      setMessage('يوجد منتج غير متوفر أو كمية أعلى من المخزون المتاح. حدّث السلة أولًا.');
      return;
    }

    try {
      setCheckingOut(true);
      setMessage('');
      await cartService.checkout(
        items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          startDate: item.startDate,
          endDate: item.endDate,
        }))
      );
      cartStorage.clear();
      syncCart([]);
      setMessage('تم تنفيذ الطلب بنجاح');
      if (token) {
        const response = await orderService.getAll();
        setOrders(response.data?.orders || []);
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || 'تعذر إتمام الطلب');
    } finally {
      setCheckingOut(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setMessage('');
      await orderService.cancel(orderId);
      const response = await orderService.getAll();
      setOrders(response.data?.orders || []);
      setMessage('تم إلغاء الطلب');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'تعذر إلغاء الطلب');
    }
  };

  return (
    <section className="section">
      <h2 className="section-title">السلة والطلبات</h2>
      <div className="cart-layout">
        <div className="detail-card">
          <h3>سلة العميل</h3>
          {!items.length ? (
            <>
              <p>السلة فارغة حاليًا.</p>
              <Link className="btn-primary" to="/products">تصفح المنتجات</Link>
            </>
          ) : (
            <div className="cart-list">
              {items.map((item) => {
                const days = calculateDays(item.startDate, item.endDate);
                const lineTotal = Number(item.pricePerDay || 0) * Number(item.quantity || 0) * days;

                return (
                  <article className="cart-item" key={item.id}>
                    <img className="cart-item-image" src={item.productImage} alt={item.productName} />
                    <div className="cart-item-body">
                      <div className="cart-item-head">
                        <div>
                          <h4>{item.productName}</h4>
                          <p>{item.city}</p>
                        </div>
                        <strong>{lineTotal} ريال</strong>
                      </div>
                      <div className="dashboard-grid-2">
                        <div>
                          <label>من</label>
                          <input
                            className="input"
                            type="date"
                            value={item.startDate}
                            onChange={(e) => updateItem(item.id, { startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label>إلى</label>
                          <input
                            className="input"
                            type="date"
                            value={item.endDate}
                            onChange={(e) => updateItem(item.id, { endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="cart-item-footer">
                        <div className="cart-qty">
                          <label>الكمية</label>
                          <input
                            className="input table-input"
                            type="number"
                            min={Number(item.availableQuantity || 0) > 0 ? '1' : '0'}
                            max={Math.max(Number(item.availableQuantity || 0), 0)}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                            disabled={Number(item.availableQuantity || 0) <= 0}
                          />
                        </div>
                        <span className={`inventory-chip ${Number(item.availableQuantity || 0) > 0 ? 'inventory-chip-neutral' : 'inventory-chip-out'}`}>
                          {Number(item.availableQuantity || 0) > 0
                            ? `المتوفر الآن: ${item.availableQuantity}`
                            : 'نفد المخزون'}
                        </span>
                        <button className="btn-danger" type="button" onClick={() => removeItem(item.id)}>
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="detail-card cart-summary">
          <h3>ملخص الطلب</h3>
          <p>عدد العناصر: {items.length}</p>
          <p>الإجمالي المتوقع: <strong>{total} ريال</strong></p>
          {hasUnavailableItems ? <p className="error-text">يوجد عنصر في السلة غير متوفر حاليًا.</p> : null}
          {hasInvalidQuantities ? <p className="error-text">بعض الكميات في السلة أعلى من المخزون الحالي.</p> : null}
          {!token ? <p className="muted">سجّل الدخول أولًا ثم أكمل الطلب من هذه الصفحة.</p> : null}
          {message ? <p className={message.includes('تم') ? 'success-text' : 'error-text'}>{message}</p> : null}
          <div className="dashboard-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={checkout}
              disabled={!token || !items.length || checkingOut || hasUnavailableItems || hasInvalidQuantities}
            >
              {checkingOut ? 'جارٍ الإتمام...' : 'إتمام الشراء'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => syncCart(cartStorage.clear())} disabled={!items.length}>
              تفريغ السلة
            </button>
          </div>
        </div>
      </div>

      <div className="detail-card orders-panel">
        <div className="table-head">
          <h3>طلبات العميل</h3>
          <p>يمكنك متابعة الطلبات الحالية وإلغاء الطلبات المعلقة عند الحاجة.</p>
        </div>
        {!token ? (
          <p className="muted">سجّل الدخول لعرض طلباتك.</p>
        ) : loadingOrders ? (
          <div className="loading">جارٍ تحميل الطلبات...</div>
        ) : !orders.length ? (
          <p className="muted">لا توجد طلبات حتى الآن.</p>
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
                </div>
                <div className="table-controls">
                  <span className="inventory-chip">{order.status}</span>
                  {order.status !== 'cancelled' ? (
                    <button className="btn-danger" type="button" onClick={() => cancelOrder(order.id)}>
                      إلغاء
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
