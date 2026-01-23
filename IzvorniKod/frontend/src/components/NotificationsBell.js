import React, { useMemo } from "react";
import { Badge, Button, Dropdown, List, Space, Spin, Typography } from "antd";
import { FiBell, FiCheckCircle } from "react-icons/fi";

import { useNotifications } from "../context/NotificationContext";
import "../styles/student.css"; 
const { Text } = Typography;

function timeAgo(iso) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "upravo sad";
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h`;
    const days = Math.floor(h / 24);
    return `${days} d`;
  } catch {
    return "";
  }
}

export default function NotificationsBell() {
  const { notifications, unreadCount, isNotifLoading, markRead, markAllRead } = useNotifications();

 const items = useMemo(
  () => notifications.filter(n => !n.read && !n.readAt).slice(0, 8),
  [notifications]
);


  const overlay = (
    <div style={{ width: 360, maxWidth: "90vw" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "#fff",
        }}
      >
        <Space size={8}>
          <Text strong>Obavijesti</Text>
          {isNotifLoading ? <Spin size="small" /> : null}
        </Space>

        <Button
          size="small"
          icon={<FiCheckCircle />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            markAllRead();
          }}
        >
          Označi kao pročitano
        </Button>
      </div>

      <div style={{ background: "#fff" }}>
        <List
          size="small"
          dataSource={items}
          locale={{ emptyText: "Nema obavijesti" }}
          renderItem={(n) => {
            const isRead = Boolean(n.read || n.readAt);
            return (
              <List.Item
                style={{
                  cursor: "pointer",
                  opacity: isRead ? 0.7 : 1,
                  background: isRead ? "transparent" : "rgba(24,144,255,0.06)",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  markRead(n.id);
                }}
              >
                <List.Item.Meta
                  title={
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <span>{n.title || "Obavijest"}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {timeAgo(n.createdAt)}
                      </Text>
                    </Space>
                  }
                  description={<span>{n.body || n.message || ""}</span>}
                />
              </List.Item>
            );
          }}
        />
      </div>
    </div>
  );

  return (
  <Dropdown
  dropdownRender={() => (
    <div className="notifications-dropdown">
      {overlay}
    </div>
  )}
  trigger={["click"]}
  placement="bottomRight"
>

    <Button
      type="text"
      aria-label="Obavijesti"
      style={{ color: "#fff" }}
    >
      <Badge count={unreadCount} size="small" overflowCount={99}>
  <div className="bell-circle">
    <FiBell className="bell-icon" />
  </div>
</Badge>

    </Button>
  </Dropdown>
);

}