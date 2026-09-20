import { useApp } from "../../state/AppContext.jsx";
import { THEMES } from "../../lib/constants.js";

/* ═══════ Settings modal ═══════
   Legacy renderSettings(): colour swatches, editor font size, the three
   toggles and "Reset settings". Each control updates the same persisted
   settings object (and therefore the CSS variables) instantly. */
export default function SettingsModal() {
  const {
    overlays,
    closeOverlay,
    settings,
    setSettings,
    setAccent,
    setDarkMode,
    resetSettings,
    pushToast,
  } = useApp();
  const open = overlays.settings;
  const dark = settings.darkMode !== false;

  const onToggleDark = (checked) => setDarkMode(checked);

  const onReset = () => {
    resetSettings();
    pushToast("info", "Settings reset to defaults");
  };

  return (
    <div
      className={`overlay modal-overlay ${open ? "open" : ""}`}
      id="settings-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeOverlay("settings");
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <span>⚙ Settings</span>
          <button className="close-x" id="settings-close" onClick={() => closeOverlay("settings")}>
            ✕
          </button>
        </div>
        <div className="modal-body" id="settings-body">
          {open && (
            <>
              <div className="set-block">
            <h4>Color Theme</h4>
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className={`theme-swatch ${t.id === settings.accent ? "active" : ""}`}
                  data-theme={t.id}
                  title={t.name}
                  style={{ "--sw": t.accent }}
                  onClick={() => setAccent(t.id)}
                >
                  <i></i>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="set-block">
            <h4>
              Editor Font Size <b id="fs-val">{settings.fontSize}px</b>
            </h4>
            <input
              type="range"
              min="12"
              max="18"
              step="1"
              id="fs-range"
              value={settings.fontSize}
              onChange={(e) =>
                setSettings((s) => ({ ...s, fontSize: +e.target.value }))
              }
            />
          </div>

          <div className="set-block toggles">
            <label>
              <input
                type="checkbox"
                id="set-dark"
                checked={dark}
                onChange={(e) => onToggleDark(e.target.checked)}
              />{" "}
              Dark mode (VS Code theme)
            </label>
            <label>
              <input
                type="checkbox"
                id="set-terminal"
                checked={settings.terminal}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, terminal: e.target.checked }))
                }
              />{" "}
              Show terminal panel
            </label>
            <label>
              <input
                type="checkbox"
                id="set-anim"
                checked={settings.animations}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, animations: e.target.checked }))
                }
              />{" "}
              Enable animations
            </label>
            <button className="btn-ghost small" id="set-reset" onClick={onReset}>
              Reset settings
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
