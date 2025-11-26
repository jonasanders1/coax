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
  color: "Farge",
  phase: "Fase",
  voltage: "Spenning (V)",
  powerOptions: "Effektalternativer (kW)",
  current: "Strøm (A)",
  flowRates: "Vannstrøm (L/min)",
  circuitBreaker: "Sikringskrav",
  recommendedConnectionWire: "Anbefalt kabeltykkelse (mm²)",
  safetyClass: "Beskyttelsesklasse",
  temperatureRange: "Temperaturområde (°C)",
  overheatProtection: "Overopphetingsvern (°C)",
  thermalCutoff: "Termisk utkobling (°C)",
  workingPressure: "Arbeidstrykk",
  dimensions: "Mål (H×B×D mm)",
  efficiency: "Energieffektivitet (%)",
  weight: "Vekt (kg)",
  minWaterFlowActivation: "Min. vannmengde for aktivering",
  pipeConnection: "Rørtilkobling",
  material: "Materiale",
  tankCapacity: "Tankkapasitet (L)",
  compressor: "Kompressor",
  pipeSize: "Anbefalt rørdimensjon",
  productSize: "Produktstørrelse (mm)",
  giftBoxSize: "Gaveeske størrelse (mm)",
  packageSize: "Emballasjestørrelse (mm)",
  certifications: "Sertifiseringer",
};

// Helper function to get the unit for a spec key
const getUnitForKey = (key: string): string | null => {
  switch (key) {
    case "flowRates":
      return " L/min";
    case "powerOptions":
      return " kW";
    case "overheatProtection":
      return " °C";
    case "thermalCutoff":
      return " °C";
    case "workingPressure":
      return null;
    case "temperatureRange":
      return " °C";
    case "current":
      return " A";
    case "connectionWire":
      return " mm²";
    case "voltage":
      return " V";
    case "weight":
      return " kg";
    case "tankCapacity":
      return " L";
    case "phase":
      return "-fase";
    case "efficiency":
      return " %";
    default:
      return null;
  }
};

// Helper function to extract numeric value from a string or number
const extractNumericValue = (value: string | number): string => {
  const numValue = typeof value === "number" ? value : parseFloat(value);
  if (!isNaN(numValue)) {
    return numValue.toString();
  }
  return String(value);
};

// Helper function to format values with appropriate units
const formatSpecValue = (key: string, value: unknown): string => {
  // Handle arrays - group values and add unit once at the end
  if (Array.isArray(value)) {
    const unit = getUnitForKey(key);

    // Handle dimensions specially (can be "100x200x300" format)
    if (key === "dimensions") {
      return value.map((v) => formatSpecValue(key, v)).join(", ");
    }

    // Temperature range as "min - max °C" instead of "min, max °C"
    if (key === "temperatureRange") {
      const numericValues = value
        .map((v) =>
          typeof v === "number" ? v : parseFloat(String(v))
        )
        .filter((v) => !Number.isNaN(v));
      if (!numericValues.length) return "";
      const text = `${numericValues[0]}${
        numericValues.length > 1
          ? ` - ${numericValues[numericValues.length - 1]}`
          : ""
      }`;
      return unit ? `${text}${unit}` : text;
    }

    // For other arrays, extract numeric values and add unit once
    if (unit) {
      const numericValues = value.map((v) => extractNumericValue(v));
      return `${numericValues.join(", ")}${unit}`;
    }

    // For keys without units, just join with commas
    return value.join(", ");
  }

  // Normalize numbers to strings
  if (typeof value === "number") {
    value = value.toString();
  }

  // Handle dimensions specially (can be "100x200x300" format)
  if (key === "dimensions") {
    // Check if it's already formatted with separators
    const str = String(value);
    if (str.includes("×") || str.includes("x") || str.includes("X")) {
      // Split by any separator, trim, and join with proper formatting
      const parts = str
        .split(/[×xX]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      return `${parts.join(" × ")} mm`;
    }
    // If it's a single number, add mm
    const numValue = parseFloat(String(value));
    if (!isNaN(numValue)) {
      return `${String(value)} mm`;
    }
    return String(value);
  }

  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) {
    return String(value); // Return as-is if not a number
  }

  // Add units based on spec key
  const unit = getUnitForKey(key);
  if (unit) {
    return `${value}${unit}`;
  }

  return String(value);
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
      name: product.model,
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
    model,
    images,
    priceFrom,
    description,
    ideal,
    inStock,
    specs,
    features,
    installation,
  } = product;
  const name = model;
  const phase = product.specs?.phase;
  const category = product.category;
  const rawVoltage = specs?.voltage;
  const voltageStr =
    Array.isArray(rawVoltage) && rawVoltage.length
      ? rawVoltage.join(", ")
      : typeof rawVoltage === "string" && rawVoltage
      ? rawVoltage
      : null;

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
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    inStock
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-yellow-100 text-yellow-800"
                  )}
                >
                  {inStock ? "På lager" : "Ikke på lager"}
                </span>
              </div>
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
              {phase !== undefined && (
                <div>
                  <strong className="text-foreground">Fase:</strong> {phase}
                  -fase
                </div>
              )}
              {voltageStr && (
                <div>
                  <strong className="text-foreground">Spenning:</strong>{" "}
                  {voltageStr}
                </div>
              )}
              {specs?.flowRates &&
                specs.flowRates.length > 0 &&
                (() => {
                  // Parse numeric values from flow rates (now just numbers)
                  const parseFlowRate = (rate: string): number | null => {
                    const num = parseFloat(rate);
                    return isNaN(num) ? null : num;
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
                            {minFlowStr} L/min
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <strong className="text-foreground">
                              Kapasitet:
                            </strong>{" "}
                            {minFlowStr} - {maxFlowStr} L/min
                          </div>
                        );
                      }
                    }
                  }
                  return null;
                })()}
              {specs?.powerOptions &&
                (() => {
                  const rawOptions = specs.powerOptions;
                  const optionStrings: string[] = Array.isArray(rawOptions)
                    ? rawOptions.map((p) => String(p))
                    : [String(rawOptions)];

                  const parsePower = (power: string): number | null => {
                    const num = parseFloat(power);
                    return isNaN(num) ? null : num;
                  };

                  const powerValues = optionStrings
                    .map(parsePower)
                    .filter((val): val is number => val !== null);

                  if (powerValues.length > 0) {
                    const minPower = Math.min(...powerValues);
                    const maxPower = Math.max(...powerValues);

                    // Find the original strings that correspond to min and max
                    const minPowerStr = optionStrings.find((power) => {
                      const val = parsePower(power);
                      return val !== null && val === minPower;
                    });
                    const maxPowerStr = optionStrings.find((power) => {
                      const val = parsePower(power);
                      return val !== null && val === maxPower;
                    });

                    if (minPowerStr && maxPowerStr) {
                      if (minPower === maxPower) {
                        return (
                          <div>
                            <strong className="text-foreground">Effekt:</strong>{" "}
                            {minPowerStr} kW
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <strong className="text-foreground">Effekt:</strong>{" "}
                            {minPowerStr} - {maxPowerStr} kW
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
          <div className="flex flex-col gap-2 mb-1 md:mb-3">
            <h2 className="text-lg md:text-xl font-semibold">
              Produktbeskrivelse
            </h2>
          </div>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <div className="flex flex-col gap-2 mb-1 md:mb-3 mt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-semibold">Lagerstatus</h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                  inStock
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-yellow-100 text-yellow-800"
                )}
              >
                {inStock ? "På lager" : "Ikke på lager"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {inStock
                ? "Dette produktet er for øyeblikket på lager og kan bestilles."
                : "Dette produktet er ikke på lager. Ta kontakt for estimert leveringstid."}
            </p>
          </div>
        </section>

        <Separator />

        <section className="grid grid-cols-1 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Accordion type="multiple" className="border-none">
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
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm md:text-base border-collapse">
                        <tbody>
                          {(
                            [
                              "color",
                              "phase",
                              "voltage",
                              "powerOptions",
                              "current",
                              "flowRates",
                              "circuitBreaker",
                              "recommendedConnectionWire",
                              "safetyClass",
                              "temperatureRange",
                              "overheatProtection",
                              "thermalCutoff",
                              "workingPressure",
                              "dimensions",
                              "efficiency",
                              "weight",
                              "minWaterFlowActivation",
                              "pipeConnection",
                              "material",
                              "tankCapacity",
                              "compressor",
                              "pipeSize",
                              "productSize",
                              "giftBoxSize",
                              "packageSize",
                              "certifications",
                            ] as const
                          ).map((key) => {
                            const value = (specs as Record<string, unknown>)[key];
                            if (
                              value === undefined ||
                              value === null ||
                              (typeof value === "string" &&
                                value.trim().length === 0) ||
                              (Array.isArray(value) && value.length === 0)
                            ) {
                              return null;
                            }

                            const label = SPEC_LABELS[key] ?? key;
                            return (
                              <tr
                                key={key}
                                className="border-b last:border-b-0"
                              >
                                <th className="py-2 pr-4 text-left font-medium align-top whitespace-nowrap">
                                  {label}
                                </th>
                                <td className="py-2 text-muted-foreground text-right">
                                  {formatSpecValue(key, value)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
