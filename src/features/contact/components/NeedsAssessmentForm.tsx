"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { isValidEmail } from "@/shared/utils/inputValidation";
import { useFormInput } from "@/hooks/useFormInput";
import { cn } from "@/shared/lib/utils";
import ContactFields from "@/features/contact/components/ContactFields";
import FilterSelect from "@/features/contact/components/FilterSelect";
import NeedsAssessmentFormHeader from "@/features/contact/components/NeedsAssessmentFormHeader";
import {
  createFormData,
  submitToWeb3Forms,
  type NeedsAssessmentFormData,
} from "@/features/contact/utils/formSubmission";
import {
  APPLICATION_AREAS,
  ELECTRICAL_OPTIONS,
  WATER_FLOW_OPTIONS,
  USAGE_POINTS,
  FORM_STEPS,
  TOTAL_STEPS,
} from "@/config/needsAssessmentConfig";

export default function NeedsAssessmentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { sanitizeInput } = useFormInput();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const wasSubmitButtonClicked = React.useRef(false);

  const [formData, setFormData] = useState<NeedsAssessmentFormData>({
    name: "",
    email: "",
    phone: "",
    applicationArea: [],
    applicationAreaOther: "",
    electricalSetup: "",
    waterFlow: "",
    waterFlowCustom: "",
    usagePoints: [],
    usagePointsOther: "",
    comments: "",
  });

  const handleCheckboxChange = (
    field: "applicationArea" | "usagePoints",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev[field] ?? [];
      const nextValues = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [field]: nextValues,
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      // Step 1: Contact info validation
      if (!formData.name.trim()) {
        toast({
          title: "Navn påkrevd",
          description: "Vennligst skriv inn ditt navn.",
          variant: "destructive",
        });
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast({
          title: "Ugyldig e-postadresse",
          description: "Vennligst skriv inn en gyldig e-postadresse.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow submission on the last step
    if (currentStep !== TOTAL_STEPS) {
      return;
    }

    // Only allow submission if submit button was explicitly clicked
    if (!wasSubmitButtonClicked.current) {
      return;
    }

    // Reset the flag
    wasSubmitButtonClicked.current = false;

    // Validate final step
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Ugyldig e-postadresse",
        description: "Vennligst skriv inn en gyldig e-postadresse.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = createFormData(formData, {
        formType: "needs_assessment",
        subject: `Behovsvurdering fra ${formData.name} via COAX.no`,
      });

      const result = await submitToWeb3Forms(data);

      if (result.success) {
        toast({
          title: "Takk for din forespørsel!",
          description:
            "Vi vil vurdere dine behov og komme tilbake med anbefalinger.",
          variant: "success",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          applicationArea: [],
          applicationAreaOther: "",
          electricalSetup: "",
          waterFlow: "",
          waterFlowCustom: "",
          usagePoints: [],
          usagePointsOther: "",
          comments: "",
        });
        setCurrentStep(1);

        router.push("/takk");
      } else {
        toast({
          title: "Oi! Noe gikk galt",
          description: result.message || "Prøv igjen senere.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast({
        title: "Ingen nettverk",
        description: "Sjekk internettforbindelsen din.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const stepConfig = FORM_STEPS[currentStep] ?? {
      title: `Steg ${currentStep}`,
      description: "",
    };

    const header = (
      <NeedsAssessmentFormHeader
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        title={stepConfig.title}
        description={stepConfig.description}
      />
    );

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {header}

            <ContactFields
              name={formData.name}
              email={formData.email}
              phone={formData.phone || ""}
              onNameChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  name: sanitizeInput("name", value),
                }))
              }
              onEmailChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  email: sanitizeInput("email", value),
                }))
              }
              onPhoneChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: sanitizeInput("phone", value),
                }))
              }
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {header}

            <div className="flex flex-wrap gap-2.5">
              {APPLICATION_AREAS.map((option) => {
                const isSelected = (formData.applicationArea ?? []).includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    data-selected={isSelected}
                    onClick={(e) => {
                      handleCheckboxChange("applicationArea", option);
                      // Blur immediately after state update
                      const target = e.currentTarget;
                      setTimeout(() => {
                        if (target && document.body.contains(target)) {
                          target.blur();
                        }
                      }, 0);
                    }}
                    onMouseDown={(e) => {
                      // Prevent focus on mobile touch devices
                      if (window.matchMedia("(pointer: coarse)").matches) {
                        e.preventDefault();
                      }
                    }}
                    className={cn(
                      "relative inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      "min-h-[44px] min-w-[44px] touch-manipulation",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50",
                      "active:scale-[0.98]"
                    )}
                    style={{
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <Label htmlFor="applicationAreaOther">Annet:</Label>
              <Input
                id="applicationAreaOther"
                name="applicationAreaOther"
                value={formData.applicationAreaOther}
                onChange={handleInputChange}
                placeholder="Beskriv annet område"
                className="mt-1"
                maxLength={100}
              />
            </div>
          </div>
        );

      case 3: {
        const electricalOptions = ELECTRICAL_OPTIONS.map((option) => ({
          value: option.value,
          label: option.description
            ? `${option.label} (${option.description})`
            : option.label,
        }));

        return (
          <div className="space-y-6">
            {header}

            <div className="space-y-3">
              <FilterSelect
                id="electricalSetup"
                label="Elektrisk oppsett"
                value={formData.electricalSetup ?? ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    electricalSetup: value,
                  }))
                }
                disabled={isSubmitting}
                options={electricalOptions}
                placeholder="Velg fase, sikring og spenning"
              />

              <p className="text-xs text-muted-foreground">
                Vi anbefaler å konsultere en elektriker for å bekrefte
                maksimal watt som oppsettet ditt kan håndtere.
              </p>
            </div>
          </div>
        );
      }

      case 4: {
        // Convert waterFlow string to number for slider (default to 6 if empty)
        const waterFlowValue = formData.waterFlow
          ? parseInt(formData.waterFlow.replace(" L/min", ""), 10)
          : 6;
        const clampedValue = Math.max(
          3,
          Math.min(15, isNaN(waterFlowValue) ? 6 : waterFlowValue)
        );

        return (
          <div className="space-y-6">
            {header}

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Vannstrøm: {clampedValue} L/min
                  </span>
                </div>
                <div className="relative px-2">
                  <div className="mb-2 flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      3 L/min
                    </span>
                    <span className="text-xs text-muted-foreground">
                      15 L/min
                    </span>
                  </div>
                  <Slider
                    min={3}
                    max={15}
                    step={1}
                    value={[clampedValue]}
                    onValueChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        waterFlow: `${value[0]} L/min`,
                      }));
                    }}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Håndvask
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Kraftig dusj
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="space-y-6">
            {header}

            <div className="flex flex-wrap gap-2.5">
              {USAGE_POINTS.map((point) => {
                const isSelected = (formData.usagePoints ?? []).includes(point);
                return (
                  <button
                    key={point}
                    type="button"
                    data-selected={isSelected}
                    onClick={(e) => {
                      handleCheckboxChange("usagePoints", point);
                      // Blur immediately after state update
                      const target = e.currentTarget;
                      setTimeout(() => {
                        if (target && document.body.contains(target)) {
                          target.blur();
                        }
                      }, 0);
                    }}
                    onMouseDown={(e) => {
                      // Prevent focus on mobile touch devices
                      if (window.matchMedia("(pointer: coarse)").matches) {
                        e.preventDefault();
                      }
                    }}
                    className={cn(
                      "relative inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200",
                      "min-h-[44px] min-w-[44px] touch-manipulation",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50",
                      "active:scale-[0.98]"
                    )}
                    style={{
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{point}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <Label htmlFor="usagePointsOther">Annet:</Label>
              <Input
                id="usagePointsOther"
                name="usagePointsOther"
                value={formData.usagePointsOther}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                placeholder="F.eks. 'Flere bad'"
                className="mt-1"
                maxLength={100}
              />
            </div>

            <div className="border-t pt-3">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  5. Tilleggskommentarer
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fortell oss mer om oppsettet ditt og hva du leter etter i en
                  COAX-vannvarmer.
                </p>
              </div>

              <Textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  // Allow Shift+Enter for new lines, but prevent Enter from submitting
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
                placeholder="Beskriv lokasjonen din, spesielle ønsker eller spørsmål..."
                className="min-h-[150px]"
                maxLength={2000}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          Behovsvurdering for COAX-vannvarmer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Prevent any automatic form submission - only allow via button click
            return false;
          }}
          onKeyDown={(e) => {
            // Prevent form submission on Enter key unless submit button is explicitly clicked
            if (e.key === "Enter" && e.target !== e.currentTarget) {
              // Only prevent if Enter is pressed in an input/textarea, not on buttons
              if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
              ) {
                // Allow Shift+Enter in textareas for new lines
                if (e.target instanceof HTMLTextAreaElement && e.shiftKey) {
                  return;
                }
                // Always prevent form submission on Enter in inputs/textarea
                // Only allow submission via explicit submit button click
                e.preventDefault();
              }
            }
          }}
          className="space-y-6"
        >
          {/* Honeypot */}
          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextStep();
                }}
              >
                Neste
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                ref={submitButtonRef}
                type="button"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  wasSubmitButtonClicked.current = true;
                  // Call onSubmit directly instead of triggering form submission
                  const syntheticEvent = {
                    preventDefault: () => {},
                    stopPropagation: () => {},
                  } as React.FormEvent;
                  onSubmit(syntheticEvent);
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sender...
                  </>
                ) : (
                  "Send behovsvurdering"
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
