import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { isValidEmail, isValidPhone } from "@/utils/inputValidation";
import { useFormInput } from "@/hooks/useFormInput";
import ContactFields from "./forms/ContactFields";
import {
  createFormData,
  submitToWeb3Forms,
  type ContactFormData,
} from "@/utils/formSubmission";

export default function ContactForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { sanitizeInput } = useFormInput();

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Client-side validation
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Ugyldig e-postadresse",
        description: "Vennligst skriv inn en gyldig e-postadresse.",
        variant: "destructive",
      });
      return;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        title: "Ugyldig telefonnummer",
        description: "Vennligst skriv inn et gyldig telefonnummer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = createFormData(formData, {
        formType: "general",
        subject: `${formData.name} har sendt en forespørsel via COAX.no`,
      });

      const result = await submitToWeb3Forms(data);

      if (result.success) {
        toast({
          title: "Takk for din henvendelse!",
          description: "Vi svarer innen 24 timer på hverdager.",
          variant: "success",
        });

        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });

        // React Router navigation (no redirect URL needed)
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

  return (
    <Card className="shadow-card-md">
      <CardHeader>
        <CardTitle className="text-2xl">Send oss en melding</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Honeypot – hidden from users */}
          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Contact Fields */}
          <ContactFields
            name={formData.name}
            email={formData.email}
            phone={formData.phone || ""}
            onNameChange={(value) =>
              setFormData((prev) => ({ ...prev, name: sanitizeInput("name", value) }))
            }
            onEmailChange={(value) =>
              setFormData((prev) => ({ ...prev, email: sanitizeInput("email", value) }))
            }
            onPhoneChange={(value) =>
              setFormData((prev) => ({ ...prev, phone: sanitizeInput("phone", value) }))
            }
          />

          <div>
            <Label htmlFor="message">Melding <span className="text-destructive">*</span></Label>
            <Textarea
              id="message"
              name="message"
              required
              maxLength={5000}
              value={formData.message}
              onChange={handleChange}
              placeholder="Fortell oss om ditt behov..."
              className="mt-1 min-h-[150px]"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                Sender...
              </>
            ) : (
              "Send forespørsel"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}