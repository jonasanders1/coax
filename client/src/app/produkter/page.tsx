import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "COAX | Energieffektive vannvarmere – alle produkter",
  description:
    "Utforsk COAX sitt utvalg av energieffektive, tankløse vannvarmere. Filtrer modeller etter fase, kategori og bruksområde for å finne riktig løsning.",
  alternates: {
    canonical: "/produkter",
  },
};

const ProductsPage = () => {
  return <ProductsClient />;
};

export default ProductsPage;

