import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

window.addEventListener("error", (e) => {
  const isChunkError =
    e.message?.includes("Failed to fetch dynamically imported module") ||
    e.message?.includes("Importing a module script failed");
  if (isChunkError && !sessionStorage.getItem("chunk-reload")) {
    sessionStorage.setItem("chunk-reload", "1");
    window.location.reload();
  }
});

if (import.meta.env.PROD) {
  const required = ["VITE_API_URL"] as const;
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    throw new Error(`[startup] Missing required environment variables: ${missing.join(", ")}`);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
