import React, { useEffect, useMemo, useState } from 'react';
import { operationsService } from '../services/api';

const emptyOrderForm = {
  customerName: '',
  phone: '',
  address: '',
  acType: '',
  scheduledDate: '',
  technicianId: '',
  notes: '',
};

const emptyTechnicianForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  region: 'Eastern Province',
  notes: '',
};

const regionOptions = [
  'Riyadh Region',
  'Makkah Region',
  'Madinah Region',
  'Eastern Province',
  'Qassim Region',
  'Asir Region',
  'Tabuk Region',
  'Hail Region',
  'Northern Borders',
  'Jazan Region',
  'Najran Region',
  'Al Bahah Region',
  'Al Jawf Region',
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'en_route', label: 'En route' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderForm);
  const [technicianForm, setTechnicianForm] = useState(emptyTechnicianForm);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingTechnician, setSavingTechnician] = useState(false);
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await operationsService.getDashboard();
      setDashboard(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    window.addEventListener('operations-updated', loadDashboard);
    return () => window.removeEventListener('operations-updated', loadDashboard);
  }, []);

  const stats = useMemo(() => {
    if (!dashboard?.summary) {
      return [];
    }

    return [
      { label: 'Total orders', value: dashboard.summary.totalOrders },
      { label: 'Pending orders', value: dashboard.summary.pendingOrders },
      { label: 'Active orders', value: dashboard.summary.activeOrders },
      { label: 'Available technicians', value: dashboard.summary.availableTechnicians },
    ];
  }, [dashboard]);

  const submitOrder = async (event) => {
    event.preventDefault();
    try {
      setSavingOrder(true);
      setMessage('');
      await operationsService.createOrder(orderForm);
      setOrderForm(emptyOrderForm);
      setMessage('Order created and assigned successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || 'Unable to create the order.');
    } finally {
      setSavingOrder(false);
    }
  };

  const submitTechnician = async (event) => {
    event.preventDefault();
    try {
      setSavingTechnician(true);
      setMessage('');
      await operationsService.createTechnician(technicianForm);
      setTechnicianForm(emptyTechnicianForm);
      setMessage('Technician account created successfully.');
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || error.message || 'Unable to create the technician account.');
    } finally {
      setSavingTechnician(false);
    }
  };

  const updateOrder = async (orderId, changes, successText) => {
    setMessage('');
    await operationsService.updateOrder(orderId, changes);
    setMessage(successText);
    await loadDashboard();
  };

  if (loading) {
    return <section className="page-shell">Loading the admin dashboard...</section>;
  }

  return (
    <section className="page-shell" dir="ltr">
      <div className="section-heading">
        <p className="eyebrow">Admin dashboard</p>
        <h1>Customer operations control room</h1>
        <p className="section-subtitle">
          Manage installation jobs, assign technicians, and create technician accounts from one place.
        </p>
      </div>

      {message ? <div className="flash-message">{message}</div> : null}

      <div className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <form className="panel form-panel" onSubmit={submitOrder}>
          <div className="panel-header">
            <h2>Create a new order</h2>
            <p>Log the customer details first, then assign the correct technician for the region.</p>
          </div>

          <label>Customer name</label>
          <input
            className="input"
            value={orderForm.customerName}
            onChange={(event) => setOrderForm({ ...orderForm, customerName: event.target.value })}
            required
          />

          <label>Phone number</label>
          <input
            className="input"
            value={orderForm.phone}
            onChange={(event) => setOrderForm({ ...orderForm, phone: event.target.value })}
            required
          />

          <label>Location</label>
          <input
            className="input"
            value={orderForm.address}
            onChange={(event) => setOrderForm({ ...orderForm, address: event.target.value })}
            required
          />

          <label>AC type</label>
          <input
            className="input"
            value={orderForm.acType}
            onChange={(event) => setOrderForm({ ...orderForm, acType: event.target.value })}
            placeholder="Example: Split AC 24,000 BTU"
            required
          />

          <label>Scheduled date</label>
          <input
            className="input"
            type="date"
            value={orderForm.scheduledDate}
            onChange={(event) => setOrderForm({ ...orderForm, scheduledDate: event.target.value })}
            required
          />

          <label>Assign technician</label>
          <select
            className="input"
            value={orderForm.technicianId}
            onChange={(event) => setOrderForm({ ...orderForm, technicianId: event.target.value })}
            required
          >
            <option value="">Choose a technician</option>
            {dashboard?.technicians?.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} - {technician.region || technician.zone} - {technician.status === 'available' ? 'Available' : 'Busy'}
              </option>
            ))}
          </select>

          <label>Notes</label>
          <textarea
            className="input textarea"
            value={orderForm.notes}
            onChange={(event) => setOrderForm({ ...orderForm, notes: event.target.value })}
            placeholder="Access instructions or customer notes"
          />

          <button className="btn-primary" disabled={savingOrder} type="submit">
            {savingOrder ? 'Saving...' : 'Create order'}
          </button>
        </form>

        <div className="panel dashboard-sidebar">
          <form className="nested-form" onSubmit={submitTechnician}>
            <div className="panel-header">
              <h2>Create a technician account</h2>
              <p>Add a technician profile, login account, and Saudi region in one step.</p>
            </div>

            <div className="grid-two">
              <div>
                <label>First name</label>
                <input
                  className="input"
                  value={technicianForm.firstName}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, firstName: event.target.value })}
                  required
                />
              </div>
              <div>
                <label>Last name</label>
                <input
                  className="input"
                  value={technicianForm.lastName}
                  onChange={(event) => setTechnicianForm({ ...technicianForm, lastName: event.target.value })}
                  required
                />
              </div>
            </div>

            <label>Email</label>
            <input
              className="input"
              type="email"
              value={technicianForm.email}
              onChange={(event) => setTechnicianForm({ ...technicianForm, email: event.target.value })}
              required
            />

            <label>Phone</label>
            <input
              className="input"
              value={technicianForm.phone}
              onChange={(event) => setTechnicianForm({ ...technicianForm, phone: event.target.value })}
              required
            />

            <label>Password</label>
            <input
              className="input"
              type="password"
              value={technicianForm.password}
              onChange={(event) => setTechnicianForm({ ...technicianForm, password: event.target.value })}
              required
            />

            <label>Saudi region</label>
            <select
              className="input"
              value={technicianForm.region}
              onChange={(event) => setTechnicianForm({ ...technicianForm, region: event.target.value })}
              required
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <label>Technician info</label>
            <textarea
              className="input textarea"
              value={technicianForm.notes}
              onChange={(event) => setTechnicianForm({ ...technicianForm, notes: event.target.value })}
              placeholder="Coverage notes, specialization, or any extra information"
            />

            <button className="btn-secondary" disabled={savingTechnician} type="submit">
              {savingTechnician ? 'Creating...' : 'Create technician'}
            </button>
          </form>

          <div className="finance-grid">
            <article className="finance-card">
              <span>Revenue from copper and bases</span>
              <strong>{dashboard?.summary?.extrasRevenue || 0} SAR</strong>
            </article>
            <article className="finance-card">
              <span>Total copper meters</span>
              <strong>{dashboard?.summary?.copperMeters || 0} m</strong>
            </article>
            <article className="finance-card">
              <span>Bases sold</span>
              <strong>{dashboard?.summary?.basesCount || 0}</strong>
            </article>
          </div>

          <div className="tech-list">
            <h3>Technicians</h3>
            {dashboard?.technicians?.length ? (
              dashboard.technicians.map((technician) => (
                <article className="tech-card" key={technician.id}>
                  <div>
                    <strong>{technician.name}</strong>
                    <p>{technician.region || technician.zone}</p>
                    <p>{technician.phone}</p>
                    <p>{technician.email}</p>
                    {technician.notes ? <p className="muted">{technician.notes}</p> : null}
                  </div>
                  <span className={`status-badge ${technician.status}`}>
                    {technician.status === 'available' ? 'Available' : 'Busy'}
                  </span>
                </article>
              ))
            ) : (
              <p className="muted">No technicians have been added yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Order tracking</h2>
          <p>Change the technician or update the status from the same screen.</p>
        </div>

        <div className="order-list">
          {dashboard?.orders?.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-main">
                <div>
                  <div className="order-topline">
                    <strong>{order.customerName}</strong>
                    <span className={`status-badge ${order.status}`}>
                      {operationsService.getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p>{order.address}</p>
                  <p>{order.acType}</p>
                  <p>Technician: {order.technicianName}</p>
                  <p>Scheduled date: {order.scheduledDate}</p>
                  <p>Collected extras: {order.extras?.totalPrice || 0} SAR</p>
                </div>

                <div className="order-actions">
                  <select
                    className="input compact-input"
                    value={order.technicianId}
                    onChange={(event) =>
                      updateOrder(order.id, { technicianId: event.target.value }, 'Technician updated successfully.')
                    }
                  >
                    {dashboard?.technicians?.map((technician) => (
                      <option key={technician.id} value={technician.id}>
                        {technician.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="input compact-input"
                    value={order.status}
                    onChange={(event) =>
                      updateOrder(order.id, { status: event.target.value }, 'Order status updated.')
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
