import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

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
    persist(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    persist(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllRead, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
