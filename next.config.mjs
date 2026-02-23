/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/varingre-produkter.html", destination: "/produkter", permanent: true },
      { source: "/valg-av-modell.html", destination: "/velg-modell", permanent: true },
      { source: "/sposlashrsmaringl-og-svar.html", destination: "/faq", permanent: true },
      { source: "/referanser.html", destination: "/referanser", permanent: true },
      { source: "/kontakt.html", destination: "/kontakt", permanent: true },
      { source: "/hytter-og-fritidsboliger.html", destination: "/produkter", permanent: true },
    ];
  },
};

export default nextConfig;
