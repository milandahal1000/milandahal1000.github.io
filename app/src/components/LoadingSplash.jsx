/* ═══════ Loading splash ═══════
   Legacy #loading + hideLoading(): fade out after 900ms, then unmount. */
export default function LoadingSplash({ loading }) {
  if (loading === "done") return null;
  return (
    <div id="loading" className={loading === "hidden" ? "hidden" : ""}>
      <div className="load-inner">
        <svg className="vscode-logo" viewBox="0 0 24 24" width="44" height="44">
          <path
            fill="#4fc1ff"
            d="M17.9 2.1 9.7 9.9 5 6.4 3 7.4l4.6 4.6L3 16.6l2 1 4.7-3.5 8.2 7.8 3.1-1.5V3.6L17.9 2.1zm.6 5.3v9.2l-5.6-4.6 5.6-4.6z"
          />
        </svg>
        <div className="load-text">Opening MILAN_PORTFOLIO...</div>
        <div className="load-bar">
          <span></span>
        </div>
      </div>
    </div>
  );
}
