import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

/* The legacy cascade order is preserved: style.css first, then the small
   mount-wrapper rule for #root. */
import "./styles/style.css";
import "./styles/app-shell.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
