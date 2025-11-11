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
import { CheckCircle, Loader } from "lucide-react";
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
        <Link href={`/produkter/${product.id}`} className="block h-full">
          <div className="relative h-40 w-full">
            {heroImage ? (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <img
                  src={heroImage}
                  alt={product.name}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
                <Image className="h-10 w-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40" />
            <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2 text-white">
              <CardTitle className="text-2xl text-white h-full flex flex-col justify-between">
                <div className="flex justify-end gap-2">
                  <div className="text-end">
                    <div className="text-md font-bold text-white">
                      {product.priceFrom}
                    </div>
                    <div className="text-sm">(inkl. mva)</div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">
                  {product.name}
                </span>
              </CardTitle>
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pt-5">
        <ul className="space-y-2">
          {product.ideal.map((use, idx) => (
            <li key={idx} className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" color="green" />
              <span>{use}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="sm:flex-row gap-2 mt-auto">
        <Button
          asChild
          size="sm"
          className="flex-1 hover:bg-primary hover:text-primary-foreground"
          variant="outline"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/produkter/${product.id}`} className="flex items-center justify-center">
            Les mer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
