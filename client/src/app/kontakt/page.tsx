import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "COAX | Kontakt oss for rådgivning og installasjon",
  description:
    "Ta kontakt for hjelp med valg av COAX direkte vannvarmer. Få rådgivning, pristilbud og installasjon via autoriserte fagfolk.",
  alternates: {
    canonical: "/kontakt",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
