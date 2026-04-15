import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base keeps asset URLs valid for both root and project GitHub Pages sites.
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
  },
});
