import React, { useEffect, useMemo, useState } from 'react';
import { getOrderReferenceText, orderMatchesSearchQuery } from '../utils/internalOrders';

const defaultMatchesSearch = (order, query) => {
  return orderMatchesSearchQuery(order, query);
};

export default function OrderMasterDetail({
  orders = [],
  emptyText,
  emptySearchText,
  isRTL = false,
  labels,
  searchPlaceholder,
  getOrderReference = (order) => getOrderReferenceText(order),
  getCustomerName = (order) => order?.customerName || '—',
  getStatusLabel = (order) => order?.status || '—',
  renderCustomerCell,
  matchesSearch = defaultMatchesSearch,
  renderResultsSummary,
  renderOrderDetails,
  renderRowActions,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const hasRowActions = typeof renderRowActions === 'function';

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

  useEffect(() => {
    if (!selectedOrder || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [selectedOrder]);

  const openOrderDetails = (orderId) => setSelectedOrderId(String(orderId));

  const onCellKeyDown = (event, orderId) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    openOrderDetails(orderId);
  };

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
          <div className={`order-compact-table ${hasRowActions ? 'with-actions' : ''}`} role="table">
            <div className="order-compact-head" role="rowgroup">
              <div className={`order-compact-row order-compact-row-head ${hasRowActions ? 'with-actions' : ''}`} role="row">
                <span className="order-compact-cell" role="columnheader">
                  {labels.orderId}
                </span>
                <span className="order-compact-cell" role="columnheader">
                  {labels.status}
                </span>
                <span className="order-compact-cell" role="columnheader">
                  {labels.customer}
                </span>
                {hasRowActions ? (
                  <span className="order-compact-cell order-compact-cell-actions-head" role="columnheader">
                    {labels.actions}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="order-compact-body" role="rowgroup">
              {visibleOrders.map((order) => {
                const isSelected = String(selectedOrderId) === String(order.id);

                return (
                  <div
                    className={`order-compact-row ${hasRowActions ? 'with-actions' : ''} ${isSelected ? 'selected' : ''}`}
                    key={order.id}
                    role="row"
                  >
                    <button
                      className="order-compact-cell order-compact-cell-button"
                      type="button"
                      data-label={labels.orderId}
                      onClick={() => openOrderDetails(order.id)}
                      onKeyDown={(event) => onCellKeyDown(event, order.id)}
                      role="cell"
                    >
                      <strong>{getOrderReference(order)}</strong>
                    </button>
                    <button
                      className="order-compact-cell order-compact-cell-button"
                      type="button"
                      data-label={labels.status}
                      onClick={() => openOrderDetails(order.id)}
                      onKeyDown={(event) => onCellKeyDown(event, order.id)}
                      role="cell"
                    >
                      <span className={`status-badge ${order.status || ''}`}>{getStatusLabel(order)}</span>
                    </button>
                    <button
                      className="order-compact-cell order-compact-cell-button"
                      type="button"
                      data-label={labels.customer}
                      onClick={() => openOrderDetails(order.id)}
                      onKeyDown={(event) => onCellKeyDown(event, order.id)}
                      role="cell"
                    >
                      {typeof renderCustomerCell === 'function' ? renderCustomerCell(order) : getCustomerName(order)}
                    </button>
                    {hasRowActions ? (
                      <span className="order-compact-cell order-compact-action-cell" data-label={labels.actions} role="cell">
                        {renderRowActions(order)}
                      </span>
                    ) : null}
                  </div>
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
