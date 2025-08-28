import { BaseStyles, ThemeProvider } from "@primer/react";
import React from "react";
import { createRoot } from "react-dom/client";
import { CookieManager } from "./components";
import "./styles/theme.scss";

const root = createRoot(document.getElementById("root")!);

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

root.render(
  <React.StrictMode>
    <ThemeProvider colorMode={prefersDark ? "night" : "day"} preventSSRMismatch>
      <BaseStyles>
        <CookieManager />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>
);
