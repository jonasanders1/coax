import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { LucideIcon } from "lucide-react";

type ComparisonItem = {
  text: string;
  icon: LucideIcon;
};

type ComparisonCardProps = {
  title: string;
  items: ComparisonItem[];
  gradient: string;
};

export function ComparisonCard({
  title,
  items,
  gradient,
}: ComparisonCardProps) {
  return (
    <Card className="shadow-lg overflow-hidden relative" style={{ background: gradient }}>
      {/* Decorative elements */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
      <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid gap-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr] gap-3 items-start"
              >
                <Icon className="w-6 h-6 text-white/90 shrink-0 mt-0.5" />
                <span className="text-white/90 leading-relaxed">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

