import type { Metadata } from "next";
import { Suspense } from "react";
import CalculatorClient from "@/features/calculator/components/CalculatorClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Forbrukskalkulator for tankløs vannvarmer",
  description:
    "Beregn hvor mye du sparer med COAX direkte vannvarmer. Sammenlign strømforbruk, vannforbruk og kostnader med tradisjonell varmtvannsbereder.",
  keywords: [
    "vannvarmer kalkulator",
    "strømforbruk kalkulator",
    "COAX kalkulator",
    "vannvarmer besparelse",
    "energibesparende vannvarmer",
  ],
  alternates: {
    canonical: `${siteUrl}/kalkulator`,
  },
  openGraph: {
    title: "COAX | Forbrukskalkulator for tankløs vannvarmer",
    description:
      "Beregn hvor mye du sparer med COAX direkte vannvarmer. Sammenlign strømforbruk, vannforbruk og kostnader med tradisjonell varmtvannsbereder.",
    url: `${siteUrl}/kalkulator`,
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
    title: "COAX | Forbrukskalkulator",
    description:
      "Beregn hvor mye du sparer med COAX direkte vannvarmer. Sammenlign strømforbruk og kostnader.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <CalculatorClient />
    </Suspense>
  );
}
