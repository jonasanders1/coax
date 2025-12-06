import { Skeleton } from "@/shared/components/ui/skeleton";
import FaqItemSkeleton from "./FaqItemSkeleton";
import { Accordion } from "@/shared/components/ui/accordion";

export default function FaqListSkeleton() {
  const skeletonCategories = Array.from({ length: 3 }, (_, index) => index);
  const skeletonItems = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="space-y-8">
      {skeletonCategories.map((categoryIdx) => (
        <div key={categoryIdx}>
          <Skeleton className="h-8 w-64 mb-4" />
          <Accordion type="multiple" className="space-y-2">
            {skeletonItems.map((itemIdx) => (
              <FaqItemSkeleton key={`${categoryIdx}-${itemIdx}`} />
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

