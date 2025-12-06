import type { Metadata } from "next";
import { Suspense } from "react";
import AdvancedParametersClient from "@/features/calculator/components/AdvancedParametersClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Innstillinger for kalkulatoren",
  description:
    "Tilpass alle beregningsparametere for mer nøyaktige beregninger. Juster strømpris, vannpris og andre faktorer i COAX kalkulator.",
  keywords: [
    "COAX kalkulator innstillinger",
    "kalkulator parametere",
    "tilpass kalkulator",
    "avanserte innstillinger",
  ],
  alternates: {
    canonical: `${siteUrl}/kalkulator/innstillinger`,
  },
  openGraph: {
    title: "COAX | Innstillinger for kalkulatoren",
    description:
      "Tilpass alle beregningsparametere for mer nøyaktige beregninger.",
    url: `${siteUrl}/kalkulator/innstillinger`,
    type: "website",
    siteName: "COAX",
    images: [
      {
        url: `${siteUrl}/ogImage.png`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COAX | Kalkulator innstillinger",
    description:
      "Tilpass alle beregningsparametere for mer nøyaktige beregninger.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function AdvancedParametersPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <AdvancedParametersClient />
    </Suspense>
  );
}

