import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { notificationsService } from '../services/api';
import { sendAppNotification } from '../utils/mobileNative';

function NotificationMenu() {
  const { token } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const seenIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      initializedRef.current = false;
      seenIdsRef.current = new Set();
      return undefined;
    }

    const pollNotifications = async () => {
      try {
        const response = await notificationsService.list();
        const notifications = response.data?.notifications || [];
        setItems(notifications);
        setUnreadCount(response.data?.unreadCount || 0);

        if (!initializedRef.current) {
          notifications.forEach((item) => seenIdsRef.current.add(item.id));
          initializedRef.current = true;
          return;
        }

        notifications
          .filter((item) => !seenIdsRef.current.has(item.id))
          .forEach((item) => {
            seenIdsRef.current.add(item.id);
            toast(item.title, { duration: 4500 });
            sendAppNotification({ key: `navbar-notification-${item.id}`, title: item.title, body: item.body });
          });
      } catch {
        return null;
      }

      return null;
    };

    pollNotifications();
    const intervalId = window.setInterval(pollNotifications, 8000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && unreadCount > 0) {
      await notificationsService.markAllRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="notification-wrap">
      <button className="notification-button" onClick={toggleOpen} type="button">
        {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
        {unreadCount ? <span className="notification-count">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notification-panel">
          {!items.length ? (
            <p className="muted">{lang === 'ar' ? 'لا توجد إشعارات حالياً.' : 'No notifications right now.'}</p>
          ) : (
            items.map((item) => (
              <article className={`notification-item ${item.isRead ? 'read' : 'unread'}`} key={item.id}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const dashboardBasePath =
    user?.role === 'operations_manager'
      ? '/operations-manager'
      : user?.role === 'customer_service'
        ? '/customer-service'
        : '/login';
  const roleLabel =
    user?.role === 'operations_manager'
      ? lang === 'ar'
        ? 'مدير العمليات'
        : 'Operations manager'
      : user?.role === 'customer_service'
        ? lang === 'ar'
          ? 'خدمة العملاء'
          : 'Customer service'
        : '';

  return (
    <header className="nav-wrap" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <nav className="nav">
        <Link className="brand" to="/">
          <span className="brand-mark">TP</span>
          <span>{t('brand')}</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/">{t('home')}</NavLink>
          {token ? <NavLink to={dashboardBasePath}>{t('dashboard')}</NavLink> : null}
          {token ? <NavLink to={`${dashboardBasePath}/daily`}>{lang === 'ar' ? 'المهام اليومية' : 'Daily tasks'}</NavLink> : null}
          {token ? <NavLink to={`${dashboardBasePath}/weekly`}>{t('weeklyTasks')}</NavLink> : null}
          {token ? <NavLink to={`${dashboardBasePath}/monthly`}>{t('monthlyTasks')}</NavLink> : null}
          {token ? <NavLink to={`${dashboardBasePath}/operations-date`}>{t('operationsDay')}</NavLink> : null}
        </div>

        <div className="nav-actions">
          <button className="btn-language" onClick={toggleLang} type="button">
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <NotificationMenu />
          {!token ? (
            <Link className="btn-primary" to="/login">
              {t('login')}
            </Link>
          ) : (
            <>
              <span className="user-chip">{roleLabel || user?.name}</span>
              <button className="btn-danger" onClick={logout} type="button">
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
