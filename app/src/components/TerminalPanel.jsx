import { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppContext.jsx";

/* ═══════ Terminal panel ═══════
   Legacy #terminal-panel + tprint(): same header tabs, same line classes
   (t-line ok/info/err/cmd/matrix), same fixed input line that runs commands. */
export default function TerminalPanel() {
  const { terminal } = useApp();
  const [activeTab, setActiveTab] = useState("Terminal");
  const [value, setValue] = useState("");
  const bodyRef = useRef(null);

  /* tprint() scrolled the body to the bottom after each line. */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [terminal.lines]);

  const onKeyDown = (e) => {
    if (e.key !== "Enter") return;
    terminal.runCommand(value);
    setValue("");
  };

  return (
    <div className={`panel ${terminal.open ? "" : "hidden"}`} id="terminal-panel">
      <div className="panel-head">
        {["Terminal", "Problems", "Output"].map((t) => (
          <span
            key={t}
            className={`panel-tab ${t === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </span>
        ))}
        <div className="panel-actions">
          <span>Ctrl+`</span>
          <button
            id="panel-close"
            title="Close panel"
            onClick={() => terminal.toggle(false)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="panel-body" id="terminal-body" ref={bodyRef}>
        {terminal.lines.map((l) => (
          <div className={`t-line ${l.cls}`} key={l.id}>
            {l.text}
          </div>
        ))}
      </div>

      <div className="panel-input">
        <span className="t-prompt">milan@portfolio:~$</span>
        <input
          id="terminal-input"
          autoComplete="off"
          spellCheck="false"
          placeholder="type 'help' for commands"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
