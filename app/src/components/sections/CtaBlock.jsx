import { useApp } from "../../state/AppContext.jsx";

/* ═══════ Shared contact CTA (end of every section) ═══════
   Legacy ctaBlock() — same markup, same copy. */
export default function CtaBlock() {
  const { goToFile, email } = useApp();
  return (
    <div className="panel-cta">
      <div className="panel-cta-text">
        <strong>Have a project in mind? Let&apos;s talk 🚀</strong>
        <span>
          Available for freelance &amp; full-time work in Kathmandu and remotely.
        </span>
      </div>
      <div className="panel-cta-btns">
        <button
          className="btn-primary"
          data-file="contact.html"
          onClick={() => goToFile("contact.html")}
        >
          Contact Me
        </button>
        <a className="btn-ghost" href={`mailto:${email}`}>
          ✉ {email}
        </a>
      </div>
    </div>
  );
}
