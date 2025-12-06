"use client";

import { useEffect } from "react";
import PageTitle from "@/shared/components/common/PageTitle";
import ProductsList from "@/features/products/components/ProductsList";
import { useAppContext } from "@/shared/context/AppContext";
import ProductsListSceleton from "@/features/products/components/ProductsListSceleton";

const ProductsClient = () => {
  const {
    products,
    productsLoading,
    productsError,
    fetchProducts,
  } = useAppContext();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen pt-24 animate-fade-in-up">
      <PageTitle
        title="Energieffektive COAX vannvarmere"
        text="Velg blant modeller tilpasset både små og store varmtvannsbehov. Våre direkte vannvarmere finnes i både 1-fase og 3-fase varianter, slik at du kan finne den optimale løsningen for ditt el-anlegg og tappemønster."
      />

      <section className="py-16 md:py-24 bg-muted">
        {productsLoading ? (
          <ProductsListSceleton />
        ) : productsError ? (
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-destructive">
              Feil ved lasting av produkter. Prøv å oppdatere siden.
            </p>
          </div>
        ) : (
          <ProductsList products={products} />
        )}
      </section>
    </div>
  );
};

export default ProductsClient;
