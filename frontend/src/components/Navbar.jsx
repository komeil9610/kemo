import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { notificationsService } from '../services/api';
import { sendAppNotification } from '../utils/mobileNative';
import { getWorkspaceBasePath, getWorkspaceRoleLabel, getWorkspaceRolesForSwitcher } from '../utils/workspaceRoles';

function NotificationMenu() {
  const { token } = useAuth();
  const { lang } = useLang();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

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
    <div className="notification-wrap" ref={panelRef}>
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
  const { token, user, logout, setActiveRole } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const workspaceRoles = Array.isArray(user?.workspaceRoles) ? user.workspaceRoles : [];
  const dashboardBasePath = getWorkspaceBasePath(user?.role);
  const roleLabel = getWorkspaceRoleLabel(user?.role, lang);
  const workspaceButtons = getWorkspaceRolesForSwitcher(workspaceRoles);

  const switchWorkspace = (nextRole) => {
    setActiveRole(nextRole);
    navigate(getWorkspaceBasePath(nextRole));
  };

  return (
    <header className="nav-wrap" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <nav className="nav">
        <Link className="brand" to="/">
          <span className="brand-mark">TP</span>
          <span>{t('brand')}</span>
        </Link>

        <div className="nav-links nav-links-minimal">
          {token ? (
            <Link className="workspace-link-pill" to={dashboardBasePath}>
              {lang === 'ar' ? 'لوحة العمل' : 'Workspace'}
            </Link>
          ) : (
            <Link to="/">{t('home')}</Link>
          )}
        </div>

        <div className="nav-actions">
          <button aria-label={lang === 'ar' ? 'التحويل إلى الإنجليزية' : 'التحويل إلى العربية'} className="btn-language btn-language-compact" onClick={toggleLang} type="button">
            {lang === 'ar' ? '🌐 EN' : '🌐 AR'}
          </button>
          <NotificationMenu />
          {!token ? (
            <Link className="btn-primary" to="/login">
              {t('login')}
            </Link>
          ) : (
            <>
              {workspaceButtons.length > 1
                ? workspaceButtons.map((role) => (
                    <button
                      key={role}
                      className={user?.role === role ? 'btn-primary' : 'btn-light'}
                      onClick={() => switchWorkspace(role)}
                      type="button"
                    >
                      {getWorkspaceRoleLabel(role, lang)}
                    </button>
                  ))
                : null}
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
