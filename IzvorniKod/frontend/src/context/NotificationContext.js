import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

import { Api } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);



export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);
  const { user } = useAuth();

  // 1) Lokalni fallback (dok backend ne proradi ili za offline)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("in_app_notifications");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setNotifications(parsed);
      else localStorage.removeItem("in_app_notifications");
    } catch (e) {
      console.error("Bad in_app_notifications in localStorage:", e);
      localStorage.removeItem("in_app_notifications");
    }
  }, []);

  // 2) Server sync (ako postoji endpoint). Ako padne - ostaje lokalno.
  useEffect(() => {
    const sync = async () => {
      if (!user) return;
      setIsNotifLoading(true);
      try {
        const data = await Api.listNotifications(50);
        // očekujemo { notifications: [...] } ili [...]
        const list = Array.isArray(data) ? data : data?.notifications;
        if (Array.isArray(list)) {
          setNotifications(list);
          localStorage.setItem("in_app_notifications", JSON.stringify(list));
        }
      } catch (e) {
        // tiho - backend možda još nije implementiran
        // console.debug("Notifications sync skipped:", e?.message);
      } finally {
        setIsNotifLoading(false);
      }
    };
    sync();
  }, [user]);

  const persist = (next) => {
    setNotifications(next);
    localStorage.setItem("in_app_notifications", JSON.stringify(next));
  };

  const makeId = () =>
    (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const addNotification = (notif) => {
    const full = {
      id: makeId(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };

    const next = [full, ...notifications].slice(0, 100);
    persist(next);
  };

  const markAllRead = () => {
    persist(notifications.map(n => ({ ...n, read: true, readAt: n.readAt ?? new Date().toISOString() })));
    // pokušaj i na serveru (ako postoji)
    Api.markAllNotificationsRead?.().catch(() => {});
  };

  const markRead = (id) => {
    persist(notifications.map(n =>
      n.id === id ? { ...n, read: true, readAt: n.readAt ?? new Date().toISOString() } : n
    ));
    Api.markNotificationRead?.(id).catch(() => {});
  };

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read && !n.readAt).length,
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, isNotifLoading, unreadCount, addNotification, markAllRead, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
