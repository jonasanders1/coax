import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Zap, Droplet, Leaf, CheckCircle, XCircle } from "lucide-react";
import heroImage from "@/assets/hero-water-heater.jpg";
import cabinImage from "@/assets/cabin-water-heater.png";
import homeImage from "@/assets/home-water-heater.png";
import industrialImage from "@/assets/industrial-water-heater.png";
import { CardHeader, CardTitle } from "@/components/ui/card";

const benefits = [
  {
    icon: Zap,
    title: "Energieffektiv",
    text: "Varmer vann kun når du trenger det – oppnå opptil 97% effektivitet og slå av helt når ikke i bruk. Spar strøm hver dag!",
  },
  {
    icon: Leaf,
    title: "Plassbesparende & Miljøvennlig",
    text: "Frigjør verdifull plass og reduser energisløsing. Ingen tank, ingen varmetap. Perfekt for små bad, hytter og steder der plass er verdifullt.",
  },
  {
    icon: Droplet,
    title: "Frisk vannkvalitet",
    text: "Ingen lagring betyr ingen bakterievekst. Fersk, ren varmtvann direkte fra ledningen hver gang du åpner kranen.",
  },
];

const comparison = {
  traditional: [
    { text: "Alltid på, konstant varmetap", icon: XCircle },
    { text: "Tar stor plass", icon: XCircle },
    { text: "Risiko for bakterievekst (Legionella)", icon: XCircle },
    { text: "Høyt standby-forbruk", icon: XCircle },
  ],
  coax: [
    { text: "Kun på ved bruk", icon: CheckCircle },
    { text: "Kompakt, monteres på vegg", icon: CheckCircle },
    { text: "Friskt, rent vann hver gang", icon: CheckCircle },
    { text: "Nøyaktig og lavere forbruk", icon: CheckCircle },
  ],
};

const customerSegments = [
  {
    id: "cabin-owners",
    title: "For hytter og fritidshus",
    text: "Minimal plass, enkel installasjon og frostsikring ved tømming gjør COAX ideell for hytter. Nyt komforten av øyeblikkelig varmtvann uten å bekymre deg for en stor tank.",
    image: cabinImage,
  },
  {
    id: "home-owners",
    title: "For boliger og leiligheter",
    text: "Få raskt og pålitelig varmtvann samtidig som du frigjør plass til andre formål. Perfekt for moderne hjem som verdsetter effektivitet og design.",
    image: homeImage,
  },
  {
    id: "businesses",
    title: "For industri og yrkesbygg",
    text: "Skalerbare og vedlikeholdsfrie løsninger som leverer varmtvann nøyaktig der det trengs, fra kontorer og restauranter til verksteder. Reduser driftskostnader og øk effektiviteten.",
    image: industrialImage,
  },
];

const HomePage = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-muted to-background"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.85)), url(${heroImage})`,
          backgroundSize: "cover",
          objectFit: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 max-w-4xl mx-auto">
            Spar strøm, plass, og miljø!
          </h1>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            COAXs plassbesparende, effektive elektriske vannvarmere – helt uten
            lagringstank. Den smarte måten å varme vann på!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-md px-8 font-normal">
              <Link to="/velg-modell">Finn din modell</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-white text-md font-normal px-8"
            >
              <Link to="/produkter">Se produkter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Card key={i} className="border-none shadow-none">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                    <p className="text-muted-foreground">{b.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Moderne løsning vs. Gammel teknologi
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Se forskjellen en tankløs varmer kan utgjøre.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-500/30 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-destructive/80">
                  Tradisjonell Tank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {comparison.traditional.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <item.icon className="w-6 h-6 text-destructive/80 mt-1 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-green-700">
                  COAX Tankløs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {comparison.coax.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <item.icon className="w-6 h-6 text-green-700 mt-1 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Segments Carousel */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent>
              {customerSegments.map((segment) => (
                <CarouselItem key={segment.id}>
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                      {segment.image && (
                        <img
                          src={segment.image}
                          alt={segment.title}
                          className="w-full h-full object-cover object-center"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-primary">
                        {segment.title}
                      </h3>
                      <p className="mt-4 text-muted-foreground">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-50px] hidden lg:inline-flex" />
            <CarouselNext className="right-[-50px] hidden lg:inline-flex" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="md:text-3xl text-xl font-bold mb-4">
            Revolusjonerende varmtvannsberedere for alle byggtyper
          </h2>
          <p className="mb-8 text-white/80 max-w-2xl mx-auto text-sm">
            Med COAX får du varmtvann direkte – ideelt for Norge med god tilgang
            på elektrisitet. Våre løsninger er designet for fremtiden.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/kontakt">Kontakt oss</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
