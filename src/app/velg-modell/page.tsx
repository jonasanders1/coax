import type { Metadata } from "next";
import ModelSelectorClient from "@/features/model-selector/components/ModelSelectorClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Finn riktig direkte vannvarmer – Bøttemetoden",
  description:
    "Finn riktig COAX vannvarmer med Bøttemetoden. Mål vannmengden på 10 liter og få anbefalt modell basert på strømtilgang og varmtvannsbehov.",
  keywords: [
    "COAX modellvelger",
    "bøttemetoden",
    "velg vannvarmer",
    "vannvarmer anbefaling",
    "COAX kalkulator",
  ],
  alternates: {
    canonical: `${siteUrl}/velg-modell`,
  },
  openGraph: {
    title: "COAX | Finn riktig direkte vannvarmer – Bøttemetoden",
    description:
      "Finn riktig COAX vannvarmer med Bøttemetoden. Mål vannmengden på 10 liter og få anbefalt modell basert på strømtilgang og varmtvannsbehov.",
    url: `${siteUrl}/velg-modell`,
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
    title: "COAX | Finn riktig vannvarmer",
    description:
      "Finn riktig COAX vannvarmer med Bøttemetoden. Mål vannmengden og få anbefalt modell.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

const ProductsPage = () => {
  return <ModelSelectorClient />;
};

export default ProductsPage;
