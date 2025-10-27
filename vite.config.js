import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    watch: {
      usePolling: true,       // 🔥 indispensable pour Docker Desktop
      interval: 1000,         // vérifie les changements toutes les 1 seconde
    },
  },
});