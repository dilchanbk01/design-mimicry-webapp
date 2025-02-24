
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
  preview: {
    port: 8080,
    strictPort: true,
  },
  server: {
    port: 8080,
    host: true,
    strictPort: true,
    // Handle client-side routing
    middleware: [
      (req, res, next) => {
        // Serve index.html for any non-asset requests
        if (!req.url.includes('.')) {
          req.url = '/';
        }
        next();
      }
    ]
  },
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
