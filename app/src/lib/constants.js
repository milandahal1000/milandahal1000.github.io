/* ═══════ Shared constants ═══════
   Ported from the top of the legacy script.js: file model, themes, persisted
   settings and the "Asia/Kathmandu" formatter. */
import { PORTFOLIO_DATA } from "../data/portfolioData.js";

export const D = PORTFOLIO_DATA;
export const P = D.profile;
export const EMAIL = P.email;
export const GITHUB = P.github;
export const LINKEDIN = P.linkedin;

/* ─── File model (maps "repo files" → rendered sections) ─── */
export const FILES = [
  { name: "index.html", icon: "html", lang: "HTML", title: "Home" },
  { name: "about.md", icon: "md", lang: "Markdown", title: "About Me" },
  {
    name: "experience.json",
    icon: "json",
    lang: "JSON",
    title: "Work Experience",
  },
  { name: "skills.json", icon: "json", lang: "JSON", title: "Skills" },
  { name: "projects.json", icon: "json", lang: "JSON", title: "My Work" },
  { name: "contact.html", icon: "html", lang: "HTML", title: "Contact" },
];

export const FILE_BY_NAME = Object.fromEntries(FILES.map((f) => [f.name, f]));

export const PANEL_BY_NAME = {
  "index.html": "panel-home",
  "about.md": "panel-about",
  "experience.json": "panel-experience",
  "skills.json": "panel-skills",
  "projects.json": "panel-projects",
  "contact.html": "panel-contact",
};

/* ─── Themes ─── */
export const THEMES = [
  {
    id: "blue",
    name: "Blueprint",
    accent: "#007acc",
    accent2: "#4fc1ff",
    status: "#007acc",
    hover: "#0069b1",
    select: "#04395e",
  },
  {
    id: "orange",
    name: "Ember",
    accent: "#e67e22",
    accent2: "#f5b041",
    status: "#ca6f1e",
    hover: "#d3721d",
    select: "#5d2f0b",
  },
  {
    id: "purple",
    name: "Ambience",
    accent: "#8e44ad",
    accent2: "#c9a8ff",
    status: "#7d3c99",
    hover: "#7a3b94",
    select: "#3b1d4b",
  },
  {
    id: "green",
    name: "Grove",
    accent: "#27ae60",
    accent2: "#7edda0",
    status: "#1e8443",
    hover: "#229954",
    select: "#0c3a20",
  },
  {
    id: "red",
    name: "Lava",
    accent: "#e74c3c",
    accent2: "#ff9e97",
    status: "#c0392b",
    hover: "#cf3a2b",
    select: "#4e120c",
  },
  {
    id: "cyan",
    name: "Cyberspace",
    accent: "#00a8a8",
    accent2: "#59d3d3",
    status: "#008c8c",
    hover: "#008e8e",
    select: "#033a3a",
  },
];

/* light-mode variants for each accent (better contrast on light background) */
export const LIGHT_ACCENTS = {
  blue: { a2: "#1f8fd7", sel: "#cae6ff" },
  orange: { a2: "#c07a1d", sel: "#ffe0b0" },
  purple: { a2: "#8a5cc4", sel: "#e6d4ff" },
  green: { a2: "#1e9149", sel: "#d2f2dd" },
  red: { a2: "#cf5242", sel: "#ffd9d4" },
  cyan: { a2: "#008f8f", sel: "#c9f2f2" },
};

/* ─── Settings (persisted) ─── */
export const SETTINGS_KEY = "milan-portfolio-settings-v2";

export const defaultSettings = {
  accent: "blue",
  fontSize: 14,
  terminal: false, // closed on first load — opened via the header "Terminal" menu
  animations: true,
  darkMode: true,
};

export function loadSettings() {
  try {
    return {
      ...defaultSettings,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable — ignore, same as legacy */
  }
}

/* ─── Kathmandu clock ─── */
export function kathmanduTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour12: false,
  }).format(new Date());
}

/* ─── Contact form (Web3Forms → milandahal685@gmail.com) ─── */
export const WEB3FORMS_KEY = "1728634c-6458-4533-85b7-51489b1853a2";
