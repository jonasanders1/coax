import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "COAX | FAQ om direkte vannvarmere uten tank",
  description:
    "Få svar på vanlige spørsmål om COAX direkte vannvarmere – installasjon, strømkrav, effektivitet, vannkvalitet og besparelser.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
