import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

/* The build output lands in the repo root (GitHub Pages serves that root), so
   `emptyOutDir` can't be used — instead delete just the stale hashed bundles
   from a previous build. */
function cleanStaleRootAssets() {
  return {
    name: "clean-stale-root-assets",
    apply: "build",
    buildStart() {
      const dir = path.join(import.meta.dirname, "assets");
      if (!fs.existsSync(dir)) return;
      for (const file of fs.readdirSync(dir)) {
        if (/^index-.*\.(js|css)$/.test(file)) fs.rmSync(path.join(dir, file));
      }
    },
  };
}

/**
 * React rewrite of the legacy static site (index.html + style.css + script.js).
 *
 * The React source lives in ./app, but the build output is written to the repo
 * root (index.html + assets/) so GitHub Pages keeps serving this repository as a
 * plain static site — no Pages setting change, no CI workflow and the existing
 * CNAME keeps working.
 *
 *   npm run dev     → http://localhost:5173 (app/ source, hot reload)
 *   npm run build   → writes ./index.html + ./assets/*  (commit these to deploy)
 */
export default defineConfig({
  root: "app",
  base: "./",
  publicDir: false,
  server: { open: true },
  build: {
    outDir: "..",
    emptyOutDir: false,
    assetsDir: "assets",
  },
});
