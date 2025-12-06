import type { Metadata } from "next";
import ThanksClient from "./ThanksClient";

export const metadata: Metadata = {
  title: "COAX | Takk for meldingen din",
  description:
    "Takk for at du kontaktet COAX. Vi tar kontakt så raskt som mulig.",
  alternates: {
    canonical: "/takk",
  },
  robots: {
    index: false,
    follow: false,
  },
};
export default function ThanksPage() {
  return <ThanksClient />;
}

