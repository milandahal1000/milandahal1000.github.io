import { useEffect, useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import { searchFiles, snippetFor, iconForFile } from "../../lib/search.js";

/* ═══════ Find in files overlay (Ctrl+F) ═══════
   Legacy openSearch()/renderSearch(): live filtering of the search index,
   result snippets and the "n results (of N entries)" footer. */
export default function SearchOverlay() {
  const { overlays, closeOverlay, searchIndex, goToFile } = useApp();
  const open = overlays.search;
  const [query, setQuery] = useState("");

  /* openSearch(): clear the input, show the empty list, focus the field */
  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  const ql = query.toLowerCase().trim();
  const results = searchFiles(searchIndex, query);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && results[0]) {
      closeOverlay("search");
      goToFile(results[0].file);
    }
  };

  const countText = ql
    ? `${results.length} result${results.length === 1 ? "" : "s"} (of ${searchIndex.length} entries)`
    : "Start typing to search…";

  return (
    <div
      className={`overlay search-overlay ${open ? "open" : ""}`}
      id="search-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeOverlay("search");
      }}
    >
      <div className="search-box">
        <div className="search-head">
          <span>🔍 Find in files</span>
          <button className="close-x" id="search-close" onClick={() => closeOverlay("search")}>
            ✕
          </button>
        </div>
        <input
          id="search-input"
          placeholder="Search skills, projects, experience..."
          spellCheck="false"
          value={query}
          autoFocus={open}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <ul id="search-results">
          {results.length > 0 ? (
            results.map((r, i) => (
              <li
                className="search-result"
                data-file={r.file}
                key={`${r.file}-${i}`}
                onClick={() => {
                  closeOverlay("search");
                  goToFile(r.file);
                }}
              >
                <span className="sf-ico">
                  <span className={`dot ${iconForFile(r.file)}`}></span>
                </span>
                <div className="sf-main">
                  <b>{r.file}</b>
                  <span className="sf-snippet">{snippetFor(r)}</span>
                </div>
                <span className="sf-go">→</span>
              </li>
            ))
          ) : (
            <li className="search-empty">
              {ql
                ? "No matches found"
                : 'Try "react", "backend", "university"…'}
            </li>
          )}
        </ul>
        <div className="search-foot" id="search-count">
          {countText}
        </div>
      </div>
    </div>
  );
}
