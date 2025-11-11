import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "COAX | Ofte stilte spørsmål om tankløse vannvarmere",
  description:
    "Få svar på vanlige spørsmål om COAX sine tankløse vannvarmere, installasjon, energi- og kostnadsbesparelser.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}

