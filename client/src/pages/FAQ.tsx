import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { LifeBuoy, Search } from "lucide-react";
import PageTitile from "@/components/PageTitile";

import { useChatBot } from "@/hooks/useChatBot";
import CtaSection from "@/components/chatbot/CtaSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    category: "Bruksområder",
    questions: [
      {
        q: "Er COAX ideell for hytter?",
        a: "Ja, perfekt! COAX tar minimal plass, krever ingen tank å tømme, og gir alltid frisk vann. Ideell for variert bruk og lettere på el-anlegget når du bare bruker strøm når vannet varmes.",
      },
      {
        q: "Kan jeg bruke COAX i helårsbolig?",
        a: "Absolutt. Våre 3-fase modeller (XFJ-3) gir nok kapasitet for normale husholdninger med dusj, håndvask og kjøkken. Velg modell basert på ditt vannforbruk.",
      },
      {
        q: "Fungerer COAX i næringsbygg?",
        a: "Ja, COAX er skalerbar og pålitelig for hoteller, kontorer, verksteder og industri. Vedlikeholdsfri drift og ingen tank som tar plass.",
      },
    ],
  },
  {
    category: "El-krav",
    questions: [
      {
        q: "Hvilke el-krav må jeg oppfylle?",
        a: "Det avhenger av modell. 1-fase modeller krever 230V og sikring fra 16-50A. 3-fase modeller krever 230/400V og sikring fra 3x20-40A. Kontakt alltid en elektriker før installasjon.",
      },
      {
        q: "Kan jeg installere COAX selv?",
        a: "Nei, installasjon må utføres av autorisert elektriker og rørlegger for å sikre riktig tilkobling og trykk. Vi kan anbefale fagfolk i ditt område.",
      },
      {
        q: "Hva hvis jeg har begrenset el-anlegg?",
        a: "Velg XFJ-2-55 som har lavt forbruk (0,3 kW per dusj) eller Armatur 3,3kW for håndvask. Vi hjelper deg finne riktig løsning.",
      },
    ],
  },
  {
    category: "Effektivitet",
    questions: [
      {
        q: "Hvor mye strøm sparer jeg med COAX?",
        a: "COAX varmer kun når du bruker vann, i motsetning til tank som holder vann varmt døgnet rundt. Typisk sparing: 20-40% på varmtvannkostnader, avhengig av bruk.",
      },
      {
        q: "Hvor raskt får jeg varmt vann?",
        a: "Øyeblikkelig! COAX varmer vannet mens det passerer gjennom elementet. Ingen ventetid som med tank.",
      },
      {
        q: "Hva er effektiviteten på COAX?",
        a: "Opptil 97% – nesten all strøm går til å varme vannet. Tank har varmetap og lavere effektivitet over tid.",
      },
    ],
  },
  {
    category: "Vannkvalitet",
    questions: [
      {
        q: "Er vannet trygt å drikke?",
        a: "Ja, COAX gir fersk varmtvann direkte fra ledningen – ingen lagring som kan gi bakterievekst. Perfekt vannkvalitet hver gang.",
      },
      {
        q: "Kan legionella vokse i COAX?",
        a: "Nei, legionella trenger lagret vann mellom 20-50°C for å vokse. COAX har ingen tank og varmer vannet til ønsket temperatur øyeblikkelig.",
      },
    ],
  },
  {
    category: "Montering",
    questions: [
      {
        q: "Hvor mye plass tar COAX?",
        a: "COAX stikker kun 8 cm ut fra veggen. Perfekt for små bad, hytter og steder der plass er verdifullt.",
      },
      {
        q: "Hva koster installasjon?",
        a: "Det varierer etter lokasjon og eksisterende anlegg. Kontakt oss for tilbud fra våre samarbeidspartnere.",
      },
      {
        q: "Trenger jeg vedlikehold?",
        a: "Minimalt. COAX er vedlikeholdsfri i normal bruk. Ved hardt vann anbefales sjekk av elektriker hvert 2-3 år.",
      },
    ],
  },
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { openChat } = useChatBot();

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* <section className="my-8">
          <CtaSection isHeader={true} />
        </section> */}
        {/* Header */}
        <PageTitile
          title="Ofte stilte spørsmål"
          text="Finn svar på dine spørsmål om COAX vannvarmere"
        />

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Søk i spørsmål..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-8">
          {filteredFaqs.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`${idx}-${qIdx}`}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline text-lg">
                      <span className="font-semibold">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm md:text-lg">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Ingen spørsmål matcher søket ditt.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Fikk du ikke svar på ditt spørsmål?
          </h2>
          <p className="text-muted-foreground mb-6">
            Ta kontakt med oss, så hjelper vi deg gjerne!
          </p>
          <Link to="/kontakt">
            <Button size="lg" className="gap-2">
              Kontakt oss
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
