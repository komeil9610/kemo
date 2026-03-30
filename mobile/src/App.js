import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import axios from 'axios';

const API_URL = 'https://tarkeeb-pro-frontend.bobkumeel.workers.dev/api';
const ORDER_STATUS = {
  pending: { ar: 'بانتظار التنسيق', color: '#d96b27', tint: '#fff4ec' },
  scheduled: { ar: 'تمت الجدولة', color: '#117864', tint: '#edf9f5' },
  in_transit: { ar: 'في الطريق', color: '#1d4ed8', tint: '#eef4ff' },
  completed: { ar: 'مكتمل', color: '#047857', tint: '#ecfdf5' },
  suspended: { ar: 'معلق', color: '#b91c1c', tint: '#fef2f2' },
  canceled: { ar: 'ملغي', color: '#6b7280', tint: '#f3f4f6' },
};

const tabsByRole = {
  technician: [
    { id: 'home', label: 'الرئيسية' },
    { id: 'tasks', label: 'مهامي' },
    { id: 'account', label: 'حسابي' },
  ],
  customer_service: [
    { id: 'home', label: 'الرئيسية' },
    { id: 'orders', label: 'الطلبات' },
    { id: 'account', label: 'حسابي' },
  ],
  operations_manager: [
    { id: 'home', label: 'الرئيسية' },
    { id: 'operations', label: 'التشغيل' },
    { id: 'account', label: 'حسابي' },
  ],
};

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const todayString = () => new Date().toISOString().slice(0, 10);

const formatOrderNumber = (value) => String(value || '').replace(/^ORD-/, '');

const formatDate = (value) => {
  if (!value) {
    return 'غير محدد';
  }

  try {
    return new Intl.DateTimeFormat('ar-SA', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
};

const formatTime = (value) => (value ? value : 'غير محدد');

const resolveOrderStatus = (status) => ORDER_STATUS[status] || ORDER_STATUS.pending;

const summarizeOrders = (orders = []) => ({
  total: orders.length,
  active: orders.filter((order) => ['scheduled', 'in_transit'].includes(order.status)).length,
  completed: orders.filter((order) => order.status === 'completed').length,
  alerts: orders.filter((order) => ['pending', 'suspended'].includes(order.status)).length,
});

const groupOrdersByCity = (orders = []) =>
  orders.reduce((groups, order) => {
    const key = order.city || 'غير محدد';
    groups[key] = (groups[key] || 0) + 1;
    return groups;
  }, {});

const Section = ({ title, subtitle, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);

const SummaryCards = ({ summary }) => (
  <View style={styles.summaryGrid}>
    {[
      { label: 'الإجمالي', value: summary.total, tint: '#fff4ec' },
      { label: 'نشطة', value: summary.active, tint: '#edf9f5' },
      { label: 'مكتملة', value: summary.completed, tint: '#ecfdf5' },
      { label: 'تحتاج متابعة', value: summary.alerts, tint: '#fef2f2' },
    ].map((item) => (
      <View key={item.label} style={[styles.summaryCard, { backgroundColor: item.tint }]}>
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <Text style={styles.summaryValue}>{item.value}</Text>
      </View>
    ))}
  </View>
);

const OrderCard = ({ order }) => {
  const status = resolveOrderStatus(order.status);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardTop}>
        <View style={styles.orderCardTitleBlock}>
          <Text style={styles.orderEyebrow}>طلب #{formatOrderNumber(order.id)}</Text>
          <Text style={styles.orderCustomer}>{order.customerName || 'بدون اسم'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.tint }]}>
          <Text style={[styles.statusPillText, { color: status.color }]}>{status.ar}</Text>
        </View>
      </View>
      <View style={styles.metaGrid}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>المنطقة</Text>
          <Text style={styles.metaValue}>{[order.district, order.city].filter(Boolean).join(' - ') || 'غير محدد'}</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>الموعد</Text>
          <Text style={styles.metaValue}>{formatDate(order.scheduledDate)}</Text>
          <Text style={styles.metaHint}>{formatTime(order.scheduledTime)}</Text>
        </View>
      </View>
      <Text style={styles.orderNotes}>{order.workType || order.serviceSummary || order.notes || 'بدون وصف إضافي'}</Text>
      <View style={styles.actionRow}>
        <Pressable onPress={() => Linking.openURL(`tel:${order.phone || ''}`)} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>اتصال</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(order.mapLink || 'https://maps.google.com')} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>فتح الموقع</Text>
        </Pressable>
      </View>
    </View>
  );
};

function LoginScreen({ loading, error, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Tarkeeb Pro Mobile</Text>
          <Text style={styles.heroTitle}>تسجيل الدخول للتشغيل الميداني</Text>
          <Text style={styles.heroSubtitle}>
            واجهة جوال سريعة للفنيين وخدمة العملاء ومدير العمليات مع بطاقات كبيرة وشريط سفلي مناسب للمس.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>دخول الحساب الرسمي</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="البريد الإلكتروني"
            placeholderTextColor="#7b7a75"
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="كلمة المرور"
            placeholderTextColor="#7b7a75"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable disabled={loading} onPress={() => onSubmit(email, password)} style={styles.submitButton}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>دخول</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TechnicianHome({ user, orders, refreshing, onRefresh, variant = 'home' }) {
  const todayOrders = useMemo(() => {
    const today = todayString();
    return orders.filter((order) => (order.scheduledDate || '').slice(0, 10) === today || !order.scheduledDate);
  }, [orders]);
  const summary = summarizeOrders(todayOrders);
  const visibleOrders = variant === 'tasks' ? orders : todayOrders;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d96b27" />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>الفني الميداني</Text>
        <Text style={styles.heroTitle}>{variant === 'tasks' ? 'كل مهامي' : 'لوحة اليوم'}</Text>
        <Text style={styles.heroSubtitle}>
          {user.name || 'الفني'} - {variant === 'tasks' ? 'عرض شامل للمهام المسندة مع الوصول السريع للموقع والاتصال.' : 'تعرض مهام اليوم فقط مع إجراءات سريعة مناسبة للجوال.'}
        </Text>
      </View>
      <SummaryCards summary={summary} />
      <Section title={variant === 'tasks' ? 'المهام المسندة' : 'مهام اليوم'} subtitle="بطاقات كبيرة بلمسة واحدة للاتصال وفتح الموقع.">
        {visibleOrders.length ? visibleOrders.map((order) => <OrderCard key={order.id} order={order} />) : <Text style={styles.emptyText}>لا توجد مهام متاحة حالياً.</Text>}
      </Section>
    </ScrollView>
  );
}

function CustomerServiceHome({ orders, refreshing, onRefresh, variant = 'home' }) {
  const summary = summarizeOrders(orders);
  const visibleOrders = variant === 'orders' ? orders : orders.slice(0, 12);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d96b27" />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>خدمة العملاء</Text>
        <Text style={styles.heroTitle}>{variant === 'orders' ? 'كل الطلبات' : 'متابعة الطلبات'}</Text>
        <Text style={styles.heroSubtitle}>
          {variant === 'orders' ? 'قائمة تشغيل مختصرة للطلبات داخل تجربة جوال عملية وسريعة.' : 'عرض مختصر للطلبات مع فرز واضح للحالات والمدن داخل شاشة واحدة.'}
        </Text>
      </View>
      <SummaryCards summary={summary} />
      <Section title={variant === 'orders' ? 'الطلبات' : 'أحدث الطلبات'} subtitle="آخر الطلبات المضافة أو المحدثة.">
        {visibleOrders.map((order) => <OrderCard key={order.id} order={order} />)}
      </Section>
    </ScrollView>
  );
}

function OperationsHome({ orders, refreshing, onRefresh, variant = 'home' }) {
  const summary = summarizeOrders(orders);
  const regionGroups = groupOrdersByCity(orders);
  const visibleOrders = variant === 'operations' ? orders : orders.slice(0, 8);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#d96b27" />}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>مدير العمليات</Text>
        <Text style={styles.heroTitle}>{variant === 'operations' ? 'قائمة العمليات' : 'لوحة تشغيل متنقلة'}</Text>
        <Text style={styles.heroSubtitle}>
          {variant === 'operations' ? 'عرض تشغيلي أوسع للطلبات والمدن داخل شاشة جوال واحدة.' : 'متابعة الحمل التشغيلي حسب المدينة، والحالات الحرجة، وآخر الطلبات مباشرة من الجوال.'}
        </Text>
      </View>
      <SummaryCards summary={summary} />
      <Section title="توزيع المدن" subtitle="فرز سريع يساعد على مراجعة كثافة الطلبات ميدانياً.">
        <View style={styles.cityGrid}>
          {Object.entries(regionGroups).map(([city, count]) => (
            <View key={city} style={styles.cityCard}>
              <Text style={styles.cityName}>{city}</Text>
              <Text style={styles.cityCount}>{count}</Text>
            </View>
          ))}
        </View>
      </Section>
      <Section title={variant === 'operations' ? 'طلبات المناطق' : 'آخر الطلبات'} subtitle="طلبات جاهزة للمراجعة السريعة من الجوال.">
        {visibleOrders.map((order) => <OrderCard key={order.id} order={order} />)}
      </Section>
    </ScrollView>
  );
}

function AccountTab({ user, onLogout }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>الحساب</Text>
        <Text style={styles.heroTitle}>{user.name || 'المستخدم'}</Text>
        <Text style={styles.heroSubtitle}>{user.email}</Text>
      </View>
      <View style={styles.panel}>
        <View style={styles.accountRow}>
          <Text style={styles.metaLabel}>الدور</Text>
          <Text style={styles.metaValue}>{user.role === 'technician' ? 'فني' : user.role === 'operations_manager' ? 'مدير العمليات' : 'خدمة العملاء'}</Text>
        </View>
        <View style={styles.accountRow}>
          <Text style={styles.metaLabel}>معرّف الفني</Text>
          <Text style={styles.metaValue}>{user.technicianId || 'غير مرتبط'}</Text>
        </View>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(
    async (nextUser = user, nextToken = token) => {
      if (!nextUser || !nextToken) {
        return;
      }

      const headers = { Authorization: `Bearer ${nextToken}` };
      const request =
        nextUser.role === 'technician'
          ? client.get('/operations/technician/orders', {
              headers,
              params: { technicianId: nextUser.technicianId },
            })
          : client.get('/operations/dashboard', { headers });

      const response = await request;
      const nextOrders = nextUser.role === 'technician' ? response.data?.orders || [] : response.data?.orders || [];
      setOrders(Array.isArray(nextOrders) ? nextOrders : []);
    },
    [token, user]
  );

  const handleLogin = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError('');
      const response = await client.post('/auth/login', { email, password });
      const nextToken = response.data?.token || '';
      const nextUser = response.data?.user || null;
      if (!nextToken || !nextUser) {
        throw new Error('بيانات الدخول غير مكتملة');
      }
      setToken(nextToken);
      setUser(nextUser);
      setActiveTab('home');
      await fetchOrders(nextUser, nextToken);
    } catch (loginError) {
      setError(loginError?.response?.data?.message || loginError.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    fetchOrders();
  }, [fetchOrders, token, user]);

  const tabs = tabsByRole[user?.role] || [];

  if (!user || !token) {
    return <LoginScreen error={error} loading={loading} onSubmit={handleLogin} />;
  }

  const renderActiveTab = () => {
    if (activeTab === 'account') {
      return <AccountTab onLogout={() => { setOrders([]); setToken(''); setUser(null); setError(''); }} user={user} />;
    }

    if (user.role === 'technician') {
      return <TechnicianHome onRefresh={refresh} orders={orders} refreshing={refreshing} user={user} variant={activeTab} />;
    }

    if (user.role === 'customer_service') {
      return <CustomerServiceHome onRefresh={refresh} orders={orders} refreshing={refreshing} variant={activeTab} />;
    }

    return <OperationsHome onRefresh={refresh} orders={orders} refreshing={refreshing} variant={activeTab} />;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.appFrame}>
        {renderActiveTab()}
        <View style={styles.bottomTabs}>
          {tabs.map((tab) => (
            <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={[styles.tabButton, activeTab === tab.id ? styles.tabButtonActive : null]}>
              <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : null]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5efe6',
  },
  appFrame: {
    flex: 1,
  },
  loginScroll: {
    padding: 20,
    gap: 16,
  },
  content: {
    padding: 18,
    paddingBottom: 120,
    gap: 16,
  },
  heroCard: {
    gap: 8,
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#fffaf2',
    borderWidth: 1,
    borderColor: '#ebe1d2',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#117864',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5b5c58',
  },
  panel: {
    gap: 14,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebe1d2',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
  },
  input: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d5d3ce',
    backgroundColor: '#fbfaf8',
    textAlign: 'right',
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#d96b27',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    color: '#5b5c58',
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    minWidth: '47%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#efe7da',
    gap: 8,
  },
  summaryLabel: {
    color: '#5b5c58',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  orderCard: {
    gap: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebe1d2',
  },
  orderCardTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderCardTitleBlock: {
    flex: 1,
    gap: 4,
  },
  orderEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7b7a75',
  },
  orderCustomer: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  metaGrid: {
    flexDirection: 'row-reverse',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaCard: {
    flex: 1,
    minWidth: 140,
    gap: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fbfaf8',
  },
  metaLabel: {
    color: '#7b7a75',
    fontSize: 12,
    fontWeight: '800',
  },
  metaValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  metaHint: {
    color: '#5b5c58',
    fontSize: 13,
  },
  orderNotes: {
    color: '#374151',
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  primaryAction: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#117864',
  },
  primaryActionText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  secondaryAction: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#eef4ff',
  },
  secondaryActionText: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#5b5c58',
    backgroundColor: '#ffffff',
    borderRadius: 18,
  },
  cityGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
  },
  cityCard: {
    minWidth: '47%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebe1d2',
    gap: 8,
  },
  cityName: {
    color: '#374151',
    fontWeight: '700',
  },
  cityCount: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  accountRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  logoutButton: {
    minHeight: 54,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#111827',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  bottomTabs: {
    position: 'absolute',
    right: 14,
    left: 14,
    bottom: 14,
    flexDirection: 'row-reverse',
    gap: 10,
    padding: 10,
    borderRadius: 24,
    backgroundColor: '#fffaf2',
    borderWidth: 1,
    borderColor: '#ebe1d2',
  },
  tabButton: {
    minHeight: 58,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  tabButtonActive: {
    backgroundColor: '#d96b27',
  },
  tabLabel: {
    color: '#6b7280',
    fontWeight: '800',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
});
