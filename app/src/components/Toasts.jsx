import { useEffect, useState } from "react";
import { useApp } from "../state/AppContext.jsx";

/* ═══════ Toasts ═══════
   Legacy toast(): slide in, auto-dismiss after 4.2s, then remove. */
function Toast({ toast, onDone }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true));
    const hide = setTimeout(() => setShow(false), 4200);
    const remove = setTimeout(() => onDone(toast.id), 4550);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [onDone, toast.id]);

  return (
    <div className={`toast ${toast.type} ${show ? "show" : ""}`}>
      <span className="toast-ico">
        {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
      </span>
      <span>{toast.msg}</span>
    </div>
  );
}

export default function Toasts() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toasts" id="toasts">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={removeToast} />
      ))}
    </div>
  );
}
