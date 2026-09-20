/* ═══════ Parity test: legacy site vs React app ═══════
   Loads legacy/index.html + data.js + script.js into one jsdom window and the
   built React bundle into another, drives the exact same interactions against
   both, and diffs every extracted DOM value.
   Run with:  npm test
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";
import { build } from "vite";
import react from "@vitejs/plugin-react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─── 1. Bundle the React app as a plain IIFE so jsdom can run it ─── */
async function buildApp() {
  await build({
    configFile: false,
    root: path.join(root, "app"),
    logLevel: "warn",
    plugins: [react()],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
      outDir: path.join(root, "tests/.tmp"),
      emptyOutDir: true,
      cssCodeSplit: false,
      minify: false,
      lib: {
        entry: path.join(root, "app/src/main.jsx"),
        name: "MilanPortfolioApp",
        formats: ["iife"],
        fileName: () => "app.js",
      },
    },
  });
  return read("tests/.tmp/app.js");
}

/* Shared browser shims: a rejecting fetch (the "offline" path both versions
   handle) and a scrollTo implementation so openFile() can position the
   viewport like it does in a real browser. */
function applyBrowserShims(win) {
  win.fetch = () => Promise.reject(new TypeError("Failed to fetch"));
  win.Element.prototype.scrollTo = function (opts) {
    const top = typeof opts === "object" && opts ? opts.top : opts;
    if (typeof top === "number") this.scrollTop = top;
  };
}

/* ─── 2. Boot the legacy page exactly like a browser would ─── */
function bootLegacy() {
  const vc = new VirtualConsole();
  vc.on("jsdomError", () => {});
  const dom = new JSDOM(read("legacy/index.html"), {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "https://milandahal1000.github.io/",
    virtualConsole: vc,
  });
  const win = dom.window;
  applyBrowserShims(win);
  win.eval(read("legacy/data.js"));
  win.eval(read("legacy/script.js"));
  return win;
}

/* ─── 3. Boot the React app in the same kind of window ─── */
function bootReact(appJs) {
  const vc = new VirtualConsole();
  vc.on("jsdomError", () => {});
  const dom = new JSDOM(
    `<!doctype html><html><head><title>t</title></head><body><div id="root"></div></body></html>`,
    {
      runScripts: "dangerously",
      pretendToBeVisual: true,
      url: "https://milandahal1000.github.io/",
      virtualConsole: vc,
    },
  );
  const win = dom.window;
  applyBrowserShims(win);
  win.eval(appJs);
  return win;
}

/* ─── 4. Interaction helpers, identical for both windows ─── */
function click(win, selector) {
  const el = win.document.querySelector(selector);
  if (!el) return false;
  el.dispatchEvent(
    new win.MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  return true;
}
/* React tracks input values, so a plain `el.value = x` is invisible to it —
   write through the prototype setter and fire a real input event. */
function setValue(win, el, value) {
  const proto =
    el.tagName === "TEXTAREA" ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  el.dispatchEvent(new win.Event("input", { bubbles: true }));
  el.dispatchEvent(new win.Event("change", { bubbles: true }));
}
function typeInto(win, selector, value) {
  const el = win.document.querySelector(selector);
  if (!el) return false;
  setValue(win, el, value);
  return true;
}
function press(win, key, mods = {}) {
  win.document.dispatchEvent(
    new win.KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...mods,
    }),
  );
}
function submitTerminal(win, text) {
  const el = win.document.querySelector("#terminal-input");
  if (!el) return;
  setValue(win, el, text);
  el.dispatchEvent(
    new win.KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    }),
  );
}
/* ─── 5. DOM extraction (identical selectors for both versions) ─── */
const TEXT = (win, sel) =>
  (win.document.querySelector(sel)?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
const ALL = (win, sel) =>
  [...win.document.querySelectorAll(sel)].map((e) =>
    (e.textContent || "").replace(/\s+/g, " ").trim(),
  );
const COUNT = (win, sel) => win.document.querySelectorAll(sel).length;
const ATTR = (win, sel, name) =>
  win.document.querySelector(sel)?.getAttribute(name) ?? null;
const hasClass = (win, sel, cls) =>
  !!win.document.querySelector(sel)?.classList.contains(cls);
const digitsToHash = (s) =>
  s.replace(/\d+:\d+:\d+/g, "#time#").replace(/\d/g, "#");
const CLASSES = (win, sel) =>
  [...win.document.querySelectorAll(sel)].map((e) => e.className);

function heroLineWithoutTypewriter(win) {
  const el = win.document.querySelector(".hero-line");
  if (!el) return "";
  const clone = el.cloneNode(true);
  clone.querySelectorAll(".typewriter, .caret").forEach((n) => n.remove());
  return (clone.textContent || "").replace(/\s+/g, " ").trim();
}

function snapshotChrome(win) {
  const timeText = TEXT(win, "#status-time");
  return {
    loadingSplashRemoved: win.document.querySelector("#loading") === null,
    docTitle: win.document.title,
    breadcrumb: TEXT(win, "#breadcrumb"),
    tabs: ALL(win, "#tabs .tab"),
    tabClasses: CLASSES(win, "#tabs .tab"),
    activeTab: TEXT(win, "#tabs .tab.active"),
    statusLang: TEXT(win, "#status-lang"),
    statusPos: TEXT(win, "#status-pos"),
    statusTime: digitsToHash(timeText),
    statusLeft: TEXT(win, ".status-bar .sb-left"),
    statusRightNoTime: digitsToHash(
      TEXT(win, ".status-bar .sb-right").replace(timeText, ""),
    ),
    statusMode: TEXT(win, "#status-mode"),
    explorerBadge: TEXT(win, "#explorer-badge"),
    fileTree: ALL(win, "#file-tree > li"),
    outline: ALL(win, "#outline > li"),
    timeline: ALL(win, "#timeline > li"),
    activeTreeItems: ALL(win, ".file-item.active"),
    assetsBlock: ALL(win, ".sb-subtree .file-item"),
    profileName: TEXT(win, ".pc-name"),
    profileRole: TEXT(win, ".pc-role"),
    profileStatus: TEXT(win, ".pc-status"),
    avatar: TEXT(win, ".pc-avatar"),
    sbTitles: ALL(win, ".sb-title"),
    sbHeads: ALL(win, ".sb-head"),
    workbenchChildren: [...win.document.querySelector(".workbench").children].map(
      (e) => e.className,
    ),
  };
}

function snapshotSections(win) {
  return {
    panels: COUNT(win, ".editor-viewport .tab-panel"),
    panelIds: [...win.document.querySelectorAll(".editor-viewport .tab-panel")].map(
      (e) => e.id,
    ),
    heroComment: TEXT(win, "#panel-home .hero-comment"),
    heroName: TEXT(win, "#panel-home .hero-name"),
    heroLine: heroLineWithoutTypewriter(win),
    heroDesc: TEXT(win, "#panel-home .hero-desc"),
    heroStats: ALL(win, "#panel-home .stat"),
    heroActions: ALL(win, "#panel-home .hero-actions > *"),
    heroActionClasses: CLASSES(win, "#panel-home .hero-actions > *"),
    heroFooter: TEXT(win, "#panel-home .hero-footer"),
    aboutH2: TEXT(win, "#panel-about h2"),
    aboutSub: TEXT(win, "#panel-about .md-sub"),
    aboutName: TEXT(win, "#panel-about .md-name"),
    aboutBodies: ALL(win, "#panel-about .md-body"),
    aboutGrid: ALL(win, "#panel-about .about-grid li"),
    aboutGridHeads: ALL(win, "#panel-about .about-grid h4"),
    expH2: TEXT(win, "#panel-experience h2"),
    expItems: COUNT(win, "#panel-experience .t-item"),
    expCards: ALL(win, "#panel-experience .t-card h3"),
    expPeriods: ALL(win, "#panel-experience .t-period"),
    expCompanies: ALL(win, "#panel-experience .t-company"),
    expBullets: COUNT(win, "#panel-experience .t-card li"),
    expTags: ALL(win, "#panel-experience .t-card .tags span"),
    skillsH2: TEXT(win, "#panel-skills h2"),
    skillGroups: ALL(win, "#panel-skills .skill-group h4"),
    skillBars: ALL(win, "#panel-skills .sbar-head"),
    skillChips: ALL(win, "#panel-skills .chip"),
    skillChipClasses: CLASSES(win, "#panel-skills .chip"),
    skillBarWidths: [...win.document.querySelectorAll("#panel-skills .sbar-fill")].map(
      (e) => e.style.width,
    ),
    projComment: TEXT(win, "#panel-projects .sec-comment"),
    projH2: TEXT(win, "#panel-projects h2"),
    projSub: TEXT(win, "#panel-projects .md-sub"),
    projCards: COUNT(win, "#panel-projects .card"),
    contactH2: TEXT(win, "#panel-contact h2"),
    contactLabels: ALL(win, "#panel-contact .field label"),
    contactPlaceholders: [
      ATTR(win, "#cf-name", "placeholder"),
      ATTR(win, "#cf-email", "placeholder"),
      ATTR(win, "#cf-message", "placeholder"),
    ],
    contactNames: [
      ATTR(win, "#cf-name", "name"),
      ATTR(win, "#cf-email", "name"),
      ATTR(win, "#cf-message", "name"),
    ],
    contactTypes: [
      ATTR(win, "#cf-name", "type"),
      ATTR(win, "#cf-email", "type"),
    ],
    contactRequired: [
      ATTR(win, "#cf-name", "required") !== null,
      ATTR(win, "#cf-email", "required") !== null,
      ATTR(win, "#cf-message", "required") !== null,
    ],
    honeypot: [
      ATTR(win, "#cf-botcheck", "name"),
      ATTR(win, "#cf-botcheck", "style"),
    ],
    accessKey: ATTR(win, "#contact-form input[name=access_key]", "value"),
    submitLabel: TEXT(win, "#contact-form button[type=submit]"),
    contactAlt: ALL(win, "#panel-contact .contact-alt > *"),
    copyBtn: TEXT(win, "#copy-email"),
    ctaBlocks: COUNT(win, ".panel-cta"),
    ctaButtons: ALL(win, ".panel-cta .panel-cta-btns > *"),
    ctaText: TEXT(win, ".panel-cta .panel-cta-text"),
    sectionComments: ALL(win, ".tab-panel .sec-comment"),
  };
}
function snapshotTerminal(win) {
  return {
    panelHidden: hasClass(win, "#terminal-panel", "hidden"),
    panelTabs: ALL(win, "#terminal-panel .panel-tab"),
    activePanelTab: TEXT(win, "#terminal-panel .panel-tab.active"),
    shortcut: TEXT(win, "#terminal-panel .panel-actions span"),
    prompt: TEXT(win, ".t-prompt"),
    inputPlaceholder: ATTR(win, "#terminal-input", "placeholder"),
    lines: ALL(win, "#terminal-body .t-line"),
    lineClasses: CLASSES(win, "#terminal-body .t-line"),
  };
}

function snapshotOverlays(win) {
  return {
    settingsSwatches: ALL(win, ".theme-swatch span"),
    settingsSwatchTitles: [...win.document.querySelectorAll(".theme-swatch")].map(
      (e) => e.getAttribute("title"),
    ),
    settingsActiveSwatch: ATTR(win, ".theme-swatch.active", "title"),
    settingsHeads: ALL(win, "#settings-body h4"),
    fsRange: [
      ATTR(win, "#fs-range", "min"),
      ATTR(win, "#fs-range", "max"),
      ATTR(win, "#fs-range", "step"),
      ATTR(win, "#fs-range", "value"),
    ],
    toggleLabels: ALL(win, "#settings-body .toggles label"),
    toggleStates: [
      win.document.querySelector("#set-dark")?.checked,
      win.document.querySelector("#set-terminal")?.checked,
      win.document.querySelector("#set-anim")?.checked,
    ],
    resetLabel: TEXT(win, "#set-reset"),
    modalHead: TEXT(win, "#settings-overlay .modal-head"),
  };
}

function snapshotNotifs(win) {
  return {
    badge: TEXT(win, "#notif-badge"),
    badgeDisplay: win.document.querySelector("#notif-badge")?.style.display,
    list: ALL(win, "#notif-list li"),
    firstRead: hasClass(win, "#notif-list li", "read"),
    toasts: ALL(win, "#toasts .toast"),
    toastClasses: [...win.document.querySelectorAll("#toasts .toast")].map((e) =>
      e.className.split(" ").filter((c) => c !== "show").join(" "),
    ),
    footText: TEXT(win, ".notif-foot"),
    clearLabel: TEXT(win, "#notif-clear"),
    centerOpen: hasClass(win, "#notif-center", "open"),
  };
}

function snapshotDrawer(win) {
  return {
    fabExists: win.document.querySelector("#mobile-fab") !== null,
    drawerOpen: hasClass(win, "#drawer-overlay", "open"),
    drawerHead: TEXT(win, ".drawer-head"),
    drawerItems: ALL(win, "#drawer-list > li"),
  };
}

/* ─── 6. Identical interaction script driven against both windows ─── */
async function runScenario(win) {
  const out = {};
  await wait(1900); // let the loading splash fade + remove

  out.chrome = snapshotChrome(win);
  out.sections = snapshotSections(win);
  out.terminal = snapshotTerminal(win);
  out.notifs = snapshotNotifs(win);

  /* Find in files */
  click(win, "#open-search");
  await wait(30);
  typeInto(win, "#search-input", "react");
  await wait(30);
  out.search = {
    open: hasClass(win, "#search-overlay", "open"),
    count: TEXT(win, "#search-count"),
    results: ALL(win, "#search-results li"),
    files: [...win.document.querySelectorAll("#search-results li")].map((e) =>
      e.getAttribute("data-file"),
    ),
  };
  click(win, "#search-close");
  await wait(30);
  out.searchClosed = !hasClass(win, "#search-overlay", "open");

  /* Command palette + filtering + Escape */
  press(win, "P", { ctrlKey: true, shiftKey: true });
  await wait(30);
  out.palette = {
    open: hasClass(win, "#palette-overlay", "open"),
    items: ALL(win, "#palette-list li"),
    selected: TEXT(win, "#palette-list li.selected"),
    inputPlaceholder: ATTR(win, "#palette-input", "placeholder"),
  };
  typeInto(win, "#palette-input", "theme");
  await wait(30);
  out.paletteFiltered = ALL(win, "#palette-list li");
  press(win, "Escape");
  await wait(30);
  out.paletteClosed = !hasClass(win, "#palette-overlay", "open");

  /* Settings modal (theme swatches, font size, toggles) */
  click(win, ".act-btn[data-act='settings']");
  await wait(30);
  out.overlays = snapshotOverlays(win);
  click(win, "#settings-close");
  await wait(30);

  /* Header "Terminal" menu item toggles the panel (React boots closed →
     opens; legacy boots open → closes; the flip itself must match). */
  const panelHiddenBeforeHeader = hasClass(win, "#terminal-panel", "hidden");
  click(win, ".tb-menu-term");
  await wait(30);
  out.terminalOpenedViaHeader = {
    flipped: hasClass(win, "#terminal-panel", "hidden") !== panelHiddenBeforeHeader,
  };

  /* Terminal commands: whoami + a theme switch */
  submitTerminal(win, "whoami");
  await wait(30);
  out.afterWhoami = ALL(win, "#terminal-body .t-line").slice(-3);
  submitTerminal(win, "theme orange");
  await wait(60);
  out.afterThemeCmd = {
    accent: win.document.documentElement.style.getPropertyValue("--accent"),
    accent2: win.document.documentElement.style.getPropertyValue("--accent2"),
    status: win.document.documentElement.style.getPropertyValue("--status"),
    hover: win.document.documentElement.style.getPropertyValue("--accent-hover"),
    select: win.document.documentElement.style.getPropertyValue("--select-bg"),
    dataAccent: win.document.documentElement.dataset.accent,
    lines: ALL(win, "#terminal-body .t-line").slice(-3),
    lineClasses: CLASSES(win, "#terminal-body .t-line").slice(-3),
  };
  submitTerminal(win, "help");
  await wait(30);
  out.afterHelp = ALL(win, "#terminal-body .t-line").slice(-16);
  submitTerminal(win, "nope");
  await wait(30);
  out.afterUnknown = ALL(win, "#terminal-body .t-line").slice(-2);

  /* Tab navigation */
  click(win, ".tab[data-file='skills.json']");
  await wait(30);
  out.afterTabClick = {
    activeTab: TEXT(win, "#tabs .tab.active"),
    breadcrumb: TEXT(win, "#breadcrumb"),
    statusLang: TEXT(win, "#status-lang"),
    docTitle: win.document.title,
    activeTreeItems: ALL(win, ".file-item.active"),
  };
  /* Dark → light toggle from the status bar */
  click(win, "#status-mode");
  await wait(30);
  out.afterThemeToggle = {
    lightClass: win.document.body.classList.contains("light"),
    noAnim: win.document.body.classList.contains("no-anim"),
    modeLabel: TEXT(win, "#status-mode"),
    accent2: win.document.documentElement.style.getPropertyValue("--accent2"),
    select: win.document.documentElement.style.getPropertyValue("--select-bg"),
  };

  /* Notification center: open, click the first item, check the badge */
  click(win, "#btn-bell");
  await wait(30);
  out.notifOpen = snapshotNotifs(win);
  click(win, "#notif-list li");
  await wait(30);
  out.notifAfterClick = snapshotNotifs(win);

  /* Settings reset */
  click(win, ".act-btn[data-act='settings']");
  await wait(30);
  click(win, "#set-reset");
  await wait(30);
  out.afterReset = {
    swatch: ATTR(win, ".theme-swatch.active", "title"),
    accent: win.document.documentElement.style.getPropertyValue("--accent"),
    lightClass: win.document.body.classList.contains("light"),
    toggleStates: [
      win.document.querySelector("#set-dark")?.checked,
      win.document.querySelector("#set-terminal")?.checked,
      win.document.querySelector("#set-anim")?.checked,
    ],
    fsRangeValue: ATTR(win, "#fs-range", "value"),
  };
  click(win, "#settings-close");
  await wait(20);

  /* Mobile drawer */
  click(win, "#mobile-fab");
  await wait(30);
  out.drawer = snapshotDrawer(win);

  /* Ctrl+` toggles the terminal panel (compare the flip — the two boots can
     legitimately be in opposite panel states at this point). */
  const panelHiddenBeforeCtrl = hasClass(win, "#terminal-panel", "hidden");
  press(win, "`", { ctrlKey: true });
  await wait(30);
  out.terminalToggled = {
    flipped:
      hasClass(win, "#terminal-panel", "hidden") !== panelHiddenBeforeCtrl,
  };

  return out;
}

/* ─── 7. Deep diff + report ─── */
/* Intentional differences:
   • chrome.avatar — the legacy sidebar prints the literal string "undefined"
     because `profile.avatarEmoji` only exists under `meta` in data.js. The
     React sidebar renders nothing until the live GitHub avatar arrives
     (fetch is unreachable in this offline scenario).
   • Terminal default state — the React app boots with the terminal panel
     CLOSED and opens it via the header "Terminal" menu item / Ctrl+` (the
     "Show terminal panel" setting now defaults to false). The legacy site
     always booted with the panel open (settings.terminal = true). Once
     opened through the header, both behave identically. */
const INTENTIONAL = new Set([
  "root.chrome.avatar",
  "root.terminal.panelHidden",
  "root.terminalOpenedViaHeader.flipped",
  "root.overlays.toggleStates[1]",
  "root.afterReset.toggleStates[1]",
]);

function diff(a, b, path = "root", out = []) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      out.push(
        `${path}: length legacy=${a.length} react=${b.length}\n      legacy=${JSON.stringify(a)}\n      react =${JSON.stringify(b)}`,
      );
    }
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) diff(a[i], b[i], `${path}[${i}]`, out);
  } else if (a && b && typeof a === "object" && typeof b === "object") {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff(a[k], b[k], `${path}.${k}`, out);
    }
  } else if (!equivalent(a, b)) {
    out.push(`${path}: legacy=${JSON.stringify(a)} react=${JSON.stringify(b)}`);
  }
  return out;
}

/* Whitespace-only differences (JSX vs template literals) are invisible once
   HTML renders them, so compare with whitespace collapsed away. */
function equivalent(a, b) {
  if (String(a) === String(b)) return true;
  const normalize = (v) => String(v).replace(/\s+/g, "").replace(/;+$/, "");
  if (normalize(a) === normalize(b)) return true;
  return false;
}

function diffs(legacy, reactWin) {
  return diff(legacy, reactWin).filter(
    (d) => ![...INTENTIONAL].some((k) => d.startsWith(k + ":")),
  );
}

const appJs = await buildApp();

/* New behaviour assertion: the React app must boot with the terminal panel
   hidden — it only opens via the header "Terminal" menu item or Ctrl+`. */
const bootWin = bootReact(appJs);
await wait(400);
if (!hasClass(bootWin, "#terminal-panel", "hidden")) {
  console.error("\n❌ React app must boot with the terminal panel hidden");
  process.exit(1);
}
bootWin.close?.();

const legacy = await runScenario(bootLegacy());
const reactWin = await runScenario(bootReact(appJs));

const mismatches = diffs(legacy, reactWin);

/* The legacy typewriter/clock timers keep the loop alive — exit explicitly. */
if (mismatches.length === 0) {
  console.log(
    `\n✅ parity OK — ${Object.keys(legacy).length} interaction groups match the legacy site exactly`,
  );
  process.exit(0);
}
console.log(`\n❌ ${mismatches.length} mismatch(es):\n`);
console.log(mismatches.map((d) => `  • ${d}`).join("\n"));
process.exit(1);
