import React, { useEffect, useMemo, useState } from 'react';

const defaultMatchesSearch = (order, query) => {
  const haystack = [
    order?.id,
    order?.requestNumber,
    order?.customerName,
    order?.status,
    order?.city,
    order?.district,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
};

export default function OrderMasterDetail({
  orders = [],
  emptyText,
  emptySearchText,
  isRTL = false,
  labels,
  searchPlaceholder,
  getOrderReference = (order) => order?.requestNumber || order?.id || '—',
  getCustomerName = (order) => order?.customerName || '—',
  getStatusLabel = (order) => order?.status || '—',
  matchesSearch = defaultMatchesSearch,
  renderResultsSummary,
  renderOrderDetails,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleOrders = useMemo(() => {
    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) => matchesSearch(order, normalizedQuery));
  }, [matchesSearch, normalizedQuery, orders]);

  const selectedOrder = useMemo(
    () => visibleOrders.find((order) => String(order.id) === String(selectedOrderId)) || null,
    [selectedOrderId, visibleOrders]
  );

  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }

    if (!visibleOrders.some((order) => String(order.id) === String(selectedOrderId))) {
      setSelectedOrderId('');
    }
  }, [selectedOrderId, visibleOrders]);

  useEffect(() => {
    if (!selectedOrder) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedOrderId('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedOrder]);

  return (
    <>
      <div className="order-master-detail">
        <div className="order-list-toolbar">
          <label className="filter-field compact-filter">
            <span>{labels.search}</span>
            <input
              className="input compact-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>
          {renderResultsSummary ? <p className="muted order-list-results">{renderResultsSummary(visibleOrders.length, orders.length)}</p> : null}
        </div>

        {visibleOrders.length ? (
          <div className="order-compact-table" role="table">
            <div className="order-compact-head" role="rowgroup">
              <div className="order-compact-row order-compact-row-head" role="row">
                <span className="order-compact-cell" role="columnheader">
                  {labels.orderId}
                </span>
                <span className="order-compact-cell" role="columnheader">
                  {labels.status}
                </span>
                <span className="order-compact-cell" role="columnheader">
                  {labels.customer}
                </span>
              </div>
            </div>

            <div className="order-compact-body" role="rowgroup">
              {visibleOrders.map((order) => {
                const isSelected = String(selectedOrderId) === String(order.id);

                return (
                  <button
                    className={`order-compact-row ${isSelected ? 'selected' : ''}`}
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedOrderId(String(order.id))}
                    role="row"
                  >
                    <span className="order-compact-cell" data-label={labels.orderId} role="cell">
                      <strong>{getOrderReference(order)}</strong>
                    </span>
                    <span className="order-compact-cell" data-label={labels.status} role="cell">
                      <span className={`status-badge ${order.status || ''}`}>{getStatusLabel(order)}</span>
                    </span>
                    <span className="order-compact-cell" data-label={labels.customer} role="cell">
                      {getCustomerName(order)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="muted">{normalizedQuery ? emptySearchText || emptyText : emptyText}</p>
        )}
      </div>

      {selectedOrder ? (
        <div className="order-drawer-backdrop print-hidden" onClick={() => setSelectedOrderId('')} role="presentation">
          <aside
            aria-label={labels.drawerTitle}
            aria-modal="true"
            className={`order-detail-drawer ${isRTL ? 'rtl' : ''}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="drawer-head">
              <div>
                <p className="task-region">{labels.drawerTitle}</p>
                <h2>
                  {getOrderReference(selectedOrder)} - {getCustomerName(selectedOrder)}
                </h2>
              </div>
              <div className="drawer-head-actions">
                <span className={`status-badge ${selectedOrder.status || ''}`}>{getStatusLabel(selectedOrder)}</span>
                <button className="btn-light drawer-close" type="button" onClick={() => setSelectedOrderId('')}>
                  {labels.close}
                </button>
              </div>
            </div>

            <div className="drawer-body">{renderOrderDetails(selectedOrder, () => setSelectedOrderId(''))}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
