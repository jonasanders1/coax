import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Direkte vannvarmere – produkter og modeller",
  description:
    "Se hele utvalget av COAX direkte vannvarmere. Sammenlign energieffektive, tankløse modeller og finn riktig løsning for bolig, hytte eller næringsbygg.",
  keywords: [
    "COAX produkter",
    "direkte vannvarmere",
    "tankløse vannvarmere",
    "elektriske vannvarmere",
    "varmtvannsberedere",
    "COAX modeller",
  ],
  alternates: {
    canonical: `${siteUrl}/produkter`,
  },
  openGraph: {
    title: "COAX | Direkte vannvarmere – produkter og modeller",
    description:
      "Se hele utvalget av COAX direkte vannvarmere. Sammenlign energieffektive, tankløse modeller og finn riktig løsning for bolig, hytte eller næringsbygg.",
    url: `${siteUrl}/produkter`,
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
    title: "COAX | Produkter og modeller",
    description:
      "Se hele utvalget av COAX direkte vannvarmere. Sammenlign energieffektive modeller.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

const ProductsPage = () => {
  return <ProductsClient />;
};

export default ProductsPage;
