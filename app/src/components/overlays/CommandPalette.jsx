import { useEffect, useState } from "react";
import { useApp } from "../../state/AppContext.jsx";

/* ═══════ Command palette (Ctrl+Shift+P / F1) ═══════
   Legacy openPalette()/renderPalette(): filters label + hint, arrow keys move
   the selection, Enter runs the highlighted command. */
export default function CommandPalette() {
  const { overlays, closeOverlay, paletteCommands } = useApp();
  const open = overlays.palette;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  /* openPalette(): reset the query, render everything and focus the input */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
  }, [open]);

  const q = query.toLowerCase();
  const filtered = paletteCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(q) || (c.hint || "").toLowerCase().includes(q),
  );

  const run = (cmd) => {
    closeOverlay("palette");
    cmd.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, filtered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && filtered[index]) {
      e.preventDefault();
      run(filtered[index]);
    }
  };

  return (
    <div
      className={`palette-overlay overlay ${open ? "open" : ""}`}
      id="palette-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeOverlay("palette");
      }}
    >
      <div className="palette">
        <input
          id="palette-input"
          placeholder="Type a command..."
          spellCheck="false"
          value={query}
          autoFocus={open}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={onKeyDown}
        />
        <ul id="palette-list">
          {filtered.length === 0 ? (
            <li className="search-empty">No matching commands</li>
          ) : (
            filtered.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className={i === index ? "selected" : ""}
                data-i={i}
                onClick={() => run(c)}
              >
                <span>{c.label}</span>
                <span className="cmd-hint">{c.hint}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
