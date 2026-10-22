import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./premium.css";
import "./luxury.css";
import "../tokens.css";
import "./atelier.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
