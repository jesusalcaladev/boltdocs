import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/node/index.ts",
    "src/node/cli/index.ts",
    "src/client/index.ts",
    "src/client/ssr.tsx",
  ],
  format: ["cjs", "esm"],
  dts: true,
  tsconfig: "./tsconfig.json",
  clean: true,
  external: [
    "vite",
    "react",
    "react-dom",
    "react-router-dom",
    "virtual:boltdocs-routes",
    "virtual:boltdocs-config",
  ],
});
