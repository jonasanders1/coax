import ProductCard from "./ProductCard";
import type { Product } from "@/shared/types/product";

type ProductsListProps = {
  products: Product[];
};

export default function ProductsList({ products }: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          Ingen produkter tilgjengelig.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 space-y-12 md:space-y-16">
      {Array.from(new Set(products.map((p) => p.category))).map((category) => {
        const items = products.filter((p) => p.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="space-y-6 md:space-y-8">
            <h3 className="text-2xl font-semibold">{category}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

