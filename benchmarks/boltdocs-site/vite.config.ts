import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import boltdocs from "boltdocs";

export default defineConfig({
  plugins: [react(), boltdocs()],
});
