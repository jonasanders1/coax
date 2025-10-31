import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeEmailHeader,
  isValidEmail,
  isValidPhone,
  normalizeWhitespace,
} from "@/utils/inputValidation";

export default function ContactForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    let sanitizedValue = value;

    // Apply appropriate sanitization based on field type
    if (name === "email") {
      sanitizedValue = sanitizeEmail(value.slice(0, 254)); // Email max length
    } else if (name === "phone") {
      sanitizedValue = value.slice(0, 20); // Phone number max length
    } else if (name === "name") {
      sanitizedValue = normalizeWhitespace(value.slice(0, 100)); // Name max length
    } else if (name === "message") {
      sanitizedValue = value.slice(0, 5000); // Message max length
    }

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

    // Sanitize data before sending
    const sanitizedName = sanitizeText(normalizeWhitespace(formData.name));
    const sanitizedEmail = sanitizeEmail(formData.email);
    const sanitizedPhone = formData.phone ? normalizeWhitespace(formData.phone) : "";
    const sanitizedMessage = sanitizeText(formData.message);

    // Create FormData with sanitized values
    const data = new FormData();
    data.append("name", sanitizedName);
    data.append("email", sanitizedEmail);
    if (sanitizedPhone) {
      data.append("phone", sanitizedPhone);
    }
    data.append("message", sanitizedMessage);

    // === Web3Forms required fields ===
    data.append("access_key", "a9c0ed65-714a-4a64-876b-e47b207198dd");
    data.append("from_name", "COAX nettside");
    // Sanitize email headers to prevent header injection
    data.append("replyto", sanitizeEmailHeader(sanitizedEmail));
    data.append("subject", sanitizeEmailHeader(`${sanitizedName} har sendt en forespørsel via COAX.no`));

    // Honeypot (bots will fill it)
    data.append("botcheck", "");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

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
    <Card className="lg:col-span-2">
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

          {/* Dynamic hidden fields (updated on every change) */}
          <input type="hidden" name="replyto" value={sanitizeEmailHeader(formData.email)} />
          <input
            type="hidden"
            name="subject"
            value={sanitizeEmailHeader(`${formData.name} har sendt en forespørsel via COAX.no`)}
          />
          <input type="hidden" name="from_name" value="COAX nettside" />

          {/* Visible Fields */}
          <div>
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              placeholder="Ditt navn"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              value={formData.email}
              onChange={handleChange}
              placeholder="din@epost.no"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              maxLength={20}
              value={formData.phone}
              onChange={handleChange}
              placeholder="123 45 678"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Melding *</Label>
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