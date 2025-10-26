import { useState } from "react";
import ProductCard from "./ProductCard";

import FilterSelect from "@/components/FilterSelect";
import cabinImage from "@/assets/cabin-water-heater.png";
import homeImage from "@/assets/home-water-heater.png";
import industrialImage from "@/assets/industrial-water-heater.png";
import productDetails from "@/product-details.json";
import type { Product as ProductType } from "@/types/product";

const imageMap: Record<string, string> = {
  cabinImage,
  homeImage,
  commercialImage: industrialImage,
};

const allProducts: ProductType[] = (productDetails as any).products.map(
  (p: any) => ({
    ...p,
    images: Array.isArray(p.images)
      ? p.images.map((key: string) => imageMap[key] || imageMap.homeImage)
      : [],
  })
);

export default function ProductList() {
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

  const filteredProducts = allProducts.filter((product) => {
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
    <div>
      <div className="mb-8 bg-secondary py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 container max-w-6xl mx-auto px-4">
          {filterConfigs.map(
            ({ id, label, filterKey, placeholder, options }) => (
              <FilterSelect
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
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Ingen produkter samsvarer med valgte filtere.
          </p>
        ) : (
          [...new Set(filteredProducts.map((p) => p.category))].map(
            (category) => {
              const items = filteredProducts.filter(
                (p) => p.category === category
              );
              if (items.length === 0) return null;
              return (
                <section key={category} className="space-y-5">
                  <h3 className="text-2xl font-semibold">{category}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                    {items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              );
            }
          )
        )}
      </div>
    </div>
  );
}
