
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: "::",
    proxy: {
      // Handle client-side routing by proxying all non-file requests to index.html
      "^(?!.*\\.).*": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: () => "/index.html",
      },
    },
  },
});
