import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Kontakt oss for rådgivning og installasjon",
  description:
    "Ta kontakt for hjelp med valg av COAX direkte vannvarmer. Få rådgivning, pristilbud og installasjon via autoriserte fagfolk.",
  keywords: [
    "COAX kontakt",
    "vannvarmer rådgivning",
    "COAX installasjon",
    "kontakt COAX",
    "vannvarmer pristilbud",
  ],
  alternates: {
    canonical: `${siteUrl}/kontakt`,
  },
  openGraph: {
    title: "COAX | Kontakt oss for rådgivning og installasjon",
    description:
      "Ta kontakt for hjelp med valg av COAX direkte vannvarmer. Vi gir deg rådgivningen du trenger.",
    url: `${siteUrl}/kontakt`,
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
    title: "COAX | Kontakt oss",
    description:
      "Ta kontakt for hjelp med valg av COAX direkte vannvarmer. Få rådgivning og pristilbud.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
