import type { Metadata } from "next";
import { Suspense } from "react";
import AdvancedParametersClient from "./AdvancedParametersClient";

export const metadata: Metadata = {
  title: "COAX | Innstillinger for kalkulatoren",
  description: "Tilpass alle beregningsparametere for mer nøyaktige beregninger",
  alternates: {
    canonical: "/kalkulator/innstillinger",
  },
};

export default function AdvancedParametersPage() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <AdvancedParametersClient />
    </Suspense>
  );
}

