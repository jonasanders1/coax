import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";
import Sitemap from "vite-plugin-sitemap";

// Read sitemap routes from generated JSON file
function getSitemapRoutes(): string[] {
  try {
    const routesPath = path.resolve(__dirname, "./src/config/sitemapRoutes.json");
    const routesData = readFileSync(routesPath, "utf-8");
    const routes = JSON.parse(routesData) as string[];
    // Filter out "/" since the plugin automatically adds it, and remove any duplicates
    const filteredRoutes = routes.filter(route => route !== "/");
    return [...new Set(filteredRoutes)];
  } catch (error) {
    console.warn("Could not read sitemapRoutes.json, using fallback routes");
    // Fallback to static routes (excluding "/" as plugin adds it automatically)
    return [
      "/produkter",
      "/velg-modell",
      "/faq",
      "/referanser",
      "/kalkulator",
      "/kontakt",
      "/takk",
    ];
  }
}

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: "https://coax.jonasanders1.com",
      dynamicRoutes: getSitemapRoutes(),
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
