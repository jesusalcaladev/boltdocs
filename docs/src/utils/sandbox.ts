import { defineSandbox, SandboxOptions, SandboxFiles } from "boltdocs/client";

/**
 * Custom integration for Boltdocs documentation.
 * This is how developers use our generic API to create their own project-specific sandboxes.
 */
export function openBoltdocsSandbox(
  code: string,
  options: SandboxOptions = {},
) {
  const boltdocsFiles: SandboxFiles = {
    "public/index.html": {
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.title || "Boltdocs Playground"}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
    "src/main.tsx": {
      content: `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
    },
    "src/App.tsx": {
      content: code,
    },
    "src/index.css": {
      content: `@import "boltdocs/client/index.css";\n\nbody {\n  margin: 0;\n  background: #000;\n  color: #fff;\n}`,
    },
    "vite.config.ts": {
      content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import boltdocs from "boltdocs";

export default defineConfig({
  plugins: [
    react(),
    boltdocs({
      homePage: "./src/App.tsx",
    }),
  ],
});`,
    },
    "boltdocs.config.js": {
      content: `export default {
  title: '${options.title || "Boltdocs Playground"}',
  themeConfig: {
    navbar: [],
    tabs: []
  }
};`,
    },
  };

  const { url } = defineSandbox({
    ...options,
    files: { ...boltdocsFiles, ...options.files },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "latest",
      boltdocs: "latest",
      ...options.dependencies,
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "latest",
      typescript: "latest",
      vite: "latest",
      ...options.devDependencies,
    },
  });

  if (typeof window !== "undefined") {
    window.open(url, "_blank");
  }
}
