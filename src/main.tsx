import { createRoot } from "react-dom/client";
import { initGA, logPageView } from "./analytics/ga";
import App from "./App.tsx";
import { router } from "./App";
import React from "react";

initGA();

// Subscribe to route changes
router.subscribe(() => {
  const currentLocation = window.location.pathname + window.location.search;
  logPageView(currentLocation);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
