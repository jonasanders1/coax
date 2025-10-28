import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import Sitemap from "vite-plugin-sitemap";
import { sitemapRoutes } from "./src/config/sitemap";

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: "https://coax.jonasanders1.com",
      dynamicRoutes: sitemapRoutes,
      generateRobotsTxt: true,
      outDir: "dist",
    }),
  ],
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
