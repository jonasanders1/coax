import type { Metadata } from "next";
import ProductsClient from "./ModelSelectorClient";

export const metadata: Metadata = {
  title: "COAX | Velg modell",
  description:
    "Velg riktig COAX-modell med Bøttemetoden. Mål hvor raskt du fyller en 10L bøtte i dusjen og finn den beste modellen for deg.",
  alternates: {
    canonical: "/velg-modell",
  },
};

const ProductsPage = () => {
  return <ProductsClient />;
};

export default ProductsPage;

