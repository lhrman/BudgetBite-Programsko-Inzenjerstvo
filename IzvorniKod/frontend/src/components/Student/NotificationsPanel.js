import React from "react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationsPanel() {
  const { notifications, markAllRead } = useNotifications();

  return (
    <div className="form-section">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className="form-section-title">Notifikacije</h2>
        <button className="recipes-btn" onClick={markAllRead}>
          Označi sve pročitano
        </button>
      </div>

      {notifications.length === 0 && (
        <div className="recipes-empty">Nema notifikacija</div>
      )}

      {notifications.map(n => (
        <div
          key={n.id}
          className={`notif-item ${n.read ? "read" : "unread"}`}
        >
          <div className="notif-title">{n.title}</div>
          <div className="notif-body">{n.body}</div>
          <div className="notif-time">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
