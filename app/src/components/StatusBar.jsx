import { useEffect, useState } from "react";
import { useApp } from "../state/AppContext.jsx";
import { kathmanduTime } from "../lib/constants.js";

/* ═══════ Status bar ═══════
   Legacy footer: branch / problems / Go Live, the Ln-Col readout, encoding,
   language (from the active file), the dark-light toggle and the Kathmandu
   clock that ticks every second via startClock(). */
export default function StatusBar() {
  const {
    activeFile,
    settings,
    toggleDark,
    goToFile,
    terminal,
    cursorPos,
  } = useApp();
  const dark = settings.darkMode !== false;
  const [time, setTime] = useState(kathmanduTime);

  useEffect(() => {
    const iv = setInterval(() => setTime(kathmanduTime()), 1000);
    return () => clearInterval(iv);
  }, []);

  /* Legacy handlers printed a message into the terminal as well. */
  const goLive = () => {
    goToFile("contact.html");
    terminal.print("Live server started → let's work together! 🚀", "ok");
  };
  const branchClick = () =>
    terminal.print("branch: main* · all changes committed. clean working tree ✓", "info");
  const problemsClick = () =>
    terminal.print("0 errors, 0 warnings — clean code only ✨", "ok");

  return (
    <footer className="status-bar">
      <div className="sb-left">
        <button className="status-item" id="status-branch" onClick={branchClick}>
          ⑂ main*
        </button>
        <button className="status-item" id="status-problems" onClick={problemsClick}>
          ⓧ 0 ⚠ 0
        </button>
        <span
          className="status-item live"
          id="go-live"
          title="Start live server"
          onClick={goLive}
        >
          ⚡ Go Live
        </span>
      </div>

      <div className="sb-right">
        <span className="status-item pos" id="status-pos">
          Ln {cursorPos.ln}, Col {cursorPos.col}
        </span>
        <span className="status-item sp">Spaces: 2</span>
        <span className="status-item">UTF-8</span>
        <span className="status-item" id="status-lang">
          {activeFile ? activeFile.lang : "Markdown"}
        </span>
        <button
          className="status-item"
          id="status-mode"
          title="Toggle Dark Mode"
          onClick={toggleDark}
        >
          {dark ? "🌙 Dark" : "☀️ Light"}
        </button>
        <span className="status-item" id="status-time">
          {`🇳🇵 ${time}`}
        </span>
      </div>
    </footer>
  );
}
