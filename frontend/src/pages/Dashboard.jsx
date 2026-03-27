import React, { useEffect, useMemo, useState } from 'react';
import { adminService, productService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '',
  description: '',
  category: 'device',
  city: 'الرياض',
  pricePerDay: 0,
  quantity: 1,
  rating: 4.5,
  imageUrl: '',
};

const emptyFooterForm = {
  aboutText: '',
  usefulLinks: [],
  customerServiceLinks: [],
  socialLinks: [],
  copyrightText: '',
};

const emptyHomeSettingsForm = {
  heroKicker: '',
  heroTitle: '',
  heroSubtitle: '',
  primaryButtonText: '',
  primaryButtonUrl: '',
  secondaryButtonText: '',
  secondaryButtonUrl: '',
  stats: [],
};

const tabs = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'products', label: 'المنتجات' },
  { id: 'users', label: 'المستخدمون' },
  { id: 'bookings', label: 'الحجوزات' },
  { id: 'home', label: 'إعدادات الرئيسية' },
  { id: 'footer', label: 'إعدادات الـ Footer' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [footerForm, setFooterForm] = useState(emptyFooterForm);
  const [homeSettingsForm, setHomeSettingsForm] = useState(emptyHomeSettingsForm);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const stats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + (product.quantity || 0), 0);
    const activeUsers = users.filter((entry) => entry.status === 'active').length;
    const pendingBookings = bookings.filter((entry) => entry.status === 'pending').length;
    return [
      { label: 'المنتجات', value: products.length, accent: 'blue' },
      { label: 'المخزون', value: totalStock, accent: 'green' },
      { label: 'المستخدمون النشطون', value: activeUsers, accent: 'gold' },
      { label: 'حجوزات معلقة', value: pendingBookings, accent: 'rose' },
    ];
  }, [products, users, bookings]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const [productsResponse, usersResponse, bookingsResponse, footerResponse, homeSettingsResponse] = await Promise.all([
        adminService.getProducts(),
        adminService.getUsers(),
        adminService.getBookings(),
        adminService.getFooter(),
        adminService.getHomeSettings(),
      ]);
      setProducts(productsResponse.data?.products || []);
      setUsers(usersResponse.data?.users || []);
      setBookings(bookingsResponse.data?.bookings || []);
      setFooterForm(normalizeFooterForm(footerResponse.data?.footer));
      setHomeSettingsForm(normalizeHomeSettingsForm(homeSettingsResponse.data?.homeSettings));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const addFooterItem = (key, item) => {
    setFooterForm((current) => ({
      ...current,
      [key]: [...current[key], item],
    }));
  };

  const updateFooterItem = (key, index, field, value) => {
    setFooterForm((current) => ({
      ...current,
      [key]: current[key].map((entry, entryIndex) => (
        entryIndex === index ? { ...entry, [field]: value } : entry
      )),
    }));
  };

  const removeFooterItem = (key, index) => {
    setFooterForm((current) => ({
      ...current,
      [key]: current[key].filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const addHomeStat = () => {
    setHomeSettingsForm((current) => ({
      ...current,
      stats: [...current.stats, { value: '', label: '' }],
    }));
  };

  const updateHomeStat = (index, field, value) => {
    setHomeSettingsForm((current) => ({
      ...current,
      stats: current.stats.map((entry, entryIndex) => (
        entryIndex === index ? { ...entry, [field]: value } : entry
      )),
    }));
  };

  const removeHomeStat = (index) => {
    setHomeSettingsForm((current) => ({
      ...current,
      stats: current.stats.filter((_, entryIndex) => entryIndex !== index),
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (editingId) {
        await productService.update(editingId, form);
        setSuccess('تم تحديث المنتج بنجاح');
      } else {
        await productService.create(form);
        setSuccess('تمت إضافة المنتج بنجاح');
      }
      resetForm();
      await loadDashboard();
      setActiveTab('products');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'device',
      city: product.city || 'الرياض',
      pricePerDay: product.pricePerDay || 0,
      quantity: product.quantity ?? 1,
      rating: product.rating || 0,
      imageUrl: product.images?.[0]?.url || '',
    });
    setActiveTab('products');
    setSuccess('');
    setError('');
  };

  const onDelete = async (productId) => {
    const confirmed = window.confirm('هل تريد حذف هذا المنتج؟');
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      await productService.delete(productId);
      if (editingId === productId) {
        resetForm();
      }
      setSuccess('تم حذف المنتج');
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product');
    }
  };

  const updateUser = async (userId, nextValues) => {
    try {
      setError('');
      setSuccess('');
      await adminService.updateUser(userId, nextValues);
      setSuccess('تم تحديث المستخدم');
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user');
    }
  };

  const updateBooking = async (bookingId, status) => {
    try {
      setError('');
      setSuccess('');
      await adminService.updateBooking(bookingId, { status });
      setSuccess('تم تحديث الحجز');
      await loadDashboard();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update booking');
    }
  };

  const saveFooter = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await adminService.updateFooter(footerForm);
      setFooterForm(normalizeFooterForm(response.data?.footer));
      window.dispatchEvent(new Event('footer-settings-updated'));
      setSuccess('تم تحديث بيانات الـ footer بنجاح');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update footer');
    } finally {
      setSaving(false);
    }
  };

  const saveHomeSettings = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await adminService.updateHomeSettings(homeSettingsForm);
      setHomeSettingsForm(normalizeHomeSettingsForm(response.data?.homeSettings));
      window.dispatchEvent(new Event('home-settings-updated'));
      setSuccess('تم تحديث إعدادات الصفحة الرئيسية بنجاح');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update home settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section dashboard">
      <div className="dashboard-hero-pro">
        <div className="dashboard-hero-copy">
          <p className="hero-kicker dashboard-kicker">Admin Console</p>
          <h2 className="section-title">لوحة تحكم احترافية لـ RentIT</h2>
          <p>مرحبًا {user?.name || 'Admin'}، من هنا تدير المنتجات والمستخدمين والحجوزات من مكان واحد.</p>
          <div className="dashboard-quick-actions">
            <button className="btn-primary" type="button" onClick={() => setActiveTab('home')}>
              تعديل الصفحة الرئيسية
            </button>
            <button className="btn-light" type="button" onClick={() => setActiveTab('footer')}>
              تعديل الـ Footer
            </button>
          </div>
        </div>
        <div className="dashboard-hero-side">
          <div className="dashboard-badge">الصلاحية: {user?.role || 'member'}</div>
          <div className="dashboard-badge muted-badge">الحالة: {user?.status || 'active'}</div>
        </div>
      </div>

      <div className="dashboard-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className={`stat-card stat-${stat.accent}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? <p className="success-text">{success}</p> : null}
      {loading ? <div className="loading">جارٍ تحميل لوحة التحكم...</div> : null}

      {!loading && activeTab === 'overview' ? (
        <div className="dashboard-overview-wrapper">
          <div className="dashboard-admin-links">
            <article className="detail-card admin-link-card">
              <div>
                <h3>إعدادات الصفحة الرئيسية</h3>
                <p>عدّل عنوان الـ hero والأزرار والإحصائيات الظاهرة للزوار.</p>
              </div>
              <button className="btn-primary" type="button" onClick={() => setActiveTab('home')}>
                فتح الإعدادات
              </button>
            </article>

            <article className="detail-card admin-link-card">
              <div>
                <h3>إعدادات الـ Footer</h3>
                <p>حدّث الروابط، خدمة العملاء، النبذة المختصرة وأيقونات التواصل.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => setActiveTab('footer')}>
                فتح الإعدادات
              </button>
            </article>
          </div>

          <div className="dashboard-overview-grid">
          <div className="detail-card insight-card">
            <h3>آخر المنتجات</h3>
            {products.slice(0, 4).map((product) => (
              <div className="overview-row" key={product._id}>
                <span>{product.name}</span>
                <strong>{product.quantity} متوفر</strong>
              </div>
            ))}
          </div>
          <div className="detail-card insight-card">
            <h3>آخر المستخدمين</h3>
            {users.slice(0, 4).map((entry) => (
              <div className="overview-row" key={entry.id}>
                <span>{entry.name}</span>
                <strong>{entry.role} / {entry.status}</strong>
              </div>
            ))}
          </div>
          <div className="detail-card insight-card">
            <h3>الحجوزات الأخيرة</h3>
            {bookings.slice(0, 4).map((booking) => (
              <div className="overview-row" key={booking.id}>
                <span>{booking.product.name}</span>
                <strong>{booking.status}</strong>
              </div>
            ))}
          </div>
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'products' ? (
        <div className="dashboard-layout">
          <form className="dashboard-form detail-card" onSubmit={onSubmit}>
            <h3>{editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
            <label>اسم المنتج</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label>الوصف</label>
            <textarea className="input textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <label>الفئة</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="device">أجهزة</option>
              <option value="costume">ملابس تنكرية</option>
              <option value="service">خدمات</option>
            </select>
            <label>المدينة</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            <div className="dashboard-grid-2">
              <div>
                <label>السعر اليومي</label>
                <input className="input" type="number" min="0" step="1" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })} required />
              </div>
              <div>
                <label>الكمية</label>
                <input className="input" type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
              </div>
            </div>
            <div className="dashboard-grid-2">
              <div>
                <label>التقييم</label>
                <input className="input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div>
                <label>رابط الصورة</label>
                <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
            </div>
            <div className="dashboard-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
              {editingId ? <button className="btn-light" type="button" onClick={resetForm}>إلغاء التعديل</button> : null}
            </div>
          </form>

          <div className="dashboard-list section">
            <h3>كل المنتجات</h3>
            {products.map((product) => (
              <article key={product._id} className="product-card admin-product-card">
                <img src={product.images?.[0]?.url} alt={product.name} className="product-image" />
                <div className="product-content">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="admin-meta">
                    <span>{product.category}</span>
                    <span>{product.city}</span>
                    <span>{product.pricePerDay} ريال/يوم</span>
                    <span>الكمية: {product.quantity}</span>
                  </div>
                  <div className="dashboard-actions">
                    <button className="btn-secondary" type="button" onClick={() => onEdit(product)}>تعديل</button>
                    <button className="btn-danger" type="button" onClick={() => onDelete(product._id)}>حذف</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'users' ? (
        <div className="admin-table detail-card">
          <div className="table-head">
            <h3>إدارة المستخدمين</h3>
            <p>يمكنك تعديل الدور أو إيقاف الحسابات غير المرغوبة.</p>
          </div>
          {users.map((entry) => (
            <div key={entry.id} className="table-row">
              <div>
                <strong>{entry.name}</strong>
                <p>{entry.email}</p>
              </div>
              <div className="table-controls">
                <select className="input table-input" value={entry.role} onChange={(e) => updateUser(entry.id, { role: e.target.value, status: entry.status })}>
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
                <select className="input table-input" value={entry.status} onChange={(e) => updateUser(entry.id, { role: entry.role, status: e.target.value })}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && activeTab === 'bookings' ? (
        <div className="admin-table detail-card">
          <div className="table-head">
            <h3>إدارة الحجوزات</h3>
            <p>راجع الطلبات وغير حالتها مباشرة من لوحة الإدارة.</p>
          </div>
          {bookings.length === 0 ? <p className="muted">لا توجد حجوزات بعد.</p> : null}
          {bookings.map((booking) => (
            <div key={booking.id} className="table-row booking-row">
              <div>
                <strong>{booking.product.name}</strong>
                <p>{booking.user.name} - {booking.user.email}</p>
                <p>{booking.startDate} إلى {booking.endDate}</p>
              </div>
              <div className="table-controls">
                <span className="inventory-chip">الكمية: {booking.quantity}</span>
                <span className="inventory-chip">الإجمالي: {booking.totalPrice} ريال</span>
                <select className="input table-input" value={booking.status} onChange={(e) => updateBooking(booking.id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && activeTab === 'home' ? (
        <form className="detail-card footer-admin-form" onSubmit={saveHomeSettings}>
          <div className="table-head">
            <h3>إعدادات الصفحة الرئيسية</h3>
            <p>عدّل نصوص الـ hero والأزرار والإحصائيات الظاهرة في أعلى الصفحة الرئيسية.</p>
          </div>

          <label>العنوان الصغير أعلى الـ Hero</label>
          <input
            className="input"
            value={homeSettingsForm.heroKicker}
            onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, heroKicker: e.target.value })}
            required
          />

          <label>العنوان الرئيسي</label>
          <input
            className="input"
            value={homeSettingsForm.heroTitle}
            onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, heroTitle: e.target.value })}
            required
          />

          <label>النص الفرعي</label>
          <textarea
            className="input textarea"
            value={homeSettingsForm.heroSubtitle}
            onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, heroSubtitle: e.target.value })}
            required
          />

          <div className="dashboard-grid-2">
            <div>
              <label>نص الزر الأساسي</label>
              <input
                className="input"
                value={homeSettingsForm.primaryButtonText}
                onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, primaryButtonText: e.target.value })}
                required
              />
            </div>
            <div>
              <label>رابط الزر الأساسي</label>
              <input
                className="input"
                value={homeSettingsForm.primaryButtonUrl}
                onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, primaryButtonUrl: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="dashboard-grid-2">
            <div>
              <label>نص الزر الثانوي</label>
              <input
                className="input"
                value={homeSettingsForm.secondaryButtonText}
                onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, secondaryButtonText: e.target.value })}
                required
              />
            </div>
            <div>
              <label>رابط الزر الثانوي</label>
              <input
                className="input"
                value={homeSettingsForm.secondaryButtonUrl}
                onChange={(e) => setHomeSettingsForm({ ...homeSettingsForm, secondaryButtonUrl: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="footer-editor-section">
            <div className="footer-editor-head">
              <h4>الإحصائيات</h4>
              <button className="btn-light" type="button" onClick={addHomeStat}>إضافة إحصائية</button>
            </div>

            {homeSettingsForm.stats.length === 0 ? <p className="muted">لا توجد إحصائيات مضافة بعد.</p> : null}

            {homeSettingsForm.stats.map((item, index) => (
              <div key={`stat-${index}`} className="footer-editor-row">
                <input
                  className="input"
                  value={item.value || ''}
                  onChange={(e) => updateHomeStat(index, 'value', e.target.value)}
                  placeholder="القيمة مثل 10K+"
                  required
                />
                <input
                  className="input"
                  value={item.label || ''}
                  onChange={(e) => updateHomeStat(index, 'label', e.target.value)}
                  placeholder="الوصف مثل Trusted Users"
                  required
                />
                <button className="btn-danger" type="button" onClick={() => removeHomeStat(index)}>حذف</button>
              </div>
            ))}
          </div>

          <div className="dashboard-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ إعدادات الرئيسية'}
            </button>
          </div>
        </form>
      ) : null}

      {!loading && activeTab === 'footer' ? (
        <form className="detail-card footer-admin-form" onSubmit={saveFooter}>
          <div className="table-head">
            <h3>إدارة الـ Footer</h3>
            <p>يمكنك تعديل النبذة وروابط الأقسام وروابط التواصل والحقوق من هنا.</p>
          </div>

          <label>نبذة قصيرة عن Rent It</label>
          <textarea
            className="input textarea"
            value={footerForm.aboutText}
            onChange={(e) => setFooterForm({ ...footerForm, aboutText: e.target.value })}
            required
          />

          <FooterEditorSection
            title="روابط تهمك"
            items={footerForm.usefulLinks}
            labelKey="label"
            labelPlaceholder="اسم الرابط"
            onAdd={() => addFooterItem('usefulLinks', { label: '', url: '' })}
            onChange={(index, field, value) => updateFooterItem('usefulLinks', index, field, value)}
            onRemove={(index) => removeFooterItem('usefulLinks', index)}
          />

          <FooterEditorSection
            title="خدمة العملاء"
            items={footerForm.customerServiceLinks}
            labelKey="label"
            labelPlaceholder="اسم الخدمة"
            onAdd={() => addFooterItem('customerServiceLinks', { label: '', url: '' })}
            onChange={(index, field, value) => updateFooterItem('customerServiceLinks', index, field, value)}
            onRemove={(index) => removeFooterItem('customerServiceLinks', index)}
          />

          <FooterEditorSection
            title="أيقونات التواصل"
            items={footerForm.socialLinks}
            labelKey="platform"
            labelPlaceholder="اسم المنصة"
            onAdd={() => addFooterItem('socialLinks', { platform: '', url: '' })}
            onChange={(index, field, value) => updateFooterItem('socialLinks', index, field, value)}
            onRemove={(index) => removeFooterItem('socialLinks', index)}
          />

          <label>نص الحقوق</label>
          <input
            className="input"
            value={footerForm.copyrightText}
            onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
            required
          />

          <div className="dashboard-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'جارٍ الحفظ...' : 'حفظ إعدادات الـ Footer'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

function normalizeFooterForm(footer) {
  return {
    aboutText: footer?.aboutText || '',
    usefulLinks: Array.isArray(footer?.usefulLinks) ? footer.usefulLinks : [],
    customerServiceLinks: Array.isArray(footer?.customerServiceLinks) ? footer.customerServiceLinks : [],
    socialLinks: Array.isArray(footer?.socialLinks) ? footer.socialLinks : [],
    copyrightText: footer?.copyrightText || '',
  };
}

function normalizeHomeSettingsForm(homeSettings) {
  return {
    heroKicker: homeSettings?.heroKicker || '',
    heroTitle: homeSettings?.heroTitle || '',
    heroSubtitle: homeSettings?.heroSubtitle || '',
    primaryButtonText: homeSettings?.primaryButtonText || '',
    primaryButtonUrl: homeSettings?.primaryButtonUrl || '',
    secondaryButtonText: homeSettings?.secondaryButtonText || '',
    secondaryButtonUrl: homeSettings?.secondaryButtonUrl || '',
    stats: Array.isArray(homeSettings?.stats) ? homeSettings.stats : [],
  };
}

function FooterEditorSection({
  title,
  items,
  labelKey,
  labelPlaceholder,
  onAdd,
  onChange,
  onRemove,
}) {
  return (
    <div className="footer-editor-section">
      <div className="footer-editor-head">
        <h4>{title}</h4>
        <button className="btn-light" type="button" onClick={onAdd}>إضافة</button>
      </div>

      {items.length === 0 ? <p className="muted">لا توجد عناصر مضافة بعد.</p> : null}

      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="footer-editor-row">
          <input
            className="input"
            value={item[labelKey] || ''}
            onChange={(e) => onChange(index, labelKey, e.target.value)}
            placeholder={labelPlaceholder}
            required
          />
          <input
            className="input"
            value={item.url || ''}
            onChange={(e) => onChange(index, 'url', e.target.value)}
            placeholder="الرابط"
            required
          />
          <button className="btn-danger" type="button" onClick={() => onRemove(index)}>حذف</button>
        </div>
      ))}
    </div>
  );
}
