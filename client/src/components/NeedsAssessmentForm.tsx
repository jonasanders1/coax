import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";
import { isValidEmail } from "@/utils/inputValidation";
import { useFormInput } from "@/hooks/useFormInput";
import ContactFields from "./forms/ContactFields";
import {
  createFormData,
  submitToWeb3Forms,
  type NeedsAssessmentFormData,
} from "@/utils/formSubmission";
import {
  APPLICATION_AREAS,
  VOLTAGE_PHASE_OPTIONS,
  MAIN_FUSE_OPTIONS,
  WATER_FLOW_OPTIONS,
  USAGE_POINTS,
  FORM_STEPS,
  TOTAL_STEPS,
} from "@/config/needsAssessmentConfig";

export default function NeedsAssessmentForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    voltagePhase: "",
    voltagePhaseOther: "",
    mainFuse: "",
    mainFuseOther: "",
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
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
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
          voltagePhase: "",
          voltagePhaseOther: "",
          mainFuse: "",
          mainFuseOther: "",
          waterFlow: "",
          waterFlowCustom: "",
          usagePoints: [],
          usagePointsOther: "",
          comments: "",
        });
        setCurrentStep(1);

        navigate("/takk");
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
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {FORM_STEPS[1].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FORM_STEPS[1].description}
              </p>
            </div>

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
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {FORM_STEPS[2].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FORM_STEPS[2].description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {APPLICATION_AREAS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={
                    formData.applicationArea.includes(option)
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    handleCheckboxChange("applicationArea", option)
                  }
                  className="h-auto py-2 px-4 border border-border"
                >
                  {option}
                </Button>
              ))}
            </div>

            <div className="pt-4">
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

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {FORM_STEPS[3].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FORM_STEPS[3].description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="voltagePhase">Spenning og faser:</Label>
                <select
                  id="voltagePhase"
                  name="voltagePhase"
                  value={formData.voltagePhase}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voltagePhase: e.target.value,
                    }))
                  }
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Velg spenning/fase</option>
                  {VOLTAGE_PHASE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Input
                  id="voltagePhaseOther"
                  name="voltagePhaseOther"
                  value={formData.voltagePhaseOther}
                  onChange={handleInputChange}
                  placeholder="Annet elektrisk oppsett"
                  className="mt-2"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="mainFuse">Hovedsikringer (Ampere):</Label>
                <select
                  id="mainFuse"
                  name="mainFuse"
                  value={formData.mainFuse}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mainFuse: e.target.value,
                    }))
                  }
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Velg hovedsikringer</option>
                  {MAIN_FUSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}{" "}
                      {option.description && `(${option.description})`}
                    </option>
                  ))}
                </select>
                <Input
                  id="mainFuseOther"
                  name="mainFuseOther"
                  value={formData.mainFuseOther}
                  onChange={handleInputChange}
                  placeholder="Annet (f.eks. 'Kontakt elektriker for watt-vurdering')"
                  className="mt-2"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Vi anbefaler å konsultere en elektriker for å bekrefte
                  maksimal watt som oppsettet ditt kan håndtere.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
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
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {FORM_STEPS[4].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FORM_STEPS[4].description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Vannstrøm: {clampedValue} L/min
                  </span>
                </div>
                <div className="relative px-2">
                  <div className="flex justify-between mb-2">
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
                  <div className="flex justify-between mt-1">
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

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {FORM_STEPS[5].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {FORM_STEPS[5].description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {USAGE_POINTS.map((point) => (
                <Button
                  key={point}
                  type="button"
                  variant={
                    formData.usagePoints.includes(point) ? "default" : "outline"
                  }
                  onClick={() => handleCheckboxChange("usagePoints", point)}
                  className="h-auto py-2 px-4 border border-border"
                >
                  {point}
                </Button>
              ))}
            </div>

            <div className="pt-4">
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

            <div className="pt-4 border-t">
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
