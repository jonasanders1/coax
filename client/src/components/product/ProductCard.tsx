import Link from "next/link";
import { Image } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const heroImage = product.images?.[0] ?? null;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [heroImage]);

  return (
    <Card
      key={product.id}
      className="shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col group"
    >
      <CardHeader className="p-0">
        <Link href={`/produkter/${product.id}`} className="block">
          <div className="relative aspect-square w-full">
            {heroImage ? (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <img
                  src={heroImage}
                  alt={`${product.model} COAX vannvarmer produktbilde`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground" role="img" aria-label="Ingen bilde tilgjengelig">
                <Image className="h-10 w-10" aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pt-5 space-y-2">
        <CardTitle className="text-lg md:text-xl font-semibold">
          {product.model}
        </CardTitle>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl md:text-3xl font-semibold">
            {product.priceFrom} kr
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">
            (inkl. mva)
          </span>
        </div>
      </CardContent>
      <CardFooter className="sm:flex-row gap-2 mt-auto">
        <Button
          asChild
          size="sm"
          className="flex-1 hover:bg-primary hover:text-primary-foreground"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Les mer om ${product.model} COAX vannvarmer`}
        >
          <Link
            href={`/produkter/${product.id}`}
            className="flex items-center justify-center"
          >
            Les mer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
