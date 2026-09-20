/* ═══════ Settings + theme state ═══════
   React port of loadSettings()/saveSettings()/applySettings()/toggleDark()/
   setAccent() from the legacy script.js. The CSS custom properties, the
   `light` / `no-anim` body classes and localStorage keep working exactly the
   same, so style.css needed no changes. */
import { useCallback, useEffect, useState } from "react";
import {
  THEMES,
  LIGHT_ACCENTS,
  defaultSettings,
  loadSettings,
  saveSettings,
} from "../lib/constants.js";

/* The only piece of the legacy applySettings() that has to touch the DOM
   (CSS variables + body classes). Everything else is now rendered by React. */
export function applySettingsToDocument(settings) {
  const t = THEMES.find((x) => x.id === settings.accent) || THEMES[0];
  const dark = settings.darkMode !== false;
  const l = LIGHT_ACCENTS[t.id] || LIGHT_ACCENTS.blue;
  const r = document.documentElement.style;
  r.setProperty("--accent", t.accent);
  r.setProperty("--accent2", dark ? t.accent2 : l.a2);
  r.setProperty("--status", t.status);
  r.setProperty("--accent-hover", t.hover);
  r.setProperty("--select-bg", dark ? t.select : l.sel);
  document.documentElement.dataset.accent = t.id;
  r.setProperty("--fs", settings.fontSize + "px");
  document.body.classList.toggle("no-anim", !settings.animations);
  document.body.classList.toggle("light", !dark);
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    applySettingsToDocument(settings);
  }, [settings]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const toggleDark = useCallback(() => {
    setSettings((s) => ({ ...s, darkMode: s.darkMode !== false ? false : true }));
  }, []);

  const setDarkMode = useCallback((dark) => {
    setSettings((s) => ({ ...s, darkMode: dark }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);

  /* Returns the theme (or null when the id is unknown — the caller prints the
     "Unknown theme" terminal error, mirroring the legacy behaviour). */
  const setAccent = useCallback((id) => {
    const t = THEMES.find((x) => x.id === id);
    if (!t) return null;
    setSettings((s) => ({ ...s, accent: id }));
    document.body.classList.add("pop");
    setTimeout(() => document.body.classList.remove("pop"), 400);
    return t;
  }, []);

  return {
    settings,
    setSettings,
    toggleDark,
    setDarkMode,
    resetSettings,
    setAccent,
  };
}
