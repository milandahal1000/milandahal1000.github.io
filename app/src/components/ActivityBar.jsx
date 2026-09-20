import { useState } from "react";
import { useApp } from "../state/AppContext.jsx";
import { D, EMAIL, FILES } from "../lib/constants.js";

/* ═══════ Activity bar ═══════
   Legacy .activity-bar: the buttons print terminal messages (explorer is
   always "active"), Search opens the search overlay, Settings opens the
   settings modal — exactly like the old delegated handler. */
export default function ActivityBar() {
  const { openOverlay, terminal } = useApp();
  const [active, setActive] = useState("explorer");

  const act = (id) => {
    setActive(id);
    if (id === "search") {
      openOverlay("search");
      return;
    }
    if (id === "settings") {
      openOverlay("settings");
      return;
    }
    const msg = {
      explorer: "Explorer is already open on the left →",
      git: "branch: main* · everything up to date ✓",
      debug: "No bugs found yet. Debugging life... 🐛",
      ext: "Recommended: coffee.js, motivation@latest",
      account: `Signed in as ${D.profile.name} <${EMAIL}>`,
    }[id];
    if (msg) terminal.print(msg, "info");
  };

  return (
    <nav className="activity-bar">
      <button
        className={`act-btn ${active === "explorer" ? "active" : ""}`}
        title="Explorer"
        data-act="explorer"
        onClick={() => act("explorer")}
      >
        <svg viewBox="0 0 16 16" width="22" height="22">
          <path
            fill="currentColor"
            d="M9.5 1H3.5L2 2.5v11L3.5 15h9l1.5-1.5V5L9.5 1zm0 1.6L12.4 5H9.5V2.6zM13 13.5l-.5.5h-9l-.5-.5v-11l.5-.5H8v4h5v7.5z"
          />
        </svg>
        <span className="badge" id="explorer-badge">
          {FILES.length}
        </span>
      </button>

      <button
        className={`act-btn ${active === "search" ? "active" : ""}`}
        title="Search"
        data-act="search"
        onClick={() => act("search")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <circle cx="6.5" cy="6.5" r="4.2" />
          <path d="M9.7 9.7l4 4" />
        </svg>
      </button>

      <button
        className={`act-btn ${active === "git" ? "active" : ""}`}
        title="Source Control"
        data-act="git"
        onClick={() => act("git")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <circle cx="4" cy="3.5" r="1.7" />
          <circle cx="4" cy="12.5" r="1.7" />
          <circle cx="12" cy="7" r="1.7" />
          <path d="M4 5.2v5.6M12 8.7c0 2-2.5 2.3-6.3 2.5" />
        </svg>
      </button>

      <button
        className={`act-btn ${active === "debug" ? "active" : ""}`}
        title="Run and Debug"
        data-act="debug"
        onClick={() => act("debug")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        >
          <path d="M4.5 2.5l8 5.5-8 5.5z" />
        </svg>
      </button>

      <button
        className={`act-btn ${active === "ext" ? "active" : ""}`}
        title="Extensions"
        data-act="ext"
        onClick={() => act("ext")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <rect x="2" y="2" width="5" height="5" />
          <rect x="9" y="2" width="5" height="5" />
          <rect x="2" y="9" width="5" height="5" />
          <path d="M11.5 9v5M9 11.5h5" />
        </svg>
      </button>

      <div className="act-spacer"></div>

      <button
        className={`act-btn ${active === "account" ? "active" : ""}`}
        title="Account"
        data-act="account"
        onClick={() => act("account")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <circle cx="8" cy="5.5" r="2.7" />
          <path d="M2.8 13.5c.8-2.6 2.8-3.8 5.2-3.8s4.4 1.2 5.2 3.8" />
        </svg>
      </button>

      <button
        className={`act-btn ${active === "settings" ? "active" : ""}`}
        title="Settings"
        data-act="settings"
        onClick={() => act("settings")}
      >
        <svg
          viewBox="0 0 16 16"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
        </svg>
      </button>
    </nav>
  );
}
