import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParameterBadgeProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  /**
   * Single = regular badge (used in "Felles parametere")
   * Comparison = used in COAX vs Tank side‑by‑side layout
   */
  variant?: "single" | "comparison";
  /**
   * For comparison layout, which side of the comparison this badge represents.
   * "right" will mirror the content horizontally to create a symmetric layout.
   */
  side?: "left" | "right";
  /**
   * Optional extra classes for the outer container (e.g. colored backgrounds).
   */
  className?: string;
  /**
   * Optional inline styles for the outer container.
   */
  style?: React.CSSProperties;
}

export const ParameterBadge = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-accent",
  variant = "single",
  side = "left",
  className,
  style,
}: ParameterBadgeProps) => {
  const isComparison = variant === "comparison";

  return (
    <div
      style={
        isComparison && side === "left"
          ? { background: "var(--gradient-primary)", color: "white" }
          : isComparison && side === "right"
          ? { background: "var(--gradient-destructive)", color: "white" }
          : style
      }
      className={cn(
        `flex items-center justify-between p-3 rounded-lg border bg-muted/50 ${
          isComparison && side === "left"
            ? "border-primary"
            : isComparison && side === "right"
            ? "border-destructive"
            : ""
        }`,
        isComparison && "bg-transparent",
        isComparison && side === "right" && "flex-row-reverse text-right",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {!isComparison && <Icon className={cn("w-6 h-6", iconColor)} />}
        <span
          className={cn(
            "text-sm font-semibold",
            isComparison ? "text-white" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn("text-sm font-semibold", isComparison && "text-white")}
      >
        {value}
      </span>
    </div>
  );
};
