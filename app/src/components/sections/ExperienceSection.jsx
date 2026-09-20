import { useApp } from "../../state/AppContext.jsx";
import CtaBlock from "./CtaBlock.jsx";

/* ═══════ Experience section ═══════
   Legacy renderExperience(): the vertical timeline of t-item / t-card blocks. */
export default function ExperienceSection() {
  const { D } = useApp();

  return (
    <>
      <p className="sec-comment">// experience.json — work history</p>
      <h2>Work Experience</h2>
      <p className="md-sub">
        Developer with a passion for building things for the web
      </p>
      <div className="timeline">
        {(D.experience || []).map((e) => (
          <div className="t-item" key={`${e.period}-${e.role}`}>
            <span className="t-dot"></span>
            <div className="t-card">
              <div className="t-period">{e.period}</div>
              <h3>{e.role}</h3>
              <div className="t-company">
                {e.company} · {e.location}
              </div>
              <ul>
                {(e.bullets || []).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="tags">
                {(e.tags || []).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CtaBlock />
    </>
  );
}
