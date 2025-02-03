import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  server: {
    port: 3000,
    proxy: {
      "/ws": {
        target: "http://localhost:8090",
        ws: true,
      },
      "/api": {
        target: "http://localhost:8090",  
      }
    },
  },
});