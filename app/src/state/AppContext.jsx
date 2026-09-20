/* ═══════ App-wide state (single context) ═══════
   Composes the hooks that were one big script in legacy/script.js:
   settings/theme, notifications, navigation+overlays, terminal, GitHub data.
   Components consume it through useApp() instead of querying the DOM. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  D,
  EMAIL,
  GITHUB,
  LINKEDIN,
  FILES,
  THEMES,
  WEB3FORMS_KEY,
} from "../lib/constants.js";
import { buildSearchIndex } from "../lib/search.js";
import {
  RESUME_FILENAME,
  downloadResume as writeResumeFile,
} from "../lib/resume.js";
import { useSettings } from "./useSettings.js";
import { useNotifications } from "./useNotifications.js";
import { useNavigation } from "./useNavigation.js";
import { useTerminal } from "./useTerminal.js";
import { useGitHubData } from "./useGitHubData.js";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp() must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children }) {
  /* Refs shared by the workbench pieces (viewport ⇄ sidebar sync, Ln/Col). */
  const viewportRef = useRef(null);
  const sidebarRef = useRef(null);

  const settingsApi = useSettings();
  const {
    settings,
    setSettings,
    toggleDark: settingsToggleDark,
    setDarkMode,
    resetSettings,
    setAccent,
  } = settingsApi;

  const {
    notifications,
    toasts,
    unreadCount,
    notify,
    pushToast,
    removeToast,
    clearNotifications,
    markNotificationsRead,
  } = useNotifications();

  /* toggleDark() in the legacy code flipped the mode, re-applied the settings
     and fired a toast — the settings-modal checkbox did not. */
  const toggleDark = useCallback(() => {
    const nextDark = settings.darkMode === false; // toggling
    settingsToggleDark();
    pushToast(
      "success",
      nextDark ? "Dark mode enabled 🌙" : "Light mode enabled ☀️",
    );
  }, [pushToast, settings.darkMode, settingsToggleDark]);

  const nav = useNavigation({ viewportRef, sidebarRef });
  const [projFilter, setProjFilter] = useState("All");
  /* Status-bar "Ln x, Col y" readout, updated from the editor mousemove. */
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });

  const { projects, skills, stats, liveAvatar, refreshProjects } = useGitHubData({
    notify,
  });

  /* ─── Resume (legacy toast + notification pair) ─── */
  const downloadResume = useCallback(() => {
    writeResumeFile({ projects, skills });
    pushToast("success", `Resume downloaded: ${RESUME_FILENAME}`);
    notify(
      "success",
      "Resume downloaded",
      `${RESUME_FILENAME} is ready 📄`,
    );
  }, [notify, projects, pushToast, skills]);

  /* ─── Terminal (needs openFile + resume) ─── */
  const terminal = useTerminal({
    settings,
    setDarkMode,
    setAccent,
    openFile: nav.openFile,
    downloadResume,
  });

  /* Terminal printer, used as the copy-email fallback. */
  const printRef = useRef(() => {});
  printRef.current = terminal.print;

  const copyEmail = useCallback(() => {
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => {
        pushToast("success", "Email copied to clipboard");
        notify("success", "Email copied", EMAIL);
      })
      .catch(() => printRef.current(EMAIL, "info"));
  }, [notify, pushToast]);

  /* ─── Find in files index (rebuilds when GitHub data arrives) ─── */
  const searchIndex = useMemo(
    () => buildSearchIndex(projects, skills),
    [projects, skills],
  );

  /* ─── Command palette commands ─── */
  const paletteCommands = useMemo(() => {
    const cmds = FILES.map((f) => ({
      label: `Go to ${f.name} — ${f.title}`,
      hint: "file",
      run: () => nav.openFile(f.name),
    }));
    cmds.push(
      { label: "Toggle Terminal", hint: "Ctrl+`", run: () => terminal.toggle() },
      { label: "Toggle Sidebar", hint: "Ctrl+B", run: nav.toggleMini },
      {
        label:
          settings.darkMode !== false
            ? "Switch to Light Mode"
            : "Switch to Dark Mode",
        hint: "dark ⇄ light",
        run: toggleDark,
      },
      {
        label: "Find in Files",
        hint: "Ctrl+F",
        run: () => nav.openOverlay("search"),
      },
      { label: "Copy Email Address", hint: EMAIL, run: copyEmail },
      {
        label: "Download Resume (.txt)",
        hint: "pdf → txt",
        run: downloadResume,
      },
      {
        label: "Open GitHub Profile",
        hint: "web",
        run: () => window.open(GITHUB, "_blank"),
      },
      {
        label: "Open LinkedIn Profile",
        hint: "web",
        run: () => window.open(LINKEDIN, "_blank"),
      },
      {
        label: "Open Settings",
        hint: "gear",
        run: () => nav.openOverlay("settings"),
      },
      ...THEMES.map((t) => ({
        label: `Theme: ${t.name}`,
        hint: t.accent,
        run: () => setAccent(t.id),
      })),
      { label: "Hire Milan Dahal", hint: "!", run: () => nav.openFile("contact.html") },
      {
        label: "🥷 Matrix rain (terminal)",
        hint: "easter egg",
        run: () => {
          terminal.toggle(true);
          terminal.matrixRain();
        },
      },
      {
        label: "Refresh Projects from GitHub",
        hint: "🔄",
        run: () => refreshProjects(),
      },
    );
    return cmds;
  }, [
    copyEmail,
    downloadResume,
    nav,
    refreshProjects,
    setAccent,
    settings.darkMode,
    terminal,
    toggleDark,
  ]);

  /* ─── Keyboard shortcuts (legacy document keydown handler) ─── */
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey && e.shiftKey && k === "p") || k === "f1") {
        e.preventDefault();
        nav.toggleOverlay("palette");
      }
      if (e.ctrlKey && k === "f") {
        e.preventDefault();
        nav.openOverlay("search");
      }
      if (e.ctrlKey && k === "`") {
        e.preventDefault();
        terminal.toggle();
      }
      if (e.ctrlKey && k === "b") {
        e.preventDefault();
        nav.toggleMini();
      }
      if (e.ctrlKey && k === "pagedown") {
        e.preventDefault();
        nav.nextTab(1);
      }
      if (e.ctrlKey && k === "pageup") {
        e.preventDefault();
        nav.nextTab(-1);
      }
      if (e.key === "Escape") nav.closeAllOverlays();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [nav, terminal]);

  /* ─── Loading splash (legacy hideLoading(): fade then remove) ─── */
  const [loading, setLoading] = useState("show");
  useEffect(() => {
    const fade = setTimeout(() => setLoading("hidden"), 900);
    const remove = setTimeout(() => setLoading("done"), 1600);
    return () => {
      clearTimeout(fade);
      clearTimeout(remove);
    };
  }, []);

  /* ─── Welcome banner + terminal greeting (legacy init()) ─── */
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    terminal.print("Milan Dahal — Portfolio Terminal v2.0", "ok");
    terminal.print("Type 'help' to see available commands.", "info");
    notify(
      "info",
      "Welcome to my portfolio 👋",
      "Scroll through my work, search (Ctrl+F), or press Ctrl+Shift+P.",
      "index.html",
    );
  }, []);

  const value = {
    /* data */
    D,
    settings,
    setSettings,
    projects,
    skills,
    stats,
    liveAvatar,
    refreshProjects,
    /* theme */
    toggleDark,
    setDarkMode,
    setAccent,
    resetSettings,
    /* notifications */
    notifications,
    toasts,
    unreadCount,
    notify,
    removeToast,
    clearNotifications,
    markNotificationsRead,
    /* navigation */
    ...nav,
    projFilter,
    setProjFilter,
    cursorPos,
    setCursorPos,
    /* terminal */
    terminal,
    /* misc */
    copyEmail,
    downloadResume,
    searchIndex,
    paletteCommands,
    loading,
    web3formsKey: WEB3FORMS_KEY,
    email: EMAIL,
    github: GITHUB,
    linkedin: LINKEDIN,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;

