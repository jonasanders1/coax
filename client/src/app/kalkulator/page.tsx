import type { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "COAX | Sparekalkulator for tankløse vannvarmere",
  description:
    "Beregn hvor mye du kan spare med COAX sin tankløse vannvarmer sammenlignet med en tradisjonell varmtvannsbereder. Juster familie- og forbruksdata.",
  alternates: {
    canonical: "/kalkulator",
  },
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}

