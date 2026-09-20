import { useApp } from "../state/AppContext.jsx";
import { D, FILES } from "../lib/constants.js";

/* ═══════ Sidebar (Explorer) ═══════
   Legacy buildSidebar(): profile card (live GitHub avatar when available),
   MILAN_PORTFOLIO file tree, Outline and Timeline blocks. */
export default function Sidebar() {
  const { currentFile, goToFile, liveAvatar, sidebarRef, setSidebarHovered } =
    useApp();
  const { profile: P, about } = D;

  return (
    <aside
      className="sidebar"
      id="sidebar"
      ref={sidebarRef}
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
    >
      <div className="sb-title">Explorer</div>

      <div id="profile-card" className="profile-card">
        <div className="pc-avatar">
          {liveAvatar ? (
            <img
              src={liveAvatar}
              alt="GitHub avatar"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            P.avatarEmoji
          )}
        </div>
        <div className="pc-meta">
          <div className="pc-name">{P.name}</div>
          <div className="pc-role">{(about || {}).role || "Web Developer"}</div>
          <span
            className={`pc-status ${P.status === "Open to work" ? "green" : ""}`}
          >
            <i></i>
            {P.status}
          </span>
        </div>
      </div>

      <div className="sb-block">
        <div className="sb-head collapse">
          <span className="chev">▾</span> MILAN_PORTFOLIO
        </div>
        <ul className="file-tree" id="file-tree">
          {FILES.map((f) => (
            <li
              key={f.name}
              className={`file-item ${f.name === currentFile ? "active" : ""}`}
              data-file={f.name}
              onClick={() => goToFile(f.name)}
            >
              <span className={`dot ${f.icon}`}></span>
              {f.name}
            </li>
          ))}
        </ul>
        <div className="sb-subtree">
          <div className="tree-root">
            <span className="chev">▾</span>
            <span className="dot folder"></span>assets
          </div>
          <ul className="file-tree">
            <li className="file-item sub disabled">
              <span className="dot img"></span>avatar.png
            </li>
            <li className="file-item sub disabled">
              <span className="dot img"></span>project-shots/
            </li>
          </ul>
        </div>
      </div>

      <div className="sb-block">
        <div className="sb-head">Outline</div>
        <ul className="outline-list" id="outline">
          {FILES.map((f) => (
            <li
              key={f.name}
              className={`file-item ${f.name === currentFile ? "active" : ""}`}
              data-file={f.name}
              onClick={() => goToFile(f.name)}
            >
              <span className={`dot ${f.icon}`}></span>
              {f.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="sb-block">
        <div className="sb-head">Timeline</div>
        <ul className="outline-list dim" id="timeline">
          {(D.commits || []).map((c) => (
            <li key={c.msg} title={c.msg}>
              ✦ {c.msg}
              <small>{c.time}</small>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
