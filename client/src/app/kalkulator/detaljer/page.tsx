import type { Metadata } from "next";
import CalculationDetailsClient from "./CalculationDetailsClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Detaljer for kalkulatoren vår",
  description:
    "Omfattende beskrivelse av kalkulatorens forutsetninger, beregninger og begrunnelser. Lær hvordan COAX kalkulator beregner strømforbruk og besparelser.",
  keywords: [
    "COAX kalkulator detaljer",
    "vannvarmer beregninger",
    "kalkulator forutsetninger",
    "strømforbruk beregning",
  ],
  alternates: {
    canonical: `${siteUrl}/kalkulator/detaljer`,
  },
  openGraph: {
    title: "COAX | Detaljer for kalkulatoren vår",
    description:
      "Omfattende beskrivelse av kalkulatorens forutsetninger, beregninger og begrunnelser.",
    url: `${siteUrl}/kalkulator/detaljer`,
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
    title: "COAX | Kalkulator detaljer",
    description:
      "Lær hvordan COAX kalkulator beregner strømforbruk og besparelser.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function CalculationDetailsPage() {
  return <CalculationDetailsClient />;
}
