/* @refresh reload */
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, useRoutes } from "react-router-dom";
import "./index.css";
import { routes } from "./routes";
import * as Sentry from "@sentry/react";
import { envConfig } from "./envConfig";
import { USE_SENTRY } from "./config";
import { AuthMode } from "./types/auth";

// Set font URL based on environment
const font =
  "family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cinzel:wght@500;700&display=swap";
const fontUrl =
  import.meta.env.DEV || envConfig.authMode != AuthMode.DiscordEmbedded
    ? `https://fonts.googleapis.com/css2?${font}`
    : `/fonts-styles/css2?${font}`;

// Add font stylesheet
const fontStylesheet = document.createElement("link");
fontStylesheet.rel = "stylesheet";
fontStylesheet.href = fontUrl;
document.head.appendChild(fontStylesheet);

// Font loading detection
const fontLoadingScript = document.createElement("script");
fontLoadingScript.textContent = `
  (function() {
    function onFontsLoaded() {
      document.documentElement.classList.add('wf-active');
    }

    if (document.fonts) {
      document.fonts.ready.then(onFontsLoaded);
    } else {
      // Fallback for browsers that don't support document.fonts
      setTimeout(onFontsLoaded, 1000);
    }
  })();
`;
document.head.appendChild(fontLoadingScript);

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

// If backend url is set then probably testing on mobile, so log errors to sentry
if (USE_SENTRY) {
  console.log("Logging errors to sentry");
  Sentry.init({
    dsn: "https://052dd47cd9b62719ea8864353ab3b2d3@o4509174697623552.ingest.de.sentry.io/4509174698868816",
  });
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
  root,
);
