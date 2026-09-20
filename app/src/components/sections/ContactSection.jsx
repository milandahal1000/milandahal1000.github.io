import { useRef, useState } from "react";
import { useApp } from "../../state/AppContext.jsx";

/* ═══════ Contact section ═══════
   Legacy renderContact() + bindContactForm(): the same form markup and the
   same Web3Forms POST (it mails milandahal685@gmail.com), including the
   "Sending..." button state, success toast + notification and error toasts. */
export default function ContactSection() {
  const {
    D,
    email,
    github,
    linkedin,
    web3formsKey,
    notify,
    pushToast,
    copyEmail,
  } = useApp();
  const P = D.profile;
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);

  /* legacy toast(type, msg) — the <Toasts> component auto-dismisses it */
  const fireToast = (type, message) => pushToast(type, message);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form || sending) return;
    setSending(true);
    try {
      const fd = new FormData(form);
      const json = Object.fromEntries(fd.entries());
      json.access_key = web3formsKey;
      json.subject = `[Portfolio] Message from ${fd.get("name")}`;
      json.from_name = D.meta.name;
      json.replyto = fd.get("email");

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(json),
      });
      const data = await res.json();

      if (data.success) {
        fireToast("success", "Message sent! I'll reply to your email soon 🚀");
        notify(
          "success",
          "Portfolio message sent",
          `${fd.get("name")} <${fd.get("email")}> sent a message — check your inbox.`,
        );
        form.reset();
      } else {
        fireToast(
          "error",
          data.message || "Could not send the message. Please email me directly.",
        );
      }
    } catch {
      fireToast("error", `Network error — contact me directly at ${email}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <p className="sec-comment">// contact.html — get in touch</p>
      <h2>Contact Me</h2>
      <p className="md-sub">Get in contact and let&apos;s work together 🚀</p>

      <form className="form" id="contact-form" ref={formRef} onSubmit={onSubmit}>
        <input type="hidden" name="access_key" value={web3formsKey} />
        <input
          type="checkbox"
          name="botcheck"
          id="cf-botcheck"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="field">
          <label htmlFor="cf-name">const name =</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            placeholder='"Your Name"'
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cf-email">const email =</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            placeholder='"you@example.com"'
            required
          />
        </div>

        <div className="field">
          <label htmlFor="cf-message">const message =</label>
          <textarea
            id="cf-message"
            name="message"
            placeholder='"Hi Milan, I have an opportunity for you..."'
            required
          ></textarea>
        </div>

        <button className="btn-primary" type="submit" disabled={sending}>
          {sending ? "Sending... ⏳" : "Send Message ↵"}
        </button>
      </form>

      <div className="contact-alt">
        <span>
          📧 <a href={`mailto:${email}`}>{email}</a>
        </span>
        <button className="copy-btn" id="copy-email" type="button" onClick={copyEmail}>
          copy email
        </button>
        <span>📍 {P.location}</span>
        <span>
          🐙{" "}
          <a href={github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </span>
        <span>
          💼{" "}
          <a href={linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </span>
      </div>
    </>
  );
}
