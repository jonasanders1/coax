import { Skeleton } from "@/components/ui/skeleton";
import ProductCardSceleton from "./ProductCardSceleton";

export default function ProductsListSceleton() {
  const skeletonItems = Array.from({ length: 5 }, (_, index) => index);
  return (
    <div className="container max-w-6xl mx-auto px-4 space-y-10">
      <section className="space-y-5">
        <Skeleton className="h-8 w-1/3 bg-background" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {skeletonItems.map((index) => (
            <ProductCardSceleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
