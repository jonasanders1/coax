import type { Metadata } from "next";
import ModelSelectorClient from "./ModelSelectorClient";

export const metadata: Metadata = {
  title: "COAX | Finn riktig modell med Bøttemetoden",
  description:
    "Bruk COAX sin bøttemetode-kalkulator for å finne riktig tankløse vannvarmer basert på vannmengde. Perfekt for hytte, bolig og yrkesbygg.",
  alternates: {
    canonical: "/velg-modell",
  },
};

export default function ModelSelectorPage() {
  return <ModelSelectorClient />;
}

