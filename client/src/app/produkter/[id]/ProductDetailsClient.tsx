"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import type { Product } from "@/types/product";
import { getProductById } from "@/lib/products";
import Link from "next/link";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { absoluteUrl } from "@/config/site";
import { cn } from "@/lib/utils";

const SPEC_LABELS: Record<string, string> = {
  flowRates: "Vannstrøm (L/min)",
  flowAt40C: "Vannstrøm ved 40°C",
  powerOptions: "Effektalternativer",
  voltage: "Spenning (V)",
  current: "Strøm (A)",
  fuse: "Sikringskrav (A)",
  safetyClass: "Beskyttelsesklasse",
  tempRange: "Temperaturområde (°C)",
  overheatProtection: "Overopphetingsvern",
  workingPressure: "Arbeidstrykk (bar)",
  dimensions: "Mål (H×B×D mm)",
  weight: "Vekt (kg)",
  connectionWire: "Anbefalt kabeltykkelse",
  pipeSize: "Anbefalt rørdimensjon",
  tankCapacity: "Tankkapasitet (L)",
  efficiency: "Energieffektivitet (%)",
  pressureResistance: "Trykkbestandighet",
  material: "Materiale",
  compressor: "Kompressor",
  certifications: "Sertifiseringer",
};

type ProductDetailsClientProps = {
  productId: string;
  fallbackProduct?: Product | null;
};

export const ProductDetailsClient = ({
  productId,
  fallbackProduct,
}: ProductDetailsClientProps) => {
  const {
    data: fetchedProduct,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    initialData: fallbackProduct ?? undefined,
  });

  const product = fetchedProduct ?? fallbackProduct ?? undefined;

  const metaDescription = useMemo(() => {
    if (!product?.description) {
      return "Oppdag detaljer om COAX sine energieffektive vannvarmere.";
    }
    return product.description.slice(0, 155);
  }, [product?.description]);

  const canonicalPath = `/produkter/${productId}`;
  const resolveAbsoluteUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith("/") || path.startsWith("#")) {
      return absoluteUrl(path);
    }
    return absoluteUrl(`/${path}`);
  };

  const structuredData = useMemo(() => {
    if (!product) return undefined;
    const priceValue =
      typeof product.priceFrom === "number"
        ? product.priceFrom
        : Number.parseFloat(String(product.priceFrom));
    const offer =
      Number.isFinite(priceValue) && priceValue > 0
        ? {
            "@type": "Offer" as const,
            price: priceValue.toFixed(2),
            priceCurrency: "NOK",
            availability: "https://schema.org/InStock",
            url: resolveAbsoluteUrl(canonicalPath),
          }
        : undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: metaDescription,
      sku: product.id,
      category: product.category,
      image: product.images
        ?.map((img) => resolveAbsoluteUrl(img))
        .filter((url): url is string => Boolean(url)),
      brand: {
        "@type": "Organization",
        name: "COAX",
      },
      url: resolveAbsoluteUrl(canonicalPath),
      offers: offer,
    };
  }, [product, canonicalPath, metaDescription]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground">Laster produktdata...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 ">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Produkt ikke funnet</h2>
          <p className="text-muted-foreground mb-4">
            Vi fant ikke produktdata for dette produktet. Gå tilbake til
            produktoversikten og prøv igjen.
          </p>
          <Button asChild variant="secondary">
            <Link href="/produkter">Tilbake til produkter</Link>
          </Button>
        </div>
      </div>
    );
  }

  const {
    name,
    images,
    phase,
    priceFrom,
    description,
    ideal,
    specs,
    features,
    installation,
    certifications,
  } = product;
  const category = product.category;
  const voltageStr =
    (Array.isArray(product.voltage)
      ? product.voltage.join(", ")
      : product.voltage) ||
    (Array.isArray(specs?.voltage)
      ? specs?.voltage?.join(", ")
      : specs?.voltage);

  console.log(specs);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background animate-fade-in-up">
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        {structuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        ) : null}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: "hsl(var(--muted-foreground))",
            },
          }}
        >
          <Link
            href="/"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Hjem
          </Link>
          <Link
            href="/produkter"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Produkter
          </Link>
          <Typography sx={{ color: "hsl(var(--accent))" }}>{name}</Typography>
        </Breadcrumbs>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <ProductImageGallery images={images} name={name} />

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                {name}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-semibold text-foreground">
                  {priceFrom} kr
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">
                  (inkl. mva)
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Ideell for:
              </h2>
              <ul className="space-y-1">
                {ideal.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm md:text-base text-muted-foreground"
                  >
                    <CheckCircle className="w-5 min-w-5 min-h-5 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-4 bg-card text-sm md:text-base space-y-1">
              <div>
                <strong className="text-foreground">Fase:</strong> {phase}
              </div>
              {voltageStr && (
                <div>
                  <strong className="text-foreground">Spenning:</strong>{" "}
                  {voltageStr}
                </div>
              )}
              {specs?.flowRates &&
                specs.flowRates.length > 0 &&
                (() => {
                  // Extract numeric values from flow rates (e.g., "3 L/min" -> 3)
                  const parseFlowRate = (rate: string): number | null => {
                    const match = rate.match(/(\d+(?:\.\d+)?)/);
                    return match ? parseFloat(match[1]) : null;
                  };

                  const flowRateValues = specs.flowRates
                    .map(parseFlowRate)
                    .filter((val): val is number => val !== null);

                  if (flowRateValues.length > 0) {
                    const minFlow = Math.min(...flowRateValues);
                    const maxFlow = Math.max(...flowRateValues);

                    // Find the original strings that correspond to min and max
                    const minFlowStr = specs.flowRates.find((rate) => {
                      const val = parseFlowRate(rate);
                      return val !== null && val === minFlow;
                    });
                    const maxFlowStr = specs.flowRates.find((rate) => {
                      const val = parseFlowRate(rate);
                      return val !== null && val === maxFlow;
                    });

                    if (minFlowStr && maxFlowStr) {
                      if (minFlow === maxFlow) {
                        return (
                          <div>
                            <strong className="text-foreground">
                              Kapasitet:
                            </strong>{" "}
                            {minFlowStr}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <strong className="text-foreground">
                              Kapasitet:
                            </strong>{" "}
                            {minFlowStr} - {maxFlowStr}
                          </div>
                        );
                      }
                    }
                  }
                  return null;
                })()}
              {specs?.powerOptions &&
                specs.powerOptions.length > 0 &&
                (() => {
                  // Extract numeric values from power options (e.g., "3.5 kW" -> 3.5)
                  const parsePower = (power: string): number | null => {
                    const match = power.match(/(\d+(?:\.\d+)?)/);
                    return match ? parseFloat(match[1]) : null;
                  };

                  const powerValues = specs.powerOptions
                    .map(parsePower)
                    .filter((val): val is number => val !== null);

                  if (powerValues.length > 0) {
                    const minPower = Math.min(...powerValues);
                    const maxPower = Math.max(...powerValues);

                    // Find the original strings that correspond to min and max
                    const minPowerStr = specs.powerOptions.find((power) => {
                      const val = parsePower(power);
                      return val !== null && val === minPower;
                    });
                    const maxPowerStr = specs.powerOptions.find((power) => {
                      const val = parsePower(power);
                      return val !== null && val === maxPower;
                    });

                    if (minPowerStr && maxPowerStr) {
                      if (minPower === maxPower) {
                        return (
                          <div>
                            <strong className="text-foreground">Effekt:</strong>{" "}
                            {minPowerStr}
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <strong className="text-foreground">Effekt:</strong>{" "}
                            {minPowerStr} - {maxPowerStr}
                          </div>
                        );
                      }
                    }
                  }
                  return null;
                })()}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 text-base">
                <Link href="/kontakt">Kontakt for kjøp</Link>
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 mb-3">
            <h2 className="text-lg md:text-xl font-semibold">
              Produktbeskrivelse
            </h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </section>

        <Separator />

        <section className="grid grid-cols-1 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Accordion
              type="multiple"
              className="border-none"
            >
              {features && features.length > 0 && (
                <AccordionItem value="features">
                  <AccordionTrigger className="text-base md:text-lg font-semibold">
                    Funksjoner
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {features.map((feature, index) => {
                        return (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm md:text-base text-muted-foreground"
                          >
                            <CheckCircle className="w-5 min-w-5 min-h-5 text-green-600" />
                            {feature}
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              {installation && (
                <AccordionItem value="installation">
                  <AccordionTrigger className="text-base md:text-lg font-semibold">
                    Installasjon
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {installation}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="specs">
                <AccordionTrigger className="text-base md:text-lg font-semibold">
                  Tekniske spesifikasjoner
                </AccordionTrigger>
                <AccordionContent>
                  {specs && (
                    <ul className="space-y-2 text-sm md:text-base">
                      {Object.entries(specs).map(
                        ([key, value], index, array) => {
                          const label = SPEC_LABELS[key] ?? key;
                          const isLast = index === array.length - 1;
                          return (
                            <li
                              key={key}
                              className="flex justify-between border-b pb-1"
                            >
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : value}
                              </span>
                            </li>
                          );
                        }
                      )}
                      {certifications && certifications.length > 0 && (
                        <li className="flex justify-between">
                          <span className="font-medium">
                            {SPEC_LABELS.certifications}
                          </span>
                          <span className="text-muted-foreground">
                            {certifications.join(", ")}
                          </span>
                        </li>
                      )}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <aside className="space-y-6" />
        </section>
      </div>
    </div>
  );
};
