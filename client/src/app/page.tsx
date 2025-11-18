"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import {
  Zap,
  Droplet,
  Leaf,
  CheckCircle,
  XCircle,
  CalculatorIcon,
  PackageIcon,
} from "lucide-react";
import heroImage from "@/assets/hero-water-heater.png";
import cabinImage from "@/assets/cabin-water-heater.png";
import homeImage from "@/assets/home-water-heater.png";
import industrialImage from "@/assets/industrial-water-heater.png";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useChatBot } from "@/hooks/useChatBot";
import CtaSection from "@/components/chatbot/CtaSection";

const benefits = [
  {
    icon: Zap,
    title: "Energieffektiv",
    text: "COAX varmer vannet kun når du faktisk bruker det – ingen standby-forbruk eller varmetap. Med opptil 97 % virkningsgrad sparer du strøm hver eneste dag.",
  },
  {
    icon: Leaf,
    title: "Plassbesparende og miljøvennlig",
    text: "Uten tank frigjøres verdifull plass, og energisløsing elimineres. Perfekt løsning for små bad, hytter og moderne boliger der effektivitet og design teller.",
  },
  {
    icon: Droplet,
    title: "Friskt og hygienisk varmtvann",
    text: "Vannet varmes direkte i det øyeblikket du åpner kranen – ingen stillestående vann, ingen bakterier. Alltid friskt, rent og trygt varmtvann.",
  },
];

const comparison = {
  traditional: [
    { text: "Alltid på, konstant varmetap", icon: XCircle },
    { text: "Tar stor plass", icon: XCircle },
    { text: "Risiko for bakterievekst (Legionella)", icon: XCircle },
    { text: "Høyt standby-forbruk", icon: XCircle },
    { text: "Begrenset varmtvannsmengde", icon: XCircle },
    { text: "Lang oppvarmingstid", icon: XCircle },
    { text: "Kortere levetid: 8-12 år", icon: XCircle },
  ],
  coax: [
    { text: "Kun på ved bruk", icon: CheckCircle },
    { text: "Kompakt, monteres på vegg", icon: CheckCircle },
    { text: "Friskt, rent vann hver gang", icon: CheckCircle },
    { text: "24-34% lavere energiforbruk", icon: CheckCircle },
    { text: "Miljøvennlig alternativ", icon: CheckCircle },
    { text: "Ubegrenset varmtvannsmengde", icon: CheckCircle },
    { text: "Lang levetid: 15-20 år", icon: CheckCircle },
  ],
};

const customerSegments = [
  {
    id: "cabin-owners",
    title: "For hytter og fritidshus",
    text: "Minimal plass, enkel installasjon, frostsikring ved tømming og ingen oppvarmingstid gjør COAX ideell for hytter.",
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
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openChat") === "true") {
      openChat();
      router.replace("/", { scroll: false });
    }
  }, [openChat, router]);

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
      url(${heroImage.src})
    `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={
            hasAnimated
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
              hasAnimated
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
              hasAnimated
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
              hasAnimated
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
              <Link href="/kalkulator">
                <CalculatorIcon className="w-4 h-4" />
                Sparekalkulator
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-md font-normal px-8"
            >
              <Link href="/produkter">
                <PackageIcon className="w-4 h-4" />
                Se produkter
              </Link>
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
                <Card key={i}>
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
            <h2 className="text-2xl md:text-3xl text-foreground">
              Gammel teknologi vs. Moderne løsning
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Se forskjellen en tankløs varmer kan utgjøre.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-card-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  Tradisjonell Tank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {comparison.traditional.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <item.icon className="w-6 h-6 text-destructive/80 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="shadow-card-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">
                  COAX Tankløs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {comparison.coax.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <item.icon className="w-6 h-6 text-success/80 shrink-0" />
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
                          src={segment.image.src}
                          alt={segment.title}
                          className="w-full h-full object-cover object-center"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-3xl text-foreground">
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
      {/* 
      <div className="container px-4 max-w-6xl mx-auto">
        <CtaSection isHeader={false} />
      </div> */}
    </div>
  );
};

export default HomePage;
