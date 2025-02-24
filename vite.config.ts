
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Connect } from 'vite';
import type { ServerResponse, IncomingMessage } from 'http';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
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
    host: "::",
    // Handle client-side routing
    middleware: (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
      // Serve index.html for any non-asset requests
      if (!req.url?.includes('.')) {
        req.url = '/';
      }
      next();
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
}));
