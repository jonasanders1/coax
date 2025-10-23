"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import cabinImage from "@/assets/cabin-water-heater.png";
import homeImage from "@/assets/home-water-heater.png";
import industrialImage from "@/assets/industrial-water-heater.png";
import productDetails from "@/product-details.json";
import type { Product as ProductType } from "@/types";

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

  return (
    <div>
      <div className="mb-8 p-4 bg-secondary">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 container max-w-6xl mx-auto p-4">
          <div>
            <Label
              htmlFor="filter-category"
              className="text-sm font-medium text-white"
            >
              Kategori
            </Label>
            <Select
              onValueChange={handleFilterChange("category")}
              defaultValue="all"
            >
              <SelectTrigger id="filter-category">
                <SelectValue placeholder="Filtrer etter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                {[...new Set(allProducts.map((p) => p.category))].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="filter-phase"
              className="text-sm font-medium text-white"
            >
              Fase
            </Label>
            <Select
              onValueChange={handleFilterChange("phase")}
              defaultValue="all"
            >
              <SelectTrigger id="filter-phase">
                <SelectValue placeholder="Filtrer etter Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="1-fase">1-fase</SelectItem>
                <SelectItem value="3-fase">3-fase</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="filter-application"
              className="text-sm font-medium text-white"
            >
              Bruk
            </Label>
            <Select
              onValueChange={handleFilterChange("application")}
              defaultValue="all"
            >
              <SelectTrigger id="filter-application">
                <SelectValue placeholder="Filtrer etter Bruk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="Hytte">Hytte</SelectItem>
                <SelectItem value="Bolig">Bolig</SelectItem>
                <SelectItem value="Industri">Industri</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="filter-flow"
              className="text-sm font-medium text-white"
            >
              Liter/min
            </Label>
            <Select
              onValueChange={handleFilterChange("flow")}
              defaultValue="all"
            >
              <SelectTrigger id="filter-flow">
                <SelectValue placeholder="Filtrer etter Liter/min" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="low">Lav (0-5 L/min)</SelectItem>
                <SelectItem value="medium">Medium (6-10 L/min)</SelectItem>
                <SelectItem value="high">Høy (10+ L/min)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
