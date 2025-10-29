import { Link } from "react-router-dom";

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
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useLayoutAnimation } from "@/components/Layout";
import CtaSection from "@/components/chatbot/CtaSection";
import { useLocation } from "react-router-dom";
import { useChatBot } from "@/hooks/useChatBot";

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
  const { openChat } = useChatBot();
  const location = useLocation();
  const { isAnimated } = useLayoutAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();

  // This ensures animation plays on both initial load and direct navigation
  useEffect(() => {
    if (isAnimated && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isAnimated, hasAnimated]);

  useEffect(() => {
    if (location.state?.openChat) {
      openChat();
    }
  }, [location.state]);

  // Also trigger animation if the component mounts without layout animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAnimated) setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [hasAnimated]);

  const shouldAnimate = hasAnimated || isAnimated;

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: `
      var(--gradient-hero),
      url(${heroImage})
    `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            shouldAnimate
              ? {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.3,
                  },
                }
              : {}
          }
          className="container mx-auto px-4 py-24 text-center"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.4,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }
                : {}
            }
          >
            Spar strøm, plass, og miljø!
          </motion.h1>
          <motion.p
            className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.5,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }
                : {}
            }
          >
            COAXs plassbesparende, effektive elektriske vannvarmere – helt uten
            lagringstank. Den smarte måten å varme vann på!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.6,
                      duration: 0.6,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }
                : {}
            }
          >
            <Button asChild size="lg" className="text-md px-8 font-normal">
              <Link to="/velg-modell">Finn din modell</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-md font-normal px-8"
            >
              <Link to="/produkter">Se produkter</Link>
            </Button>
          </motion.div>
        </motion.div>
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
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Icon className="w-6 h-6 text-primary" />
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
            <h2 className="text-2xl md:text-3xl text-primary">
              Moderne løsning vs. Gammel teknologi
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Se forskjellen en tankløs varmer kan utgjøre.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-destructive/30 border-2 shadow-lg">
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
            <Card className="border-success/30 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-success/80">
                  COAX Tankløs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {comparison.coax.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <item.icon className="w-6 h-6 text-success/80 mt-1 shrink-0" />
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
      <section className="py-16 md:py-24 bg-background">
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
                      <h3 className="text-xl md:text-3xl text-primary">
                        {segment.title}
                      </h3>
                      <p className="mt-2 md:mt-4 text-muted-foreground">
                        {segment.text}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-[-50px] hidden xl:inline-flex hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="right-[-50px] hidden xl:inline-flex hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <div className="container px-4 max-w-6xl mx-auto">
        <CtaSection isHeader={false} />
      </div>
    </div>
  );
};

export default HomePage;
