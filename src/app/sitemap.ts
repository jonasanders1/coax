import type { MetadataRoute } from "next";
import sitemapRoutes from "@/config/sitemapRoutes.json";

const BASE_URL = "https://coax.jonasanders1.com";

const UNIQUE_ROUTES = Array.from(new Set(["/", ...sitemapRoutes]));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return UNIQUE_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.startsWith("/") ? route : `/${route}`}`,
    lastModified,
  }));
}

