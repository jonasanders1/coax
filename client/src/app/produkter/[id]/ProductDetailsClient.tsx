"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Download, Loader } from "lucide-react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import type { Product } from "@/types/product";
import { getProductById } from "@/lib/products";
import Link from "next/link";

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
};

type ProductDetailsClientProps = {
  productId: string;
  fallbackProduct?: Product | null;
};

export const ProductDetailsClient = ({
  productId,
  fallbackProduct,
}: ProductDetailsClientProps) => {
  const { data: fetchedProduct, isLoading, error } = useQuery({
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
  const toAbsoluteUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    const normalized =
      path.startsWith("/") || path.startsWith("#") ? path : `/${path}`;
    return `https://coax.jonasanders1.com${normalized}`;
  };

  const structuredData = useMemo(() => {
    if (!product) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: metaDescription,
      sku: product.id,
      category: product.category,
      image: product.images
        ?.map((img) => toAbsoluteUrl(img))
        .filter((url): url is string => Boolean(url)),
      brand: {
        "@type": "Organization",
        name: "COAX",
      },
      url: toAbsoluteUrl(canonicalPath),
    };
  }, [product, canonicalPath, metaDescription]);

  const primaryImage = product?.images?.[0] ?? null;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [primaryImage]);

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

  const { name, images, phase, priceFrom, description, ideal, specs } = product;
  const category = product.category;
  const voltageStr =
    (Array.isArray(product.voltage)
      ? product.voltage.join(", ")
      : product.voltage) ||
    (Array.isArray(specs?.voltage)
      ? specs?.voltage?.join(", ")
      : specs?.voltage);

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
          <div className="relative rounded-2xl overflow-hidden shadow-sm bg-muted/30 aspect-[4/3]">
            {primaryImage ? (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <img
                  src={primaryImage}
                  alt={name}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Ingen bilde tilgjengelig
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{name}</h1>

            <div className="rounded-xl border p-4 bg-card text-sm space-y-1">
              <div>
                <strong className="text-foreground">Fase:</strong> {phase}
              </div>
              {voltageStr && (
                <div>
                  <strong className="text-foreground">Spenning:</strong>{" "}
                  {voltageStr}
                </div>
              )}
              {specs?.flowRates?.[0] && (
                <div>
                  <strong className="text-foreground">Kapasitet:</strong>{" "}
                  {specs.flowRates[0]}
                </div>
              )}
              <div>
                <strong className="text-foreground">Kategori:</strong>{" "}
                {category}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Ideell for</h2>
              <ul className="space-y-1">
                {ideal.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="block text-muted-foreground text-sm mb-1">
                Fra
              </span>
              <span className="text-3xl font-semibold text-primary">
                {priceFrom}
              </span>
              <span className="block text-muted-foreground text-xs mt-0.5">
                inkl. mva
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 text-base">
                <Link href="/kontakt">Kontakt for kjøp</Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-base gap-2 bg-muted hover:bg-primary"
              >
                <Download className="w-4 h-4" /> Last ned datablad
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 mb-3">
            <h2 className="text-xl font-semibold">{name} beskrivelse</h2>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {phase}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {category}
              </Badge>
              {specs?.flowRates?.[0] && (
                <Badge variant="secondary" className="text-sm">
                  {specs.flowRates[0]}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </section>

        <Separator />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Accordion
              type="single"
              collapsible
              defaultValue="specs"
              className="border-none"
            >
              <AccordionItem value="specs">
                <AccordionTrigger className="text-lg font-semibold">
                  Tekniske spesifikasjoner
                </AccordionTrigger>
                <AccordionContent>
                  {specs && (
                    <ul className="space-y-2 text-sm">
                      {Object.entries(specs).map(([key, value]) => {
                        const label = SPEC_LABELS[key] ?? key;
                        return (
                          <li
                            key={key}
                            className="flex justify-between border-b pb-1"
                          >
                            <span className="font-medium">{label}</span>
                            <span className="text-muted-foreground">
                              {Array.isArray(value) ? value.join(", ") : value}
                            </span>
                          </li>
                        );
                      })}
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

