import { useApp } from "../../state/AppContext.jsx";
import CtaBlock from "./CtaBlock.jsx";

/* ═══════ About section ═══════
   Legacy renderAbout(): heading, markdown-style paragraphs, languages /
   education / location grid and the optional interests chips. */
export default function AboutSection() {
  const { D } = useApp();
  const a = D.about;
  const P = D.profile;
  const tags = a.tags || [];

  return (
    <>
      <p className="sec-comment">// about.md — rendered preview</p>
      <h2>About Me</h2>
      <p className="md-sub">{a.heading}</p>
      <h3 className="md-name">
        <span className="hash">#</span> {P.name}
      </h3>
      <p className="md-sub role-line">{a.role}</p>

      {(a.paragraphs || []).map((p) => (
        <p className="md-body" key={p}>
          {p}
        </p>
      ))}

      <div className="about-grid">
        <div>
          <h4>▪ Languages</h4>
          <ul>
            {(a.languages || []).map((l) => (
              <li key={l.name}>
                {l.name} — {l.level}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>▪ Education</h4>
          <ul>
            <li>
              {a.education.degree} — {a.education.institute}
            </li>
            <li>{a.education.city}</li>
          </ul>
        </div>
        <div>
          <h4>▪ Location</h4>
          <ul>
            <li>{a.location.city} 🇳🇵</li>
            <li>Timezone — {a.location.tz}</li>
          </ul>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="about-tags">
          <h4>▪ Interests</h4>
          <div className="chips">
            {tags.map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <CtaBlock />
    </>
  );
}
