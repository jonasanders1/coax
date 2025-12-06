import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface LoadingProps {
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  /**
   * Size of the loading spinner
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether to show full screen overlay
   */
  fullScreen?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * Reusable Loading component for consistent loading states across the app
 */
export function Loading({
  text,
  size = "md",
  fullScreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Inline loading spinner for buttons and small spaces
 */
export function LoadingSpinner({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Loader2
      className={cn("animate-spin text-current", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}

