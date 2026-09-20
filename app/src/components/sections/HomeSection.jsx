import { useEffect, useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import CtaBlock from "./CtaBlock.jsx";

/* ═══════ Home / hero section ═══════
   Legacy renderHome() + startTypewriter(): identical markup, identical
   typewriter timing (95ms type, 45ms delete, 1800ms hold). */
function useTypewriter(roles) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!roles || !roles.length) return;
    let r = 0;
    let c = 0;
    let deleting = false;
    let timer = null;

    const tick = () => {
      const word = roles[r];
      setText(word.slice(0, c));
      if (!deleting) {
        c++;
        if (c > word.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
      } else {
        c -= 1;
        if (c === 0) {
          deleting = false;
          r = (r + 1) % roles.length;
        }
      }
      timer = setTimeout(tick, deleting ? 45 : 95);
    };

    tick();
    return () => clearTimeout(timer);
  }, [roles]);

  return text;
}

export default function HomeSection() {
  const { D, stats, goToFile, downloadResume, github, linkedin } = useApp();
  const P = D.profile;
  const typed = useTypewriter(P.roles);

  return (
    <div className="hero">
      <p className="hero-comment">{P.hello}</p>
      <h1 className="hero-name">
        {P.name} <span className="wave">{P.wave}</span>
      </h1>
      <p className="hero-line">
        {P.status} /{" "}
        <span className="typewriter" id="typewriter">
          {typed}
        </span>
        <span className="caret"></span>
      </p>
      <p className="hero-desc">{P.intro}</p>
      <div className="hero-stats">
        {(stats || []).map((s) => (
          <div className="stat" key={s.label}>
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="hero-actions">
        <button
          className="btn-primary"
          data-file="contact.html"
          onClick={() => goToFile("contact.html")}
        >
          Contact Me
        </button>
        <button
          className="btn-ghost"
          data-action="resume"
          onClick={downloadResume}
        >
          ⤓ Resume
        </button>
        <a className="btn-ghost" href={github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="btn-ghost" href={linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
      <p className="hero-footer">
        ↓ navigate with the file explorer, tabs, search, or Ctrl+Shift+P
      </p>
      <CtaBlock />
    </div>
  );
}
