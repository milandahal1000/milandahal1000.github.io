/* ═══════ Terminal state ═══════
   Port of tprint()/toggleTerminal()/runCommand()/matrixRain() from the legacy
   script.js — same commands, same output text, same colours (t-line classes). */
import { useCallback, useEffect, useRef, useState } from "react";
import { D, EMAIL, GITHUB, LINKEDIN, kathmanduTime } from "../lib/constants.js";

export function useTerminal({
  settings,
  setDarkMode,
  setAccent,
  openFile,
  downloadResume,
}) {
  const [lines, setLines] = useState([]);
  const [open, setOpen] = useState(false); // always closed on first load
  const lineId = useRef(0);
  const matrixTimer = useRef(null);

  /* The "Show terminal panel" setting drives visibility (legacy applySettings). */
  useEffect(() => {
    setOpen(settings.terminal);
  }, [settings.terminal]);

  useEffect(() => () => clearInterval(matrixTimer.current), []);

  const print = useCallback((text, cls = "info") => {
    setLines((prev) => [...prev, { id: ++lineId.current, text, cls }]);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const toggle = useCallback((force) => {
    setOpen((cur) => (force === undefined ? !cur : force));
  }, []);

  const matrixRain = useCallback(() => {
    setLines([]);
    clearInterval(matrixTimer.current);
    let runs = 0;
    matrixTimer.current = setInterval(() => {
      let row = "";
      for (let i = 0; i < 46; i++) row += Math.random() > 0.5 ? "1" : "0";
      setLines((prev) => [...prev, { id: ++lineId.current, text: row, cls: "matrix" }]);
      if (++runs > 30) {
        clearInterval(matrixTimer.current);
        print("Wake up, Neo... ☕", "ok");
      }
    }, 70);
  }, [print]);

  const runCommand = useCallback(
    (raw) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;
      print(`milan@portfolio:~$ ${raw}`, "cmd");
      const p = D.profile;
      switch (cmd.split(" ")[0]) {
        case "help":
        case "?":
          print("Available commands:");
          [
            "help      — show this list",
            "whoami    — who is Milan?",
            "about     — quick bio",
            "experience— work history",
            "skills    — tech stack",
            "projects  — my work list",
            "education — study background",
            "email     — get email",
            "socials   — GitHub / LinkedIn",
            "resume    — download resume",
            "theme <id>— blue|orange|purple|green|red|cyan | dark/light",
            "hire      — open contact form",
            "matrix    — 🥷 wake up...",
            "clear     — clear terminal",
            "date      — Kathmandu time",
          ].forEach((l) => print("  " + l));
          break;
        case "whoami":
          print(`${p.name} — ${D.about.role} from ${p.location} ${D.meta.flag}`, "ok");
          break;
        case "about":
          (D.about.paragraphs || []).forEach((x) => print(x, "info"));
          break;
        case "experience":
          (D.experience || []).forEach((e) =>
            print(`${e.period} — ${e.role} @ ${e.company}`, "ok"),
          );
          break;
        case "skills":
          Object.entries(D.skills || {}).forEach(([g, list]) =>
            print(
              `${g}: ${list.map((s) => `${s.name} ${s.level}%`).join(" · ")}`,
              "ok",
            ),
          );
          break;
        case "projects":
          (D.projects || []).forEach((x) =>
            print(`${x.emoji} ${x.title} [${x.category}]`, "ok"),
          );
          break;
        case "education":
          print(
            `${D.about.education.degree} — ${D.about.education.institute}, ${D.about.education.city}`,
            "ok",
          );
          break;
        case "email":
          print(EMAIL, "ok");
          break;
        case "socials":
          print("GitHub: " + GITHUB, "ok");
          print("LinkedIn: " + LINKEDIN, "ok");
          break;
        case "resume":
          print("Generating resume... 📄", "info");
          downloadResume();
          break;
        case "theme": {
          const arg = cmd.split(" ")[1];
          if (arg === "dark" || arg === "light") {
            setDarkMode(arg === "dark");
            print(
              `Mode set to ${arg} mode. ${arg === "dark" ? "🌙" : "☀️"}`,
              "ok",
            );
          } else {
            const t = setAccent(arg || settings.accent);
            if (!t) print(`Unknown theme: ${arg}`, "err");
          }
          break;
        }
        case "matrix":
          matrixRain();
          break;
        case "hire":
          print("Excellent choice! Opening contact form... 🚀", "ok");
          openFile("contact.html");
          break;
        case "clear":
          clear();
          break;
        case "date":
          print(kathmanduTime(), "ok");
          break;
        default:
          print(`command not found: ${cmd} — type 'help'`, "err");
      }
    },
    [
      clear,
      downloadResume,
      matrixRain,
      openFile,
      print,
      setAccent,
      setDarkMode,
      settings.accent,
    ],
  );

  return { lines, open, print, clear, toggle, runCommand, matrixRain };
}
