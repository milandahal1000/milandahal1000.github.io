import { useApp } from "../../state/AppContext.jsx";

/* ═══════ Project detail modal ═══════
   Legacy openProject(title): emoji + title header, description, features,
   stack tags and the GitHub / live-demo / "contact about this" actions. */
export default function ProjectModal() {
  const {
    projects,
    activeProject,
    overlays,
    closeOverlay,
    goToFile,
  } = useApp();
  const open = overlays.project;
  const p = (projects || []).find((x) => x.title === activeProject);

  const contact = () => {
    closeOverlay("project");
    goToFile("contact.html");
  };

  return (
    <div
      className={`overlay modal-overlay ${open ? "open" : ""}`}
      id="project-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeOverlay("project");
      }}
    >
      <div className="modal project-modal">
        <div className="modal-head">
          <span>📄 Project Details</span>
          <button className="close-x" id="project-close" onClick={() => closeOverlay("project")}>
            ✕
          </button>
        </div>
        <div className="modal-body" id="project-body">
          {open && p && (
            <>
              <div className="pm-head">
                <div className="pm-emoji">{p.emoji}</div>
                <div>
                  <h3>{p.title}</h3>
                  <span className="card-cat">{p.category}</span>
                </div>
              </div>
              <p className="pm-desc">{p.description}</p>
              <h4>✦ Features</h4>
              <ul className="pm-features">
                {(p.features || []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <h4>✦ Stack</h4>
              <div className="tags">
                {(p.tags || []).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="pm-actions">
                {p.links && p.links.github && (
                  <a
                    className="btn-ghost"
                    href={p.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🐙 View source
                  </a>
                )}
                {p.links && p.links.live && (
                  <a
                    className="btn-ghost"
                    href={p.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 Live demo
                  </a>
                )}
                <button className="btn-primary" data-action="contact" onClick={contact}>
                  ✉ Contact about this
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
