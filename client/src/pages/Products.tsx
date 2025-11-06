import { useState, useEffect, useMemo } from "react";
import PageTitile from "@/components/PageTitile";
import ProductsList from "@/components/product/ProductsList";
import FilterSelect from "@/components/FilterSelect";
import CtaSection from "@/components/chatbot/CtaSection";
import { useAppContext } from "@/context/AppContext";
import type { Product } from "@/types/product";
import ProductsListSceleton from "@/components/product/ProductsListSceleton";

const Products = () => {
  const { products, productsLoading, productsError, fetchProducts } =
    useAppContext();

  // Fetch products when component mounts (only when route is reached)
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Products are already processed with storage URLs from the fetch function
  const allProducts: Product[] = useMemo(() => {
    return products;
  }, [products]);

  const [filters, setFilters] = useState({
    category: "all",
    phase: "all",
    application: "all",
    flow: "all",
  });

  const handleFilterChange =
    (filterType: keyof typeof filters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [filterType]: value }));
    };

  const getFlowCategoryFromSpecs = (flowRates?: string[]) => {
    if (!flowRates || flowRates.length === 0) return "all";
    const firstStr = flowRates[0];
    const match =
      typeof firstStr === "string" ? firstStr.match(/\d+(?:\.\d+)?/) : null;
    const first = match ? parseFloat(match[0]) : undefined;
    if (first == null || Number.isNaN(first)) return "all";
    if (first <= 5) return "low";
    if (first <= 10) return "medium";
    return "high";
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const categoryMatch =
        filters.category === "all" || product.category === filters.category;
      const phaseMatch =
        filters.phase === "all" || product.phase === filters.phase;
      const applicationMatch =
        filters.application === "all" ||
        product.ideal.some((txt) =>
          txt.toLowerCase().includes(filters.application.toLowerCase())
        );
      const flowCategory = getFlowCategoryFromSpecs(product.specs?.flowRates);
      const flowMatch = filters.flow === "all" || filters.flow === flowCategory;

      return categoryMatch && phaseMatch && applicationMatch && flowMatch;
    });
  }, [allProducts, filters]);

  // Filter configuration
  const filterConfigs = [
    {
      id: "filter-category",
      label: "Kategori",
      filterKey: "category" as const,
      placeholder: "Filtrer etter Kategori",
      options: [
        { value: "all", label: "Alle" },
        ...Array.from(new Set(allProducts.map((p) => p.category))).map((c) => ({
          value: c,
          label: c,
        })),
      ],
    },
    {
      id: "filter-phase",
      label: "Fase",
      filterKey: "phase" as const,
      placeholder: "Filtrer etter Fase",
      options: [
        { value: "all", label: "Alle" },
        { value: "1-fase", label: "1-fase" },
        { value: "3-fase", label: "3-fase" },
      ],
    },
    {
      id: "filter-application",
      label: "Bruk",
      filterKey: "application" as const,
      placeholder: "Filtrer etter Bruk",
      options: [
        { value: "all", label: "Alle" },
        { value: "Hytte", label: "Hytte" },
        { value: "Bolig", label: "Bolig" },
        { value: "Industri", label: "Industri" },
      ],
    },
    {
      id: "filter-flow",
      label: "Liter/min",
      filterKey: "flow" as const,
      placeholder: "Filtrer etter Liter/min",
      options: [
        { value: "all", label: "Alle" },
        { value: "low", label: "Lav (0-5 L/min)" },
        { value: "medium", label: "Medium (6-10 L/min)" },
        { value: "high", label: "Høy (10+ L/min)" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <PageTitile
        title="Energieffektive vannvarmere – våre produkter"
        text="Velg fra modeller tilpasset ditt behov og el-anlegg."
      />

      {/* Product Grid */}
      <section className="pb-16 md:pb-24 bg-muted">
        <div className="mb-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 container max-w-6xl mx-auto px-4">
            {filterConfigs.map(
              ({ id, label, filterKey, placeholder, options }) => (
                <FilterSelect
                  disabled={productsLoading}
                  key={id}
                  id={id}
                  label={label}
                  value={filters[filterKey]}
                  onValueChange={handleFilterChange(filterKey)}
                  options={options}
                  placeholder={placeholder}
                />
              )
            )}
          </div>
        </div>
        {productsLoading ? (
          <ProductsListSceleton />
        ) : productsError ? (
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <p className="text-center text-destructive">
              Feil ved lasting av produkter. Prøv å oppdatere siden.
            </p>
          </div>
        ) : (
          <ProductsList products={filteredProducts} />
        )}
      </section>

      {/* CTA Section */}
      {/* <div className="container px-4 max-w-6xl mx-auto">
        <CtaSection isHeader={false} />
      </div> */}
    </div>
  );
};

export default Products;
