/* ═══════ Navigation, overlays & scroll sync ═══════
   Port of openFile()/nextTab()/updateActiveSection()/the sidebar ⇄ editor
   scroll sync / the mobile drawer / scroll-to-top logic from the legacy
   script.js. Panels stay in the DOM (like the legacy sections) and the active
   file is derived from scroll position — this is what keeps the "VS Code"
   behaviour: tabs, breadcrumb, status bar language and document title. */
import { useCallback, useEffect, useRef, useState } from "react";
import { D, FILES, FILE_BY_NAME, PANEL_BY_NAME } from "../lib/constants.js";

const NO_OVERLAY = {
  palette: false,
  search: false,
  settings: false,
  project: false,
  notif: false,
  drawer: false,
};

export function useNavigation({ viewportRef, sidebarRef }) {
  const [currentFile, setCurrentFile] = useState("index.html");
  const [overlays, setOverlays] = useState(NO_OVERLAY);
  const [activeProject, setActiveProject] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mini, setMini] = useState(false);

  const hovered = useRef({ sidebar: false, viewport: false });
  const syncing = useRef(false);

  /* ─── Overlay helpers ─── */
  const openOverlay = useCallback(
    (key) => setOverlays((o) => ({ ...o, [key]: true })),
    [],
  );
  const closeOverlay = useCallback(
    (key) => setOverlays((o) => ({ ...o, [key]: false })),
    [],
  );
  const toggleOverlay = useCallback(
    (key) => setOverlays((o) => ({ ...o, [key]: !o[key] })),
    [],
  );
  const closeAllOverlays = useCallback(() => setOverlays({ ...NO_OVERLAY }), []);

  /* ─── Scroll helper (mirrors panelTop() + openFile()) ─── */
  const openFile = useCallback(
    (name, smooth = true) => {
      if (!FILE_BY_NAME[name]) return;
      setCurrentFile(name);
      const vp = viewportRef.current;
      const panel = document.getElementById(PANEL_BY_NAME[name]);
      if (!vp || !panel) return;
      const top =
        panel.getBoundingClientRect().top -
        vp.getBoundingClientRect().top +
        vp.scrollTop;
      vp.scrollTo({
        top: Math.max(0, top - 6),
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [viewportRef],
  );

  /* Clicking a file anywhere in the UI also dismisses any open overlay,
     exactly like the legacy delegated [data-file] handler. */
  const goToFile = useCallback(
    (name, smooth = true) => {
      closeAllOverlays();
      openFile(name, smooth);
    },
    [closeAllOverlays, openFile],
  );

  const nextTab = useCallback(
    (dir) => {
      const i = FILES.findIndex((f) => f.name === currentFile);
      const n = FILES[(i + dir + FILES.length) % FILES.length];
      if (n) openFile(n.name);
    },
    [currentFile, openFile],
  );

  const scrollToTop = useCallback(() => {
    viewportRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewportRef]);

  const toggleMini = useCallback(() => setMini((m) => !m), []);

  /* ─── body.mini (Ctrl+B / palette "Toggle Sidebar") ─── */
  useEffect(() => {
    document.body.classList.toggle("mini", mini);
  }, [mini]);

  /* ─── document.title ─── */
  useEffect(() => {
    const f = FILE_BY_NAME[currentFile];
    if (f) document.title = `${f.title} — ${D.meta.name}`;
  }, [currentFile]);

  /* ─── Sidebar ⇄ editor scroll sync ─── */
  const syncSidebarFromView = useCallback(() => {
    const vp = viewportRef.current;
    const sb = sidebarRef.current;
    if (!vp || !sb) return;
    const vpMax = vp.scrollHeight - vp.clientHeight;
    const sbMax = sb.scrollHeight - sb.clientHeight;
    if (vpMax <= 0 || sbMax <= 0 || syncing.current) return;
    syncing.current = true;
    sb.scrollTop = (vp.scrollTop / vpMax) * sbMax;
    syncing.current = false;
  }, [sidebarRef, viewportRef]);

  const syncViewFromSidebar = useCallback(() => {
    const vp = viewportRef.current;
    const sb = sidebarRef.current;
    if (!vp || !sb) return;
    const vpMax = vp.scrollHeight - vp.clientHeight;
    const sbMax = sb.scrollHeight - sb.clientHeight;
    if (vpMax <= 0 || sbMax <= 0 || syncing.current) return;
    syncing.current = true;
    vp.scrollTop = (sb.scrollTop / sbMax) * vpMax;
    setShowScrollTop(vp.scrollTop > 320);
    syncing.current = false;
  }, [sidebarRef, viewportRef]);

  const setSidebarHovered = useCallback((value) => {
    hovered.current.sidebar = value;
  }, []);
  const setViewportHovered = useCallback((value) => {
    hovered.current.viewport = value;
  }, []);

  /* ─── Scroll spy + scroll-to-top visibility ─── */
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let queued = false;
    const applyActiveSection = () => {
      queued = false;
      const vr = vp.getBoundingClientRect();
      const threshold = 120;
      let best = null;
      FILES.forEach((f) => {
        const panel = document.getElementById(PANEL_BY_NAME[f.name]);
        if (!panel) return;
        const pr = panel.getBoundingClientRect();
        if (pr.top - vr.top <= threshold && pr.bottom - vr.top > 0) best = f.name;
      });
      if (!best) best = FILES[FILES.length - 1].name;
      setCurrentFile((cur) => (best && best !== cur ? best : cur));
    };
    const onScroll = () => {
      setShowScrollTop(vp.scrollTop > 320);
      if (!hovered.current.sidebar) syncSidebarFromView();
      if (queued) return;
      queued = true;
      requestAnimationFrame(applyActiveSection);
    };
    vp.addEventListener("scroll", onScroll);
    return () => vp.removeEventListener("scroll", onScroll);
  }, [syncSidebarFromView, viewportRef]);

  useEffect(() => {
    const sb = sidebarRef.current;
    if (!sb) return;
    const onScroll = () => {
      if (hovered.current.sidebar && !hovered.current.viewport) {
        syncViewFromSidebar();
      }
    };
    sb.addEventListener("scroll", onScroll);
    return () => sb.removeEventListener("scroll", onScroll);
  }, [sidebarRef, syncViewFromSidebar]);

  return {
    viewportRef,
    sidebarRef,
    currentFile,
    activeFile: FILE_BY_NAME[currentFile],
    overlays,
    openOverlay,
    closeOverlay,
    toggleOverlay,
    closeAllOverlays,
    activeProject,
    setActiveProject,
    showScrollTop,
    scrollToTop,
    mini,
    toggleMini,
    openFile,
    goToFile,
    nextTab,
    setSidebarHovered,
    setViewportHovered,
  };
}
