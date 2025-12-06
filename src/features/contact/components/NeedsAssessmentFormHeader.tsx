import { cn } from "@/shared/lib/utils";

interface NeedsAssessmentFormHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  className?: string;
}

const NeedsAssessmentFormHeader = ({
  currentStep,
  totalSteps,
  title,
  description,
  className,
}: NeedsAssessmentFormHeaderProps) => {
  const safeTotal = totalSteps > 0 ? totalSteps : 1;
  const clampedStep = Math.min(Math.max(currentStep, 1), safeTotal);
  return (
    <div className={cn("space-y-3 w-full mx-auto", className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-white"
          aria-label={`Steg ${clampedStep} av ${safeTotal}`}
        >
          {clampedStep}/{safeTotal}
        </div>
        <h3 className="text-md font-medium text-foreground">{title}</h3>
      </div>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
};

export default NeedsAssessmentFormHeader;

