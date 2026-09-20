/* ═══════ Notifications + toasts ═══════
   Port of notify()/renderNotifBadge()/renderNotifList()/toast() from the
   legacy script.js — max 20 entries, unread badge, auto-dismissing toasts. */
import { useCallback, useRef, useState } from "react";

const MAX_NOTIFICATIONS = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const pushToast = useCallback((type, msg) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, msg }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type, title, message, file) => {
      setNotifications((prev) =>
        [
          {
            id: Date.now() + Math.random(),
            type,
            title,
            message,
            file,
            read: false,
          },
          ...prev,
        ].slice(0, MAX_NOTIFICATIONS),
      );
      pushToast(type, title);
    },
    [pushToast],
  );

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const markNotificationsRead = useCallback((ids) => {
    const idSet = new Set(ids);
    setNotifications((prev) =>
      prev.map((n) => (idSet.has(n.id) ? { ...n, read: true } : n)),
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    toasts,
    unreadCount,
    notify,
    pushToast,
    removeToast,
    clearNotifications,
    markNotificationsRead,
  };
}
