import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/api';

function NotificationMenu() {
  const { token } = useAuth();
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

        const freshItems = notifications.filter((item) => !seenIdsRef.current.has(item.id));
        freshItems.forEach((item) => {
          seenIdsRef.current.add(item.id);
          toast(item.title, { duration: 4500 });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(item.title, { body: item.body });
          }
        });
      } catch {
        return null;
      }

      return null;
    };

    pollNotifications();
    const intervalId = window.setInterval(pollNotifications, 10000);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => null);
    }

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
        Notifications
        {unreadCount ? <span className="notification-count">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notification-panel">
          {!items.length ? (
            <p className="muted">No notifications right now.</p>
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
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';

  return (
    <header className="nav-wrap" dir="ltr">
      <nav className="nav">
        <Link className="brand" to="/">
          <span className="brand-mark">TP</span>
          <span>Tarkeeb Pro</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/">Home</NavLink>
          {isAdmin ? <NavLink to="/dashboard">Admin Dashboard</NavLink> : null}
          {isTechnician ? <NavLink to="/tasks">Technician Tasks</NavLink> : null}
        </div>

        <div className="nav-actions">
          <NotificationMenu />
          {!token ? (
            <>
              <Link className="btn-light" to="/login">Sign in</Link>
              <Link className="btn-secondary" to="/register">Demo accounts</Link>
            </>
          ) : (
            <>
              <span className="user-chip">{isAdmin ? 'Administrator' : user?.name}</span>
              <button className="btn-danger" onClick={logout} type="button">Sign out</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
