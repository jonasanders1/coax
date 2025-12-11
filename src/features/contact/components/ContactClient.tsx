"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import ContactForm from "@/features/contact/components/ContactForm";
import NeedsAssessmentForm from "@/features/contact/components/NeedsAssessmentForm";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import PageTitle from "@/shared/components/common/PageTitle";
import {
  StructuredData,
  LocalBusinessSchema,
} from "@/shared/components/common/StructuredData";

import { useChatBot } from "@/features/chatbot/hooks/useChatBot";

const ContactClient = () => {
  const [formType, setFormType] = useState<"general" | "needs">("general");
  const { openChat } = useChatBot();
  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted animate-fade-in-up">
      <StructuredData data={LocalBusinessSchema()} />
      <div className="container mx-auto px-4">
        <PageTitle
          title="Ta kontakt med oss"
          text="Vi hjelper deg å velge riktig modell og samarbeider med autoriserte elektrikere og rørleggere for trygg installasjon. Perfekt for bolig, hytte eller større prosjekter."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              <Button
                variant={formType === "general" ? "default" : "outline"}
                onClick={() => setFormType("general")}
                className="flex-1 hover:text-white border-none"
              >
                Generell forespørsel
              </Button>
              <Button
                variant={formType === "needs" ? "default" : "outline"}
                onClick={() => setFormType("needs")}
                className="flex-1 hover:text-white border-none"
              >
                Behovsvurdering
              </Button>
            </div>

            {formType === "general" ? <ContactForm /> : <NeedsAssessmentForm />}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold mb-1">Adresse</div>
                    <div className="text-sm text-muted-foreground">
                      Grønnliveien 13, 3474 Åros, Norge
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
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
                  <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
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
                  <span className="font-semibold text-destructive">Stengt</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden shadow-none"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-white m-0 p-0">
                  Snakk med COAX-AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Haster det? Still spørsmålet til COAX-AI. Det kan hende han
                  kan hjelpe deg.
                </p>

                <Button
                  onClick={() => openChat()}
                  size="lg"
                  className="mt-4 group relative z-10 min-w-[180px] overflow-hidden border-2 border-white bg-white/10 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-primary/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Snakk med COAX-AI
                  </span>
                  <span
                    className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "var(--gradient-primary)" }}
                  ></span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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

export default ContactClient;
