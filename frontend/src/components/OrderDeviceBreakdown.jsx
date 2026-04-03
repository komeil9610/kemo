import React, { useEffect, useMemo, useState } from 'react';
import { getAcTypeLabel, getOrderDeviceCount } from '../utils/internalOrders';

const copy = {
  ar: {
    title: 'الأجهزة',
    all: 'الكل',
    total: 'الإجمالي',
    type: 'النوع',
    empty: 'لا توجد أجهزة مسجلة لهذا الطلب.',
  },
  en: {
    title: 'Devices',
    all: 'All',
    total: 'Total',
    type: 'Type',
    empty: 'No devices recorded for this order.',
  },
};

export default function OrderDeviceBreakdown({ order, lang = 'ar', title }) {
  const t = copy[lang] || copy.en;
  const [activeType, setActiveType] = useState('all');

  const typedGroups = useMemo(
    () => {
      const groupMap = new Map();
      (Array.isArray(order?.acDetails) ? order.acDetails : []).forEach((item, index) => {
        const type = item?.type || `unknown-${index}`;
        const current = groupMap.get(type) || {
          id: item?.id || `device-${index}`,
          type,
          label: getAcTypeLabel(type, lang),
          quantity: 0,
        };
        current.quantity += Math.max(1, Number(item.quantity) || 1);
        groupMap.set(type, current);
      });
      return Array.from(groupMap.values());
    },
    [lang, order?.acDetails]
  );
  const totalDevices = useMemo(() => getOrderDeviceCount(order), [order]);

  const filterOptions = useMemo(
    () => [
      { key: 'all', label: t.all, count: totalDevices },
      ...typedGroups.map((item) => ({
        key: item.type,
        label: item.label,
        count: item.quantity,
      })),
    ],
    [t.all, totalDevices, typedGroups]
  );

  const deviceRows = useMemo(
    () =>
      typedGroups.flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => ({
          id: `${item.id}-${index + 1}`,
          type: item.type,
          typeLabel: item.label,
          label: `${item.label} ${item.quantity > 1 ? index + 1 : ''}`.trim(),
        }))
      ),
    [typedGroups]
  );

  const visibleRows = useMemo(
    () => (activeType === 'all' ? deviceRows : deviceRows.filter((item) => item.type === activeType)),
    [activeType, deviceRows]
  );

  useEffect(() => {
    setActiveType('all');
  }, [order?.id]);

  if (!deviceRows.length) {
    return (
      <div className="task-mini-panel device-breakdown-panel">
        <span>{title || t.title}</span>
        <strong>{t.empty}</strong>
      </div>
    );
  }

  return (
    <div className="task-mini-panel device-breakdown-panel">
      <div className="device-breakdown-header">
        <div>
          <span>{title || t.title}</span>
          <strong>{totalDevices}</strong>
        </div>
      </div>

      <div className="device-filter-strip">
        {filterOptions.map((option) => (
          <button
            className={`device-filter-pill ${activeType === option.key ? 'active' : ''}`}
            key={`${order?.id || 'order'}-${option.key}`}
            type="button"
            onClick={() => setActiveType(option.key)}
          >
            <span>{option.label}</span>
            <strong>{option.count}</strong>
          </button>
        ))}
      </div>

      <div className="device-breakdown-list">
        {visibleRows.map((item, index) => (
          <article className="device-breakdown-item" key={item.id}>
            <strong>{item.label}</strong>
            <small>
              {t.type}: {item.typeLabel}
            </small>
            <small>
              {t.total}: {totalDevices}
            </small>
            <span>{index + 1}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
