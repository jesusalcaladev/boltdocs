import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import litedocs from "litedocs";

export default defineConfig({
  plugins: [react(), litedocs()],
});
