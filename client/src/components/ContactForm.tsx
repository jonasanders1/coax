import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    // === Web3Forms required fields ===
    data.append("access_key", "a9c0ed65-714a-4a64-876b-e47b207198dd");
    data.append("from_name", "COAX nettside");
    data.append("replyto", formData.email); // Reply-To header
    data.append("subject", `${formData.name} har sendt en forespørsel via COAX.no`);

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
        form.reset();

        // React Router navigation (no redirect URL needed)
        navigate("/thanks");
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
          <input type="hidden" name="replyto" value={formData.email} />
          <input
            type="hidden"
            name="subject"
            value={`${formData.name} har sendt en forespørsel via COAX.no`}
          />
          <input type="hidden" name="from_name" value="COAX nettside" />

          {/* Visible Fields */}
          <div>
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              name="name"
              required
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