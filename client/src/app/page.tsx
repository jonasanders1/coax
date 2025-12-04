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

import SectionTitle from "@/components/SectionTitle";

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
    title: "1. Åpne kranen",
    text: "Når vannet begynner å renne, starter COAX automatisk.",
  },
  {
    icon: Zap,
    title: "2. Vannet varmes opp",
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
    text: "COAX passer for både små og store hytter, fra enkle 1-fas installasjoner til kraftigere 3-fas anlegg (230/400 V). Enheten festes flatt på vegg, tar ingen gulvplass og er enkel å montere og demontere ved evt. service. Ingen tank betyr ingen tømming ved sesongavslutning, men systemet kan også tømmes sammen med hevert for rørsystemet. Presis styring av vann og energi gjør COAX ideell for vannsparende armaturer og dusjhoder, samtidig som man kan bruke vannsisterner eller begrensede vanntilførsel uten å miste komfort.",
    image: cabinImage,
  },
  {
    id: "home-owners",
    title: "For boliger og leiligheter",
    text: "COAX vannvarmere leveres i ulike effekter og strålestørrelser, og passer for både 1-fas og 3-fas strøm (230/400 V). Systemet gir raskt og stabilt varmtvann, frigjør gulvplass fra store beredere og gir lavere energibruk. Med presis kontroll av strøm, vann og avløp oppnår moderne hjem bedre komfort og mer effektiv ressursbruk. Nøyaktig styring gjør det også mulig å redusere vannforbruk og oppnå ønsket temperatur selv med lavere l/min i armaturer og dusjhoder.",
    image: homeImage,
  },
  {
    id: "businesses",
    title: "For industri og næringsbygg",
    text: "COAX tilbyr skalerbare løsninger som leverer varmtvann direkte til arbeidsstasjoner, dusjer og storkjøkken. Leveres i ulike effekter og fasetyper, med tankløs, energieffektiv oppvarming. Systemet reduserer driftskostnader, øker effektiviteten og er enkelt å integrere i eksisterende rør- og el-installasjoner. Stabilt, presist og driftssikkert – også for store anlegg med høye krav til kontinuerlig varmtvann.",
    image: industrialImage,
  },
];

const HomePage = () => {
  const { openChat } = useChatBot();
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const autoScrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

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

    let isUserInteracting = false;

    const interval = setInterval(() => {
      // Only auto-scroll if user is not interacting
      if (!isUserInteracting) {
        api.scrollNext();
      }
    }, 10000);

    autoScrollIntervalRef.current = interval;

    // Stop auto-scroll when user starts interacting
    const handlePointerDown = () => {
      isUserInteracting = true;
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    // Listen for user interactions (drag, swipe, click)
    api.on("pointerDown", handlePointerDown);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      api.off("pointerDown", handlePointerDown);
    };
  }, [api]);

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

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
        <div className="container  mx-auto px-4">
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
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <SectionTitle
            title="Gammel teknologi vs. Moderne løsning"
            text="Se hvor stor forskjell en tankløs vannvarmer kan gjøre i strømforbruk, plass og komfort."
          />
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Traditional Tank Card */}
            <Card
              className="shadow-lg overflow-hidden relative"
              style={{ background: "var(--gradient-destructive)" }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-white">
                  Tradisjonell tankbereder
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid gap-4">
                  {comparison.traditional.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[auto_1fr] gap-3 items-start"
                    >
                      <item.icon className="w-6 h-6 text-white/90 shrink-0 mt-0.5" />
                      <span className="text-white/90 leading-relaxed">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* COAX Card */}
            <Card
              className="shadow-lg overflow-hidden relative"
              style={{ background: "var(--gradient-primary)" }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-white">
                  COAX vannvarmer
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid gap-4">
                  {comparison.coax.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[auto_1fr] gap-3 items-start"
                    >
                      <item.icon className="w-6 h-6 text-white/90 shrink-0 mt-0.5" />
                      <span className="text-white/90 leading-relaxed">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-4">
          <SectionTitle
            title="Hvordan fungerer COAX?"
            text="Smart, effektiv og umiddelbar vannoppvarming – forklart i tre steg"
          />
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>{" "}
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
                      isEven
                        ? "pr-4 md:pr-8 text-left md:text-center text-sm md:text-base"
                        : "pl-4 md:pl-8 text-left md:text-center text-sm md:text-base"
                    }`}
                  >
                    <h3 className="text-base md:text-xl font-bold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.text}</p>
                  </div>
                  <div className="w-8 h-8 md:w-12 md:h-12 aspect-square bg-primary rounded-full flex items-center justify-center z-10 flex-shrink-0">
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
                  </div>
                  <div className="w-1/2"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Segments Carousel */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <SectionTitle
            title="COAX – fleksibel varmtvannsløsning for alle typer bygg"
            text="Fra små hytter til moderne hjem og næringsbygg – COAX er utviklet for et bredt spekter av kunder og bruksområder."
          />
          <div className="space-y-4 mb-12 max-w-6xl mx-auto">
            <p className="text-muted-foreground">
              COAX vannvarmere bruker samme effektive varmeprinsipp i alle
              modeller, men leveres i ulike watteffekter og for både 1-faset og
              3-faset (230/400 Volt). Det gjør det enkelt å velge riktig
              kapasitet etter behov, fra små leiligheter til større boliger. Med
              direkte vannoppvarming uten tank får du raskt og stabilt
              varmtvann, samtidig som energi- og vannforbruket reduseres.
              Systemet gir presis kontroll over forbruk og er plassbesparende,
              driftssikkert og skalerbart.
            </p>
          </div>

          {/* Stacked layout for medium screens and smaller */}
          <div className="lg:hidden space-y-8 md:space-y-12">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                  {segment.image && (
                    <img
                      src={segment.image.src}
                      alt={segment.title}
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-foreground">
                    {segment.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel for large screens */}
          <div className="hidden lg:block">
            <Carousel
              opts={{
                loop: true,
                dragFree: false,
                containScroll: "trimSnaps",
              }}
              className="w-[calc(100%-100px)] mx-auto"
              setApi={setApi}
            >
              <CarouselContent>
                {customerSegments.map((segment) => (
                  <CarouselItem key={segment.id}>
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                        {segment.image && (
                          <img
                            src={segment.image.src}
                            alt={segment.title}
                            className="w-full h-full object-cover object-center"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4 text-foreground">
                          {segment.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {segment.text}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                className="left-[-50px] hidden lg:inline-flex bg-primary text-primary-foreground hover:bg-primary/80"
                onClick={(e) => {
                  stopAutoScroll();
                  // The default scrollPrev will be called via the component's built-in onClick
                  // We need to manually trigger it since we're overriding onClick
                  if (api) {
                    api.scrollPrev();
                  }
                }}
              />
              <CarouselNext
                className="right-[-50px] hidden lg:inline-flex bg-primary text-primary-foreground hover:bg-primary/80"
                onClick={(e) => {
                  stopAutoScroll();
                  // The default scrollNext will be called via the component's built-in onClick
                  // We need to manually trigger it since we're overriding onClick
                  if (api) {
                    api.scrollNext();
                  }
                }}
              />
            </Carousel>
          </div>
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
