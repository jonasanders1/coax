import type { Metadata } from "next";
import ReferencesClient from "./ReferencesClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Erfaringer fra fornøyde kunder",
  description:
    "Les historier fra hytter, boliger og næringsbygg som har valgt COAX sine tankløse vannvarmere for effektivt varmtvann.",
  keywords: [
    "COAX referanser",
    "kundetilbakemeldinger",
    "vannvarmer anmeldelser",
    "COAX kunder",
    "tankløs vannvarmer erfaringer",
  ],
  alternates: {
    canonical: `${siteUrl}/referanser`,
  },
  openGraph: {
    title: "COAX | Erfaringer fra fornøyde kunder",
    description:
      "Se hvor COAX har installert sine tankløse vannvarmere i hytter, boliger og næringsbygg.",
    url: `${siteUrl}/referanser`,
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
    title: "COAX | Erfaringer fra fornøyde kunder",
    description:
      "Se hvor COAX har installert sine tankløse vannvarmere i hytter, boliger og næringsbygg.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function ReferencesPage() {
  return <ReferencesClient />;
}

