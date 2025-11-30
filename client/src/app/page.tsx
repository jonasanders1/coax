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
  ShowerHead,
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
    text: "COAX varmer vannet direkte i det øyeblikket du åpner kranen. Det betyr ingen standby-forbruk, ingen varmetap og opptil 99 % virkningsgrad. Resultatet: lavere energibruk og lavere strømregning.",
  },
  {
    icon: Leaf,
    title: "Plassbesparende og miljøvennlig",
    text: "Uten tank frigjør du verdifull plass i boligen. COAX er kompakt, diskret og ideell for små bad, hytter og moderne leiligheter. Null lagring betyr også mindre energisløsing og lavere CO₂-avtrykk.",
  },
  {
    icon: Droplet,
    title: "Friskt og hygienisk varmtvann",
    text: "Vannet varmes direkte ved tapping, uten å stå lagret i en tank. Det gir hygienisk, oksygenrikt varmtvann – helt uten risiko for bakterievekst som legionella.",
  },
];

const howItWorksSteps = [
  {
    icon: ShowerHead,
    title: "1: Åpne kranen",
    text: "Når vannet begynner å renne, starter COAX automatisk.",
  },
  {
    icon: Zap,
    title: "Steg 2: Vannet varmes opp",
    text: "Vannet passerer gjennom et sikkert varmeelement som varmer opp til 30–60 °C i sanntid.",
  },
  {
    icon: CheckCircle,
    title: "Steg 3: Steng kranen",
    text: "COAX slår seg av umiddelbart. Ingen unødig strømbruk – kun rent varmtvann når du trenger det.",
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
    { text: "Bruker kun strøm når vann tappes", icon: CheckCircle },
    { text: "Kompakt veggmontering", icon: CheckCircle },
    { text: "Alltid friskt og rent vann", icon: CheckCircle },
    { text: "24-34% lavere energibruk", icon: CheckCircle },
    { text: "Miljøvennlig og driftssikkert valg", icon: CheckCircle },
    { text: "Ubegrenset varmtvannsmengde", icon: CheckCircle },
    { text: "Lang levetid: 15-20 år", icon: CheckCircle },
  ],
};

const customerSegments = [
  {
    id: "cabin-owners",
    title: "For hytter og fritidsboliger",
    text: "COAX krever minimalt med plass, har enkel installasjon og gir varmtvann uten forvarming. Perfekt for sesongbruk og steder der du ønsker en trygg, vedlikeholdsfri løsning.",
    image: cabinImage,
  },
  {
    id: "home-owners",
    title: "For boliger og leiligheter",
    text: "Få raskt og stabilt varmtvann, samtidig som du frigjør gulvplass fra store beredere. Ideelt for moderne hjem som ønsker lavere energibruk og bedre komfort.",
    image: homeImage,
  },
  {
    id: "businesses",
    title: "For industri og næringsbygg",
    text: "Skalerbare løsninger som leverer varmtvann direkte til arbeidsstasjoner, dusjer og kjøkken. Reduser driftskostnadene og øk effektiviteten med driftssikker, tankløs oppvarming.",
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
    }, 8000);

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
            className="text-3xl md:text-4xl font-bold text-foreground mb-6 max-w-3xl mx-auto"
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
            {/* Spar strøm, plass, vann og miljø! */}
            Spar strøm, plass og miljø – med direkte vannvarming uten tank
          </motion.h1>
          <motion.p
            className="text-base md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto"
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
            Opplev moderne, energieffektive vannvarmere som gir varmtvann på
            sekundet. COAX leverer friskt, hygienisk og kontinuerlig varmtvann
            helt uten lagringstank – en smartere løsning for boliger, hytter og
            næringsbygg.
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
                Forbrukskalkulator
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
      <section className="py-16 bg-muted">
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
              Se hvor stor forskjell en tankløs vannvarmer kan gjøre i
              strømforbruk, plass og komfort.
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
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl text-foreground">
              Hvordan fungerer COAX?
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Smart, effektiv og umiddelbar vannoppvarming – forklart i tre steg
            </p>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>{" "}
            {/* Vertical line */}
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative flex ${
                    isEven ? "flex-row" : "flex-row-reverse"
                  } items-center mb-12`}
                >
                  <div
                    className={`w-1/2 ${
                      isEven ? "pr-8 text-right" : "pl-8 text-left"
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.text}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center z-10">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="w-1/2"></div> {/* Spacer */}
                </motion.div>
              );
            })}
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
