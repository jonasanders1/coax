import { Button } from "@/components/ui/button";

import { Download, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import PageTitile from "@/components/PageTitile";
import { useChatBot } from "@/hooks/useChatBot";
import ProductsList from "@/components/ProductsList";

const products = [
  {
    id: "xfj-2",
    name: "XFJ-2",
    phase: "1-fase",
    flow: "5-7 L/min",
    voltage: "230V",
    priceFrom: "3 475 kr",
    description:
      "Perfekt for dusj i leiligheter og hytter. Kompakt design, kun 8 cm ut fra vegg.",
    specs: [
      "Strålestørrelse: 5-7 L/min",
      "Effekt: 5.5 - 11 kW",
      "Sikring: 1x25-50A",
      "Mål: 22 x 35 x 8 cm",
      "Vekt: 2.5 kg",
    ],
    ideal: ["Dusj i leilighet", "Hytte", "Sommerhus"],
  },
  {
    id: "xfj-2-55",
    name: "XFJ-2-55",
    phase: "1-fase",
    flow: "3-5 L/min",
    voltage: "230V",
    priceFrom: "2 975 kr",
    description:
      "Kompakt og lavt forbruk på kun 0,3 kW per dusj. Ideell for laveffekt-installasjon.",
    specs: [
      "Strålestørrelse: 3-5 L/min",
      "Effekt: 5.5 kW",
      "Sikring: 1x25A",
      "Lavt forbruk: 0.3 kW/dusj",
      "Ekstra kompakt design",
    ],
    ideal: [
      "Hytte med begrenset el-anlegg",
      "Badekar",
      "Energieffektiv løsning",
    ],
  },
  {
    id: "xfj-3",
    name: "XFJ-3",
    phase: "3-fase",
    flow: "6-13 L/min",
    voltage: "230/400V",
    priceFrom: "4 875 kr",
    description:
      "Kraftig løsning for helårsboliger. Høy kapasitet med mulighet for flere tappesteder.",
    specs: [
      "Strålestørrelse: 6-13 L/min",
      "Effekt: 9 - 27 kW",
      "Sikring: 3x16-40A",
      "Mulighet for flere tappesteder",
      "Termisk sikring",
    ],
    ideal: ["Helårsbolig", "Flere dusjer samtidig", "Kjøkken + bad"],
  },
  {
    id: "armatur",
    name: "Armatur med integrert varmeelement",
    phase: "1-fase",
    flow: "2-3 L/min",
    voltage: "230V",
    priceFrom: "1 975 kr",
    description:
      "Perfekt for håndvask. Alt-i-ett løsning med innebygd varmeelement på 3,3 kW.",
    specs: [
      "Effekt: 3.3 kW",
      "Sikring: 1x16A",
      "Innebygd varmeelement",
      "Enkel montering",
      "Minimal plass",
    ],
    ideal: ["Håndvask", "Toalett", "Vaskerom"],
  },
  {
    id: "varmepumpe",
    name: "Varmepumpe alt-i-ett",
    phase: "1-fase",
    tank: "100-300L",
    voltage: "230V",
    priceFrom: "19 900 kr",
    description:
      "Komplett varmepumpeløsning med Mitsubishi kompressor. Tank på 100-300L med 500W element.",
    specs: [
      "Tank: 100-300 liter",
      "Varmepumpe: Mitsubishi kompressor",
      "Element: 500W",
      "COP: 3.5",
      "Energiklasse: A++",
    ],
    ideal: ["Store husholdninger", "Hoteller", "Bedrifter"],
  },
  {
    id: "sirkulasjon",
    name: "CX3-18 Sirkulasjon",
    phase: "3-fase",
    power: "18 kW",
    voltage: "400V",
    priceFrom: "6 475 kr",
    description:
      "For gulvvarme og sirkulasjonssystemer. Kontinuerlig vannoppvarming til ønsket temperatur.",
    specs: [
      "Effekt: 18 kW",
      "Sikring: 3x32A",
      "For sirkulasjonssystemer",
      "Termostatstyrt",
      "Frostsikring",
    ],
    ideal: ["Gulvvarme", "Sirkulasjon i bygg", "Fjernvarme"],
  },
];

const Products = () => {
  const { openChat } = useChatBot();
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <PageTitile
        title="Våre energieffektive vannvarmere – helt uten tank"
        text="Velg fra modeller tilpasset ditt behov og el-anlegg. Fra 3,3kW til 27kW, 1-fase og 3-fase."
      />

      {/* Product Grid */}
      <section className="pb-16 md:pb-24 bg-muted">
        <ProductsList />
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Usikker på hvilken modell som passer?
          </h2>
          <p className="text-white/80 mb-6">
            Bruk vår bøttemetode-kalkulator for å finne riktig modell basert på
            ditt vannforbruk.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 ">
            <Button asChild size="lg">
              <Link to="/velg-modell">Gå til modellvelger</Link>
            </Button>
            <span className="text-white/80">eller</span>
            <Button
              onClick={openChat}
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat med ThermaBuddy
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
