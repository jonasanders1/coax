import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export default function FaqItemSkeleton() {
  return (
    <AccordionItem
      value="skeleton"
      className="border rounded-lg px-4 bg-card"
    >
      <AccordionTrigger className="text-left hover:no-underline">
        <Skeleton className="h-6 w-full max-w-md" />
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

