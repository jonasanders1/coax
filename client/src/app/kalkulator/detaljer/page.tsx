import type { Metadata } from "next";
import CalculationDetailsClient from "./CalculationDetailsClient";

export const metadata: Metadata = {
  title: "COAX | detaljer for kalkulatoren vår",
  description:
    "Omfattende beskrivelse av kalkulatorens forutsetninger, beregninger og begrunnelser",
  alternates: {
    canonical: "/kalkulator/detaljer",
  },
};

export default function CalculationDetailsPage() {
  return <CalculationDetailsClient />;
}
