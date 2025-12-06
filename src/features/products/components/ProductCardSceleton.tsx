import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ProductCardSceleton() {
  return (
    <Skeleton className="shadow-md transition-shadow overflow-hidden h-full flex flex-col group">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <div className="absolute inset-0 bg-background" />
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
