import type { Metadata } from "next";
import FAQClient from "./FAQClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | FAQ om direkte vannvarmere uten tank",
  description:
    "Få svar på vanlige spørsmål om COAX direkte vannvarmere – installasjon, strømkrav, effektivitet, vannkvalitet og besparelser.",
  keywords: [
    "COAX FAQ",
    "direkte vannvarmer spørsmål",
    "tankløs vannvarmer hjelp",
    "vannvarmer installasjon",
    "elektrisk vannvarmer",
    "varmtvannsbereder",
  ],
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
  openGraph: {
    title: "COAX | FAQ om direkte vannvarmere uten tank",
    description:
      "Få svar på vanlige spørsmål om COAX direkte vannvarmere – installasjon, strømkrav, effektivitet, vannkvalitet og besparelser.",
    url: `${siteUrl}/faq`,
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
    title: "COAX | FAQ om direkte vannvarmere",
    description:
      "Få svar på vanlige spørsmål om COAX direkte vannvarmere – installasjon, strømkrav, effektivitet og besparelser.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
