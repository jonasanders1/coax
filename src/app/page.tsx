"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselIndicators,
  CarouselApi,
} from "@/shared/components/ui/carousel";
import { CalculatorIcon, PackageIcon, ChevronDown, Award } from "lucide-react";
import heroImage from "@/assets/hero-water-heater.png";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useChatBot } from "@/features/chatbot/hooks/useChatBot";
import CtaSection from "@/features/chatbot/components/CtaSection";
import { Badge } from "@/shared/components/ui/badge";

import SectionTitle from "@/shared/components/common/SectionTitle";

import { ComparisonCard } from "@/features/home/components/ComparisonCard";
import { HowItWorksStep } from "@/features/home/components/HowItWorksStep";
import {
  benefits,
  howItWorksSteps,
  comparison,
  customerSegments,
  tecnologyData,
  securityData,
} from "@/features/home/data/homeData";
import tecnologyImage from "@/assets/technology.webp";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { getAverageWaterPrices } from "@/shared/lib/api";
import { Separator } from "@/shared/components/ui/separator";
import { useAppContext } from "@/shared/context/AppContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { HelpCircle, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/features/products/components/ProductCard";

const HomePage = () => {
  const { openChat } = useChatBot();
  const router = useRouter();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const autoScrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  const {
    faqs,
    faqsLoading,
    fetchFaqs,
    products,
    productsLoading,
    fetchProducts,
  } = useAppContext();

  useEffect(() => {
    setHasAnimated(true);
    getAverageWaterPrices();
    fetchFaqs();
    fetchProducts();
  }, [fetchFaqs, fetchProducts]);

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
            className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-white text-black mb-6 max-w-3xl mx-auto"
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
            className="text-base md:text-xl text-foreground mb-8 max-w-2xl mx-auto"
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
            Spar optil 50% på strømregningen med energieffektive vannvarmere som
            gir varmtvann på sekundet - helt uten lagringstank!
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
            <Button
              asChild
              size="lg"
              className="text-md px-8 font-normal"
              aria-label="Gå til forbrukskalkulator for å beregne ditt vannforbruk"
            >
              <Link href="/kalkulator">
                <CalculatorIcon className="w-4 h-4" aria-hidden="true" />
                Forbrukskalkulator
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-md font-normal px-8"
              aria-label="Se alle COAX vannvarmer produkter"
            >
              <Link href="/produkter">
                <PackageIcon className="w-4 h-4" aria-hidden="true" />
                Se produkter
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={
              hasAnimated
                ? {
                    opacity: 1,
                    transition: {
                      delay: ANIMATION_DELAY_BUTTONS + 0.2,
                      duration: ANIMATION_DURATION,
                      ease: EASING_CURVE,
                    },
                  }
                : {}
            }
            className="mt-8 text-sm text-muted-foreground"
          >
            <p className="font-medium">
              Over 20 års erfaring • 1000+ installasjoner i Norge
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-muted">
        <div className="container  mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              // Extract number from title for badge
              const numberMatch = b.title.match(
                /(\d+(?:-\d+)?%)|(\d+(?:-\d+)?\s*m²)/
              );
              const numberBadge = numberMatch ? numberMatch[0] : null;

              return (
                <Card key={i} variant="base">
                  <CardContent className="pt-6 text-center">
                    <div
                      className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto"
                      role="img"
                      aria-label={b.title}
                    >
                      <Icon
                        className="w-8 h-8 text-primary"
                        aria-hidden="true"
                      />
                      {numberBadge && (
                        <Badge
                          variant="primary"
                          className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 shadow-md"
                        >
                          {numberBadge}
                        </Badge>
                      )}
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
      <section className="py-20 md:py-32 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <SectionTitle
            title="Moderne løsning vs. Gammel teknologi"
            text="Se hvor stor forskjell en tankløs vannvarmer kan gjøre i strømforbruk, plass og komfort."
          />
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
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

          <blockquote className="border-l-4 border-primary pl-7 p-4 mt-8">
            <div className="flex flex-col gap-4 items-start">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl font-bold">
                  Se hvor mye du sparer
                </h3>
                <p>
                  Bruk vår forbrukskalkulator for å se hvor mye du kan spare med
                  COAX direkte vannvarmer. Sammenlign strømforbruk, vannforbruk
                  og årlige kostnader med tradisjonell varmtvannsbereder.
                </p>{" "}
              </div>
              <Button
                asChild
                size="lg"
                className="text-md px-8 font-normal shadow-md w-full md:w-auto"
                style={{ background: "var(--gradient-primary)" }}
                aria-label="Gå til forbrukskalkulator for å beregne din besparelse"
              >
                <Link href="/kalkulator">
                  <CalculatorIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                  Gå til forbrukskalkulator
                </Link>
              </Button>
            </div>
          </blockquote>
        </div>
      </section>

      {/* Customer Segments Carousel */}
      <section className="py-20 md:py-32 bg-muted">
        <div className="container max-w-6xl mx-auto px-4">
          <SectionTitle
            title="COAX – fleksibel varmtvannsløsning for alle typer bygg"
            text="Fra små hytter til moderne hjem og næringsbygg – COAX er utviklet for et bredt spekter av kunder og bruksområder."
          />
          <div className="space-y-4 mb-12 max-w-6xl mx-auto">
            <div className="text-muted-foreground">
              COAX vannvarmere bruker samme effektive varmeprinsipp i alle
              modeller, men leveres i ulike watteffekter og for både 1-faset og
              3-faset (230/400 Volt). Det gjør det enkelt å velge riktig
              kapasitet etter behov, fra små leiligheter til større boliger. Med
              direkte vannoppvarming uten tank får du raskt og stabilt
              varmtvann, samtidig som energi- og vannforbruket reduseres.
              Systemet gir presis kontroll over forbruk og er plassbesparende,
              driftssikkert og skalerbart.
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
              className="w-full"
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
              <CarouselIndicators onIndicatorClick={stopAutoScroll} />
            </Carousel>
          </div>

          <blockquote className="border-l-4 border-primary pl-7 p-4 mt-8">
            <div className="flex flex-col gap-4 items-start">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Finn riktig modell med Bøttemetoden
                </h3>
                <p>
                  Bøttemetoden er en enkel metode for å finne riktig modell
                  basert på vannforbruket ditt.
                </p>{" "}
              </div>
              <Button
                asChild
                size="lg"
                className="text-md px-8 font-normal shadow-md w-full md:w-auto"
                style={{ background: "var(--gradient-primary)" }}
                aria-label="Gå til Bøttemetoden for å finne riktig modell"
              >
                <Link href="/velg-modell">
                  <SlidersHorizontal
                    className="w-5 h-5 mr-2"
                    aria-hidden="true"
                  />
                  Gå til Bøttemetoden
                </Link>
              </Button>
            </div>
          </blockquote>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-background">
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

      {/* Technology Section */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-muted">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <SectionTitle
            className="text-black"
            title="Avansert teknologi for optimal ytelse"
            text="COAX er bygget med teknologi som sikrer høy effekt, sikkerhet og lang levetid."
          />

          <div className="mt-8 md:mt-12 gap-4 md:gap-6 grid grid-cols-1 md:grid-cols-2 auto-rows-auto">
            {/* Row 1: Image - top left */}
            <motion.div
              initial={{ opacity: 0, x: -ANIMATION_OFFSET_Y_SMALL }}
              animate={
                hasAnimated
                  ? {
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: ANIMATION_DELAY_INITIAL,
                        duration: ANIMATION_DURATION,
                        ease: EASING_CURVE,
                      },
                    }
                  : {}
              }
              className="relative w-full rounded-xl overflow-hidden order-1"
            >
              <div className="relative w-full" style={{ display: "block" }}>
                <Image
                  src={tecnologyImage}
                  alt="COAX teknologi og varmeenhet"
                  className="w-full h-full object-cover rounded-xl"
                  priority
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                  // width={1200}
                  // height={900}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              </div>
            </motion.div>

            {/* Row 1: Technology Data - top right */}
            <motion.div
              initial={{ opacity: 0, x: ANIMATION_OFFSET_Y_SMALL }}
              animate={
                hasAnimated
                  ? {
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: ANIMATION_DELAY_INITIAL + 0.1,
                        duration: ANIMATION_DURATION,
                        ease: EASING_CURVE,
                      },
                    }
                  : {}
              }
              className="order-2 md:order-2"
            >
              <Card className="h-full" variant="default">
                <CardHeader>
                  <CardTitle>Vermerens elementer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal pl-4 md:pl-6 space-y-2 border-b pb-3">
                    {tecnologyData.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-muted-foreground list-decimal text-sm md:text-base leading-relaxed"
                      >
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 md:mt-4">
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      Dette gir tryggere bruk, høyere energieffektivitet, lavere
                      driftskostnader, mer stabil temperatur og bedre
                      varmeeffekt, samtidig som risikoen for tørrkoking
                      reduseres, komponentenes levetid forlenges, og vedlikehold
                      blir enklere.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Row 2: Security Data - bottom spanning both columns */}
            <motion.div
              initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_SMALL }}
              animate={
                hasAnimated
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: ANIMATION_DELAY_INITIAL + 0.2,
                        duration: ANIMATION_DURATION,
                        ease: EASING_CURVE,
                      },
                    }
                  : {}
              }
              className="col-span-1 md:col-span-2 order-3 mt-4 md:mt-0"
            >
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Sikkerhetsfunksjoner</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-disc pl-4 md:pl-6 space-y-2 md:space-y-3">
                    {securityData.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-muted-foreground list-disc text-sm md:text-base leading-relaxed"
                      >
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* <div className="container px-4 max-w-6xl mx-auto bg-background">
        <CtaSection isHeader={false} />
      </div> */}
    </div>
  );
};

export default HomePage;
