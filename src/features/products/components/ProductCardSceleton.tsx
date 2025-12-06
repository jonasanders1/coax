import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { Product } from "@/shared/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCardSceleton() {
  return (
    <Skeleton className="shadow-md transition-shadow overflow-hidden h-full flex flex-col group">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <div className="absolute inset-0  bg-background" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2 text-white">
            <CardTitle className="text-2xl text-white h-full flex flex-col justify-between">
              <div className="flex justify-end gap-2">
                <div className="text-end">
                  <div className="text-md font-bold text-foreground">
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-8 w-1/3" />
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-5">
        <ul className="space-y-2">
          <Skeleton className="h-5 w-full bg-background" />
          <Skeleton className="h-5 w-full bg-background" />
          <Skeleton className="h-5 w-full bg-background" />
        </ul>
      </CardContent>
      <CardFooter className="sm:flex-row gap-2 mt-auto">
        <Skeleton className="h-7 w-full bg-background" />
      </CardFooter>
    </Skeleton>
  );
}
