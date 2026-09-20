import { useApp } from "../state/AppContext.jsx";
import { FILES } from "../lib/constants.js";
import HomeSection from "./sections/HomeSection.jsx";
import AboutSection from "./sections/AboutSection.jsx";
import ExperienceSection from "./sections/ExperienceSection.jsx";
import SkillsSection from "./sections/SkillsSection.jsx";
import ProjectsSection from "./sections/ProjectsSection.jsx";
import ContactSection from "./sections/ContactSection.jsx";

/* ═══════ Editor area ═══════
   Legacy #tabs / #breadcrumb / #viewport (+ panelTop/openFile scroll target).
   The six panels stay mounted so the scroll-spy, sidebar sync and tab
   highlighting behave exactly like the single-page version. */
export default function EditorArea() {
  const {
    currentFile,
    goToFile,
    viewportRef,
    setViewportHovered,
    setCursorPos,
    setSidebarHovered,
    openOverlay,
    activeFile,
  } = useApp();

  const onMouseMove = (e) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const ln = Math.max(1, Math.round((e.clientY - rect.top + vp.scrollTop) / 20));
    const col = Math.max(1, Math.round((e.clientX - rect.left) / 9));
    setCursorPos({ ln, col });
  };

  return (
    <main className="editor-area">
      <div className="tabs" id="tabs">
        {FILES.map((f) => (
          <button
            key={f.name}
            className={`tab ${f.name === currentFile ? "active" : ""}`}
            data-file={f.name}
            title={`Go to ${f.title}`}
            onClick={() => goToFile(f.name)}
          >
            <span className={`dot ${f.icon}`}></span>
            {f.name}
          </button>
        ))}
      </div>

      <div className="toolbar-row">
        <div className="breadcrumb" id="breadcrumb">
          milan_portfolio <span className="sep">›</span>{" "}
          <span className="crumb-active">{currentFile}</span>
        </div>
        <button
          className="toolbar-btn"
          id="open-search"
          title="Find in files (Ctrl+Shift+F)"
          onClick={() => openOverlay("search")}
        >
          🔍
        </button>
      </div>

      <div
        className="editor-viewport"
        id="viewport"
        ref={viewportRef}
        onMouseEnter={() => setViewportHovered(true)}
        onMouseLeave={() => {
          setViewportHovered(false);
          setSidebarHovered(false);
        }}
        onMouseMove={onMouseMove}
      >
        <section className="tab-panel" id="panel-home">
          <HomeSection />
        </section>
        <section className="tab-panel" id="panel-about">
          <AboutSection />
        </section>
        <section className="tab-panel" id="panel-experience">
          <ExperienceSection />
        </section>
        <section className="tab-panel" id="panel-skills">
          <SkillsSection />
        </section>
        <section className="tab-panel" id="panel-projects">
          <ProjectsSection />
        </section>
        <section className="tab-panel" id="panel-contact">
          <ContactSection />
        </section>
      </div>

      {/* hidden marker so the active file is available to the status bar */}
      <span hidden aria-hidden="true" data-lang={activeFile ? activeFile.lang : ""}></span>
    </main>
  );
}
