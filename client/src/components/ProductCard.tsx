import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      key={product.id}
      className="shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full flex flex-col group"
    >
      <CardHeader className="p-0">
        <Link
          to={`/produkter/${product.id}`}
          state={{ product }}
          className="block h-full"
        >
          <div className="relative h-48 w-full">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2 text-white">
              <CardTitle className="text-2xl text-white">
                {product.name}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  {product.phase}
                </Badge>
                {product.specs?.flowRates?.[0] && (
                  <Badge
                    variant="outline"
                    className="bg-white/20 text-sm text-white border-white/30"
                  >
                    {product.specs.flowRates[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="my-3 flex items-center gap-2">
          <div className="text-xl text-muted-foreground">Fra</div>
          <div className="text-xl font-bold text-primary">
            {product.priceFrom}
          </div>
          <div className="text-xs text-muted-foreground">(inkl. mva)</div>
        </div>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {product.description}
        </p>
        <ul className="space-y-2">
          {product.ideal.map((use, idx) => (
            <li key={idx} className="text-sm flex items-center gap-2">
              <span className="text-green-600 mt-1">✓</span>
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
          <Link
            to={`/produkter/${product.id}`}
            className="flex items-center justify-center"
          >
            Les mer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
