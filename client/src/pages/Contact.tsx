import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTitile from "@/components/PageTitile";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real application, this would send to an API
    toast({
      title: "Takk for din henvendelse!",
      description: "Vi svarer innen 24 timer på hverdager.",
    });

    // Reset form
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <PageTitile
          title="Ta kontakt"
          text="Vi hjelper deg med valg og installasjon – enten det er for bolig, hytte eller større byggeprosjekter."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Send oss en melding</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <Button type="submit" size="lg" className="w-full">
                  Send forespørsel
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Adresse</div>
                    <div className="text-sm text-muted-foreground">
                      Grønnliveien 13
                      <br />
                      3474 Åros
                      <br />
                      Norge
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Telefon</div>
                    <a
                      href="tel:+4797732838"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      977 32 838
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">E-post</div>
                    <a
                      href="mailto:post@coax.no"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      post@coax.no
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Åpningstider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mandag - Fredag</span>
                  <span className="font-semibold">08:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lørdag - Søndag</span>
                  <span className="font-semibold">Stengt</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h3 className="font-bold mb-2">Rask respons</h3>
                <p className="text-sm text-primary-foreground/90">
                  Vi svarer vanligvis innen 24 timer på hverdager. Haster det?
                  Ring oss direkte!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="w-full h-[400px] rounded-lg overflow-hidden">
                <iframe
                  title="Kart - Grønnliveien 13, 3474 Åros"
                  src="https://www.google.com/maps?q=Grønnliveien%2013,%203474%20Åros&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
