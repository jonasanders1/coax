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
import { CalculatorIcon, PackageIcon } from "lucide-react";
import heroImage from "@/assets/hero-water-heater.png";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useChatBot } from "@/hooks/useChatBot";
import CtaSection from "@/components/chatbot/CtaSection";

import SectionTitle from "@/components/SectionTitle";
import TechnicalWordDef from "@/components/TechnicalWordDef";
import { ComparisonCard } from "@/components/home/ComparisonCard";
import { HowItWorksStep } from "@/components/home/HowItWorksStep";
import {
  benefits,
  howItWorksSteps,
  comparison,
  customerSegments,
} from "@/data/homeData";
import {
  ANIMATION_DURATION,
  ANIMATION_DELAY_INITIAL,
  ANIMATION_DELAY_HERO,
  ANIMATION_DELAY_SUBTITLE,
  ANIMATION_DELAY_BUTTONS,
  ANIMATION_OFFSET_Y_LARGE,
  ANIMATION_OFFSET_Y_SMALL,
  EASING_CURVE,
} from "@/constants/animations";
import { CAROUSEL_AUTO_SCROLL_INTERVAL } from "@/constants/carousel";

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
    }, CAROUSEL_AUTO_SCROLL_INTERVAL);

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
          initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_LARGE }}
          animate={
            hasAnimated
              ? {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: ANIMATION_DURATION,
                    ease: EASING_CURVE,
                    delay: ANIMATION_DELAY_INITIAL,
                  },
                }
              : {}
          }
          className="container mx-auto px-4 py-24 text-center"
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-foreground mb-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_SMALL }}
            animate={
              hasAnimated
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: ANIMATION_DELAY_HERO,
                      duration: ANIMATION_DURATION,
                      ease: EASING_CURVE,
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
            initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_SMALL }}
            animate={
              hasAnimated
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: ANIMATION_DELAY_SUBTITLE,
                      duration: ANIMATION_DURATION,
                      ease: EASING_CURVE,
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
            initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_SMALL }}
            animate={
              hasAnimated
                ? {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: ANIMATION_DELAY_BUTTONS,
                      duration: ANIMATION_DURATION,
                      ease: EASING_CURVE,
                    },
                  }
                : {}
            }
          >
            <Button asChild size="lg" className="text-md px-8 font-normal" aria-label="Gå til forbrukskalkulator for å beregne ditt vannforbruk">
              <Link href="/kalkulator">
                <CalculatorIcon className="w-4 h-4" aria-hidden="true" />
                Forbrukskalkulator
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-md font-normal px-8"
              aria-label="Se alle COAX vannvarmer produkter"
            >
              <Link href="/produkter">
                <PackageIcon className="w-4 h-4" aria-hidden="true" />
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
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto" role="img" aria-label={b.title}>
                      <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
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
            title="Moderne løsning vs. Gammel teknologi"
            text="Se hvor stor forskjell en tankløs vannvarmer kan gjøre i strømforbruk, plass og komfort."
          />
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <ComparisonCard
              title="COAX vannvarmer"
              items={comparison.coax}
              gradient="var(--gradient-primary)"
            />
            <ComparisonCard
              title="Tradisjonell tankbereder"
              items={comparison.traditional}
              gradient="var(--gradient-destructive)"
            />
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
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20"></div>
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep key={index} step={step} index={index} />
            ))}
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
            <div className="text-muted-foreground">
              COAX vannvarmere bruker samme effektive varmeprinsipp i alle
              modeller, men leveres i ulike{" "}
              <TechnicalWordDef definition="Effekt som vannvarmeren kan levere. Vanligvis angitt i kilowatt (kW).">
                watteffekter
              </TechnicalWordDef>{" "}
              og for både{" "}
              <TechnicalWordDef definition="Strømtilkobling med én fase. Vanlig i boliger. Har begrenset effekt sammenlignet med 3-faset.">
                1-faset
              </TechnicalWordDef>{" "}
              og{" "}
              <TechnicalWordDef definition="Strømtilkobling med tre faser. Gir høyere effekt og raskere oppvarming enn 1-faset.">
                3-faset
              </TechnicalWordDef>{" "}
              (230/400 Volt). Det gjør det enkelt å velge riktig kapasitet etter
              behov, fra små leiligheter til større boliger. Med direkte
              vannoppvarming uten tank får du raskt og stabilt varmtvann,
              samtidig som energi- og vannforbruket reduseres. Systemet gir
              presis kontroll over forbruk og er plassbesparende, driftssikkert
              og skalerbart.
            </div>
          </div>

          {/* Stacked layout for medium screens and smaller */}
          <div className="lg:hidden space-y-8 md:space-y-12">
            {customerSegments.map((segment) => (
              <div key={segment.id} className="space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                  {segment.image && (
                    <Image
                      src={segment.image}
                      alt={segment.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                          <Image
                            src={segment.image}
                            alt={segment.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 1200px) 50vw, 40vw"
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
                aria-label="Forrige kundesegment"
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
                aria-label="Neste kundesegment"
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
