import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./premium.css";
import "./luxury.css";
import { initLux } from "./lux";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// люкс-интерактив: курсор, магнитные кнопки, параллакс, счётчики, прелоадер
initLux();
