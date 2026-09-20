/* ═══════ Resume generator ═══════
   Ported from downloadResume() in the legacy script.js — same plain-text
   layout, same filename, same download mechanism. */
import { D, P, EMAIL, GITHUB } from "./constants.js";

export function buildResumeText({ projects = D.projects, skills = D.skills } = {}) {
  const a = D.about;
  let txt = `${P.name.toUpperCase()}\n${"=".repeat(25)}\n${a.role}\n${P.location} · ${EMAIL}\nGitHub: ${GITHUB}\n\n`;
  txt += "▸ EXPERIENCE\n";
  (D.experience || []).forEach((e) => {
    txt += `\n${e.period}   ${e.role}\n${e.company} — ${e.location}\n`;
    (e.bullets || []).forEach((b) => (txt += `   • ${b}\n`));
  });
  txt += "\n▸ SKILLS\n";
  Object.entries(skills || {}).forEach(
    ([g, list]) => (txt += `${g}: ${(list || []).map((s) => s.name).join(", ")}\n`),
  );
  txt += "\n▸ PROJECTS\n";
  (projects || []).forEach((p) => (txt += `• ${p.title} — ${p.blurb}\n`));
  return txt;
}

export const RESUME_FILENAME = "Milan_Dahal_Resume.txt";

export function downloadResume(options) {
  const blob = new Blob([buildResumeText(options)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = RESUME_FILENAME;
  link.click();
  URL.revokeObjectURL(link.href);
}
