import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "COAX | Kontakt oss for rådgivning og tilbud",
  description:
    "Kontakt COAX for rådgivning, pris og installasjon av tankløse varmtvannsberedere. Fyll ut skjema eller ring oss direkte.",
  alternates: {
    canonical: "/kontakt",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

