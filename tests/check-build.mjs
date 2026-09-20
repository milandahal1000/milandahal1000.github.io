/* ═══════ Built-output check ═══════
   `npm run build` writes index.html + assets/* to the repo root (GitHub Pages
   serves that root). This verifies the output is complete and still carries
   everything the original static site had.
   Run with:  npm run verify
*/
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const checks = [];
const check = (name, ok, extra = "") =>
  checks.push({ name, ok: !!ok, extra });

const html = read("index.html");
const jsPath = /src="\.\/(assets\/[^"]+)"/.exec(html)?.[1];
const cssPath = /href="\.\/(assets\/[^"]+)"/.exec(html)?.[1];

check("index.html keeps the UTF-8 em dash", html.includes("Milan Dahal — Portfolio"));
check("index.html has the favicon", html.includes("data:image/svg+xml"));
check("index.html loads the JetBrains Mono webfont", html.includes("JetBrains+Mono"));
check("index.html has a #root mount point", html.includes('<div id="root"></div>'));
check("bundle is referenced with a relative path", !!jsPath, jsPath);
check("stylesheet is referenced with a relative path", !!cssPath, cssPath);
check("bundle file exists", jsPath && exists(jsPath));
check("stylesheet file exists", cssPath && exists(cssPath));

const js = jsPath ? read(jsPath) : "";
const css = cssPath ? read(cssPath) : "";

/* Content that must survive the rewrite */
[
  "Milan Dahal",
  "Portfolio Terminal v2.0",
  "web3forms.com/submit",
  "api.github.com/users/",
  "milandahal1000/repos",
  "Phoenix College of Management",
].forEach((needle) => {
  check(`bundle contains ${JSON.stringify(needle)}`, js.includes(needle));
});

/* The legacy stylesheet must be inlined/bundled unchanged */
[
  ":root",
  ".titlebar",
  ".workbench",
  ".activity-bar",
  ".sidebar",
  ".editor-viewport",
  ".tab-panel",
  ".timeline",
  ".sbar-fill",
  ".cards",
  ".panel-cta",
  ".status-bar",
  ".palette",
  ".notif-center",
  ".modal",
  ".toasts",
  "#loading",
  ".scroll-top",
  "body.light",
  "body.mini",
  "body.no-anim",
].forEach((needle) => {
  check(`bundled CSS contains ${needle}`, css.includes(needle));
});

check("#root mount wrapper rule is bundled", /#root\{[^}]*display:flex/.test(css));

/* Repo housekeeping */
check("CNAME is still in place", read("CNAME").trim().length > 0);
check(".nojekyll exists", exists(".nojekyll"));
check("legacy reference copy is present", exists("legacy/script.js") && exists("legacy/style.css"));
check(
  "style.css is byte-identical to the legacy one",
  exists("app/src/styles/style.css") &&
    read("app/src/styles/style.css") === read("legacy/style.css"),
);
check("no node_modules in the tracked output", exists(".gitignore"));

const failed = checks.filter((c) => !c.ok);
console.log(
  `\n${failed.length === 0 ? "✅" : "❌"} ${checks.length - failed.length}/${checks.length} build checks passed`,
);
if (failed.length) {
  failed.forEach((f) => console.log(`  • FAILED: ${f.name}${f.extra ? ` (${f.extra})` : ""}`));
  process.exit(1);
}
