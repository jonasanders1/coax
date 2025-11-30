import type { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "COAX | Direkte vannvarmere – produkter og modeller",
  description:
    "Se hele utvalget av COAX direkte vannvarmere. Sammenlign energieffektive, tankløse modeller og finn riktig løsning for bolig, hytte eller næringsbygg.",
  alternates: {
    canonical: "/produkter",
  },
};

const ProductsPage = () => {
  return <ProductsClient />;
};

export default ProductsPage;
