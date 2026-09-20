import { useApp } from "../../state/AppContext.jsx";
import { FILES } from "../../lib/constants.js";

/* ═══════ Mobile drawer ═══════
   Legacy #mobile-fab + #drawer-overlay: the fab opens the file drawer and
   clicking the backdrop (or a file) closes it. */
export default function MobileDrawer() {
  const { overlays, openOverlay, closeOverlay, currentFile, goToFile } = useApp();
  const open = overlays.drawer;

  return (
    <>
      <button
        className="mobile-fab"
        id="mobile-fab"
        title="Files"
        onClick={() => openOverlay("drawer")}
      >
        📂
      </button>

      <div
        className={`overlay drawer-overlay ${open ? "open" : ""}`}
        id="drawer-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeOverlay("drawer");
        }}
      >
        <div className="drawer">
          <div className="drawer-head">Files</div>
          <ul className="file-tree" id="drawer-list">
            {FILES.map((f) => (
              <li
                key={f.name}
                className={`file-item ${f.name === currentFile ? "active" : ""}`}
                data-file={f.name}
                onClick={() => goToFile(f.name)}
              >
                <span className={`dot ${f.icon}`}></span>
                {f.name} <small>— {f.title}</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
