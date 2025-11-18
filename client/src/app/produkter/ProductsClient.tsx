"use client";

import { useEffect } from "react";
import PageTitile from "@/components/PageTitile";
import ProductsList from "@/components/product/ProductsList";
import { useAppContext } from "@/context/AppContext";
import ProductsListSceleton from "@/components/product/ProductsListSceleton";

const ProductsClient = () => {
  const { products, productsLoading, productsError, fetchProducts } =
    useAppContext();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen pt-24">
      <PageTitile
        title="Energieffektive vannvarmere – våre produkter"
        text="Velg fra modeller tilpasset ditt behov og el-anlegg."
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
