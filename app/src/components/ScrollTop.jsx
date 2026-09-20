import { useApp } from "../state/AppContext.jsx";

/* ═══════ Scroll-to-top button ═══════
   Legacy updateScrollTop(): visible once #viewport is scrolled past 320px. */
export default function ScrollTop() {
  const { showScrollTop, scrollToTop } = useApp();

  return (
    <button
      className={`scroll-top ${showScrollTop ? "show" : ""}`}
      id="scroll-top"
      title="Scroll to top"
      onClick={scrollToTop}
    >
      ↑
    </button>
  );
}
