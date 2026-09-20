/* ═══════ Search index (Find in files) ═══════
   Ported from buildSearchIndex() / renderSearch() in the legacy script.js. */
import { D, P, EMAIL, GITHUB, LINKEDIN, FILE_BY_NAME } from "./constants.js";

export function buildSearchIndex(projects = D.projects, skills = D.skills) {
  const index = [];
  const add = (file, text) => {
    if (text) index.push({ file, text: text.toLowerCase(), raw: text });
  };

  add(
    "index.html",
    [P.name, P.status, P.location, P.intro, ...(P.roles || [])].join(" "),
  );

  const a = D.about || {};
  add(
    "about.md",
    [
      a.heading,
      a.role,
      ...(a.paragraphs || []),
      ...(a.languages || []).map((l) => l.name + " " + l.level),
      a.education?.degree,
      a.education?.institute,
    ].join(" "),
  );

  (D.experience || []).forEach((e) =>
    add(
      "experience.json",
      [
        e.role,
        e.company,
        e.location,
        ...(e.bullets || []),
        ...(e.tags || []),
      ].join(" "),
    ),
  );

  Object.values(skills || {}).forEach((list) =>
    (list || []).forEach((s) => add("skills.json", s.name + " " + s.level)),
  );

  (projects || []).forEach((p) =>
    add(
      "projects.json",
      [p.title, p.blurb, p.description, p.category, ...(p.tags || [])].join(" "),
    ),
  );

  add(
    "contact.html",
    [EMAIL, P.location, GITHUB, LINKEDIN, "contact hire email"].join(" "),
  );

  return index;
}

export function searchFiles(index, query, limit = 15) {
  const ql = (query || "").toLowerCase().trim();
  if (!ql) return [];
  return index
    .filter((e) => e.text.includes(ql))
    .map((e) => ({ ...e, idx: e.text.indexOf(ql) }))
    .sort((x, y) => x.idx - y.idx)
    .slice(0, limit);
}

export function snippetFor(entry) {
  const s = entry.idx - 40 > 0 ? "…" : "";
  return s + entry.raw.slice(Math.max(0, entry.idx - 40), entry.idx + 60);
}

export function iconForFile(name) {
  return (FILE_BY_NAME[name] || {}).icon || "md";
}
