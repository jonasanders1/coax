import type { Metadata } from "next";
import ProductsClient from "./ModelSelectorClient";

export const metadata: Metadata = {
  title: "COAX | Finn riktig direkte vannvarmer – Bøttemetoden",
  description:
    "Finn riktig COAX vannvarmer med Bøttemetoden. Mål vannmengden på 10 liter og få anbefalt modell basert på strømtilgang og varmtvannsbehov.",
  alternates: {
    canonical: "/velg-modell",
  },
};

const ProductsPage = () => {
  return <ProductsClient />;
};

export default ProductsPage;
