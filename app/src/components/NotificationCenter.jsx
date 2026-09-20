import { useEffect } from "react";
import { useApp } from "../state/AppContext.jsx";

/* ═══════ Notification center ═══════
   Legacy buildNotifList()/renderNotifBadge() + the delegated click handler:
   clicking an item marks it read, closes the center and opens its file.
   Clicking anywhere outside the center closes it (document click). */
export default function NotificationCenter() {
  const {
    notifications,
    overlays,
    closeOverlay,
    markNotificationsRead,
    clearNotifications,
    openFile,
  } = useApp();

  /* Close when clicking outside — same behaviour as the legacy listener. */
  useEffect(() => {
    if (!overlays.notif) return;
    const onDocClick = (e) => {
      if (!e.target.closest("#notif-center") && !e.target.closest("#btn-bell")) {
        closeOverlay("notif");
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [closeOverlay, overlays.notif]);

  const onItemClick = (n) => {
    markNotificationsRead([n.id]);
    if (n.file) {
      closeOverlay("notif");
      openFile(n.file);
    }
  };

  return (
    <div
      className={`notif-center ${overlays.notif ? "open" : ""}`}
      id="notif-center"
    >
      <div className="notif-head">
        <span>Notifications</span>
        <button id="notif-clear" onClick={clearNotifications}>
          Clear All
        </button>
      </div>
      <ul className="notif-list" id="notif-list">
        {notifications.length === 0 ? (
          <li className="notif-empty">No notifications yet 🎉</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              className={`notif-item ${n.read ? "read" : ""}`}
              data-id={n.id}
              data-nfile={n.file || undefined}
              onClick={() => onItemClick(n)}
            >
              <span className={`notif-icon ${n.type}`}>
                {n.type === "success" ? "✓" : n.type === "error" ? "✕" : "ℹ"}
              </span>
              <div className="notif-txt">
                <b>{n.title}</b>
                <span>{n.message}</span>
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="notif-foot">Click a notification to open its file</div>
    </div>
  );
}
