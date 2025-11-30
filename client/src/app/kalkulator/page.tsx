import type { Metadata } from "next";
import { Suspense } from "react";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "COAX | Forbrukskalkulator for tankløs vannvarmer",
  description:
    "Beregn hvor mye du sparer med COAX direkte vannvarmer. Sammenlign strømforbruk, vannforbruk og kostnader med tradisjonell varmtvannsbereder.",
  alternates: {
    canonical: "/kalkulator",
  },
};

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <CalculatorClient />
    </Suspense>
  );
}
