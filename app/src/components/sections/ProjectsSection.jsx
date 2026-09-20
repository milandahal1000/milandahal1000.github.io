import { useApp } from "../../state/AppContext.jsx";
import CtaBlock from "./CtaBlock.jsx";

/* ═══════ Projects section ═══════
   Legacy renderProjects(): loading state while GitHub data is pending,
   category filter chips with counts, and the clickable project cards that
   open the detail modal. */
export default function ProjectsSection() {
  const {
    projects,
    projFilter,
    setProjFilter,
    setActiveProject,
    openOverlay,
  } = useApp();

  if (!projects || projects.length === 0) {
    return (
      <>
        <p className="sec-comment">
          // projects.json — loading from GitHub...
        </p>
        <h2>My Work</h2>
        <p className="md-sub">Fetching your latest projects from GitHub...</p>
        <div className="cards">
          <p className="md-sub">Loading...</p>
        </div>
        <CtaBlock />
      </>
    );
  }

  const cats = ["All", ...new Set(projects.map((p) => p.category))];
  const shown = projects.filter(
    (p) => projFilter === "All" || p.category === projFilter,
  );

  const openProject = (title) => {
    setActiveProject(title);
    openOverlay("project");
  };

  return (
    <>
      <p className="sec-comment">// projects.json — some of my work</p>
      <h2>My Work</h2>
      <p className="md-sub">Click any card for full details</p>

      <div className="proj-filters">
        {cats.map((c) => (
          <button
            key={c}
            className={`proj-filter ${c === projFilter ? "active" : ""}`}
            data-cat={c}
            onClick={() => setProjFilter(c)}
          >
            {c}{" "}
            <small>
              (
              {
                (c === "All"
                  ? projects
                  : projects.filter((p) => p.category === c)
                ).length
              }
              )
            </small>
          </button>
        ))}
      </div>

      <div className="cards">
        {shown.length === 0 ? (
          <p className="md-sub">No projects in this category yet.</p>
        ) : (
          shown.map((p) => (
            <article
              className="card"
              data-title={p.title}
              tabIndex={0}
              role="button"
              aria-label={`View ${p.title}`}
              key={p.title}
              onClick={() => openProject(p.title)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProject(p.title);
                }
              }}
            >
              <div className="card-icon">{p.emoji}</div>
              <span className="card-cat">{p.category}</span>
              <h3>{p.title}</h3>
              <p>{p.blurb}</p>
              <div className="tags">
                {(p.tags || []).slice(0, 3).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <span className="learn-more">Learn more →</span>
            </article>
          ))
        )}
      </div>

      <CtaBlock />
    </>
  );
}
