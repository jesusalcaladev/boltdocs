import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import boltdocs from "boltdocs";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    boltdocs({
      homePage: "./src/HomePage.tsx",
    }),
  ],
});
