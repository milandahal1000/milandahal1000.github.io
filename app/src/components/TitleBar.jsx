import { useApp } from "../state/AppContext.jsx";

/* ═══════ Title bar ═══════
   Legacy <header class="titlebar">: VS Code logo + menu, centered title and
   the theme / notification / window buttons. */
export default function TitleBar() {
  const { settings, toggleDark, unreadCount, toggleOverlay, email, terminal } =
    useApp();
  const dark = settings.darkMode !== false;

  return (
    <header className="titlebar">
      <div className="tb-left">
        <svg className="vscode-logo" viewBox="0 0 24 24" width="17" height="17">
          <path
            fill="#4fc1ff"
            d="M17.9 2.1 9.7 9.9 5 6.4 3 7.4l4.6 4.6L3 16.6l2 1 4.7-3.5 8.2 7.8 3.1-1.5V3.6L17.9 2.1zm.6 5.3v9.2l-5.6-4.6 5.6-4.6z"
          />
        </svg>
        <span className="tb-menu">
          <span>File</span>
          <span>Edit</span>
          <span>Selection</span>
          <span>View</span>
          <span>Go</span>
          <span>Run</span>
          <span
            className="tb-menu-item tb-menu-term"
            title="Toggle terminal panel (Ctrl+`)"
            onClick={() => terminal.toggle()}
          >
            Terminal
          </span>
          <span>Help</span>
        </span>
      </div>

      <div className="tb-center" id="tb-title" title={email}>
        Milan Dahal — Portfolio
      </div>

      <div className="tb-right">
        <button
          className="title-btn"
          id="btn-theme"
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggleDark}
        >
          <svg
            className="icon-sun"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
          </svg>
          <svg
            className="icon-moon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <path d="M13 8.5A5.5 5.5 0 017.5 3a.5.5 0 00-.6-.6A6 6 0 1013.6 9.1a.5.5 0 00-.6-.6z" />
          </svg>
        </button>

        <button
          className="title-btn"
          id="btn-bell"
          title="Notifications"
          onClick={(e) => {
            e.stopPropagation();
            toggleOverlay("notif");
          }}
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          >
            <path d="M3 11l1-1V7a4 4 0 018 0v3l1 1H3zm3 2a2 2 0 004 0" />
          </svg>
          <span
            className="notif-badge"
            id="notif-badge"
            style={{ display: unreadCount ? "block" : "none" }}
          >
            {unreadCount > 0 ? unreadCount : ""}
          </span>
        </button>

        <span className="win-btn">—</span>
        <span className="win-btn">▢</span>
        <span className="win-btn close">✕</span>
      </div>
    </header>
  );
}
