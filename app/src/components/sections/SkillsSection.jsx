import { useEffect, useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import CtaBlock from "./CtaBlock.jsx";

/* ═══════ Skills section ═══════
   Legacy renderSkills()/animateBars(): languages get animated bars (with the
   staggered 60ms transition delay); frontend/backend/tools are chip groups. */
export default function SkillsSection() {
  const { skills } = useApp();
  const [filled, setFilled] = useState(false);

  /* animateBars(): width is applied on the next frame so CSS transitions run. */
  useEffect(() => {
    setFilled(false);
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, [skills]);

  const barGroup = (title, list, cls) => (
    <div className="skill-group">
      <h4>// {title}</h4>
      <div className={`skill-bars ${cls}`}>
        {(list || []).map((s, i) => (
          <div className="sbar" key={s.name}>
            <div className="sbar-head">
              <span>{s.name}</span>
              <b>{s.level}%</b>
            </div>
            <div className="sbar-track">
              <div
                className="sbar-fill"
                data-w={s.level}
                style={{
                  width: filled ? `${s.level}%` : 0,
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const chipGroup = (title, list, cls) => (
    <div className="skill-group">
      <h4>// {title}</h4>
      <div className="chips">
        {(list || []).map((s) => (
          <span className={`chip ${cls}`} key={s.name}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );

  const S = skills || {};

  return (
    <>
      <p className="sec-comment">// skills.json — tech stack</p>
      <h2>Skills</h2>
      <p className="md-sub">
        Under the hood: <em>Languages</em> with proficiency, plus the{" "}
        <em>tools</em> I use every day.
      </p>
      {barGroup("Programming Languages", S.languages, "lang")}
      {chipGroup("Frontend", S.frontend, "front")}
      {chipGroup("Backend", S.backend, "back")}
      {chipGroup("Tools & Platforms", S.tools, "tool")}
      <CtaBlock />
    </>
  );
}
