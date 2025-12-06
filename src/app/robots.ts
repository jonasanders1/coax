import type { MetadataRoute } from "next";

const BASE_URL = "https://coax.jonasanders1.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-coax-42901306604af29408bd13855d63d1df/",
          "/api/",
          "/takk",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

