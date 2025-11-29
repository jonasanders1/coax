import type { Metadata } from "next";
import { Suspense } from "react";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "COAX | Forbrukskalkulator",
  description:
    "Beregn hvor mye du kan spare med COAX sin tankløse vannvarmer sammenlignet med en tradisjonell varmtvannsbereder. Juster familie- og forbruksdata.",
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

