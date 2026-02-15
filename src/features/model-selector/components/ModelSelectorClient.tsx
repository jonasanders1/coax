"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Label } from "@/shared/components/ui/label";
import { AlertCircle, CheckCircle, Zap, Droplet, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { useAppContext } from "@/shared/context/AppContext";
import PageTitle from "@/shared/components/common/PageTitle";
import { Loading } from "@/shared/components/ui/loading";
import {
  StructuredData,
  ServiceSchema,
  HowToSchema,
} from "@/shared/components/common/StructuredData";
import { siteUrl } from "@/config/site";
import { bucketMethodSteps } from "@/features/model-selector/data/modelSelectorData";
import {
  formatFlowRange,
  formatPowerRange,
  formatSpecValue,
  extractFlowRange,
  getSpecLabel,
  shouldDisplayAsBadges,
  formatSpecForBadges,
} from "@/features/products/utils/productUtils";
import {
  type Recommendation,
  filterProductsByCategory,
  createRecommendations,
  createTableProducts,
  calculateRecommendationResult,
} from "@/features/model-selector/utils/modelSelectorUtils";
import {
  BUCKET_VOLUME_LITERS,
  BUCKET_VOLUME_ML,
  DEFAULT_SECONDS,
  SECONDS_MIN,
  SECONDS_MAX,
} from "@/features/model-selector/constants/modelSelector";

const ModelSelectorClient = () => {
  const { products, productsLoading, productsError, fetchProducts } =
    useAppContext();
  const [seconds, setSeconds] = useState<number>(DEFAULT_SECONDS);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [flowRate, setFlowRate] = useState<number | null>(null);

  useEffect(() => {
    // Fetch products if not already loaded
    if (!productsLoading && products.length === 0 && !productsError) {
      fetchProducts();
    }
  }, [products, productsLoading, productsError, fetchProducts]);

  // Filter products by category "Direkte vannvarmer"
  const filteredProducts = useMemo(
    () => filterProductsByCategory(products, "Direkte vannvarmer"),
    [products]
  );

  // Recommendations for model selector (based on flow calculation)
  const recommendations = useMemo<Recommendation[]>(
    () => createRecommendations(filteredProducts),
    [filteredProducts]
  );

  // All products for the table (not filtered by flow)
  const tableProducts = useMemo(
    () => createTableProducts(filteredProducts),
    [filteredProducts]
  );

  const calculateRecommendation = () => {
    const lpm = BUCKET_VOLUME_ML / seconds;
    const result = calculateRecommendationResult(recommendations, lpm);

    if (result) {
      setResult(result.recommendation);
      setFlowRate(result.calculatedFlowRate);
    } else {
      setResult(null);
      setFlowRate(null);
    }
  };

  // Render flow rates as a single badge with range
  const renderFlowRates = (flowRates: string[]) => {
    const range = extractFlowRange(flowRates);

    if (!range) {
      return <span className="text-muted-foreground">—</span>;
    }

    const rangeText = formatFlowRange(range.min, range.max);

    return (
      <Badge variant="primary" className="text-sm">
        {rangeText}
      </Badge>
    );
  };

  // Render power options as badges
  const renderPowerOptions = (powerOptions: number[]) => {
    if (powerOptions.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {powerOptions.map((power, index) => (
          <Badge key={index} variant="primary" className="text-sm">
            {power} kW
          </Badge>
        ))}
      </div>
    );
  };

  const isCalculateDisabled =
    productsLoading || !recommendations.length || Boolean(productsError);

  const serviceSchema = useMemo(
    () =>
      ServiceSchema({
        name: "COAX Bøttemetode-kalkulator",
        description:
          "Finn riktig COAX-modell med Bøttemetoden. Den enkleste måten å finne riktig kapasitet på.",
        url: `${siteUrl}/velg-modell`,
      }),
    []
  );

  const howToSchema = useMemo(
    () =>
      HowToSchema({
        name: "Bøttemetoden for å finne riktig COAX vannvarmer",
        description:
          "En enkel metode for å måle vannforbruket ditt og finne riktig COAX-modell",
        url: `${siteUrl}/velg-modell`,
        steps: bucketMethodSteps,
      }),
    []
  );

  // Show loading state while products are being fetched
  if (productsLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-muted dark:bg-background animate-fade-in-up">
        <div className="container mx-auto px-4 max-w-6xl">
          <PageTitle
            title="Finn riktig COAX-modell med enkel bøttemetode"
            text="Den enkleste måten å finne riktig kapasitet på."
          />
          <div className="flex items-center justify-center py-16">
            <Loading text="Laster produkter..." size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if products failed to load
  if (productsError) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-muted dark:bg-background animate-fade-in-up">
        <div className="container mx-auto px-4 max-w-6xl">
          <PageTitle
            title="Finn riktig COAX-modell med Bøttemetoden"
            text="Den enkleste måten å finne riktig kapasitet på."
          />
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-destructive text-center">
              Kunne ikke laste produkter. Prøv å oppdatere siden.
            </p>
            <Button onClick={fetchProducts} variant="outline">
              Prøv igjen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted dark:bg-background animate-fade-in-up">
      <StructuredData data={serviceSchema} />
      <StructuredData data={howToSchema} />
      <div className="container mx-auto px-4 max-w-6xl">
        <PageTitle
          title="Finn riktig COAX-modell med Bøttemetoden"
          text="Den enkleste måten å finne riktig kapasitet på."
        />

        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Bøttemetode-kalkulator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="w-full bg-muted p-4 rounded-lg lg:w-auto lg:min-w-[280px] lg:max-w-md">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    Slik gjør du:
                  </h3>

                  <div className="lg:pr-4">
                    <ol className="space-y-2.5 text-sm md:text-base text-muted-foreground list-decimal list-inside ml-1">
                      <li className="pl-1">
                        Ta med deg en vanlig {BUCKET_VOLUME_LITERS}-liters bøtte i
                        dusjen
                      </li>
                      <li className="pl-1">
                        Skru på vannet til ønsket dusjtemperatur og trykk
                      </li>
                      <li className="pl-1">
                        Start tidtaker og fyll bøtta helt opp
                      </li>
                      <li className="pl-1">
                        Stopp når bøtta er full og noter antall sekunder
                      </li>
                      <li className="pl-1">
                        Fyll inn tiden under, så regner vi ut riktig modell
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="w-full flex-1 lg:min-w-0">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="seconds"
                        className="text-base mb-4 block font-medium"
                      >
                        Tiden det tar for å fylle en vanlig {BUCKET_VOLUME_LITERS}L bøtte:{" "}
                        <strong className="text-primary">
                          {seconds} sekunder
                        </strong>
                      </Label>
                      <Slider
                        id="seconds"
                        value={[seconds]}
                        onValueChange={(value) => setSeconds(value[0])}
                        min={SECONDS_MIN}
                        max={SECONDS_MAX}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex gap-1 flex-row justify-between text-sm text-muted-foreground">
                        <span>Høy strøm</span>
                        <span>Lav strøm</span>
                      </div>
                    </div>
                    <Button
                      onClick={calculateRecommendation}
                      size="lg"
                      className="w-full text-base"
                      disabled={isCalculateDisabled}
                      aria-label={
                        productsLoading
                          ? "Laster produkter"
                          : "Beregn anbefalt COAX modell basert på valgt tid"
                      }
                    >
                      {productsLoading ? "Laster produkter..." : "Finn modell"}
                    </Button>

                    {productsError ? (
                      <p className="text-sm text-destructive">
                        Kunne ikke laste produkter. Prøv igjen senere.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {result &&
                flowRate &&
                (() => {
                  // Find the full product data
                  const product = filteredProducts.find(
                    (p) => p.id === result.id
                  );
                  const productImage = product?.images?.[0];
                  const specs = product?.specs;

                  // Get values using consistent formatting
                  const phaseValue = specs?.phase !== undefined
                    ? formatSpecValue("phase", specs.phase)
                    : `${result.phase}-fase`;

                  // Flow rates: use specs if available, otherwise format from result
                  const flowRatesRaw = specs?.flowRates && specs.flowRates.length > 0
                    ? specs.flowRates
                    : null;
                  const flowRatesFormatted = flowRatesRaw
                    ? null // Will format based on shouldDisplayAsBadges
                    : formatFlowRange(result.minFlow, result.maxFlow);

                  // Power options: use specs if available, otherwise format from result
                  const powerOptionsRaw = specs?.powerOptions
                    ? specs.powerOptions
                    : null;
                  const powerOptionsFormatted = powerOptionsRaw
                    ? null // Will format based on shouldDisplayAsBadges
                    : (result.minPowerOption > 0 && result.maxPowerOption > 0
                      ? formatPowerRange(result.minPowerOption, result.maxPowerOption)
                      : "—");

                  const dimensionsValue = specs?.dimensions
                    ? formatSpecValue("dimensions", specs.dimensions)
                    : "—";

                  const usageItems = result.usage
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  return (
                    <div className="space-y-6 border-t border-border pt-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold">Anbefaling</h3>
                        </div>
                        <p className="text-muted-foreground">
                          Basert på din vannmengde:{" "}
                          <span className="font-semibold text-primary">
                            {flowRate} L/min
                          </span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8">
                        {/* Product Image */}
                        <div className="w-full md:w-fit md:h-full">
                          {productImage && (
                            <div className="relative aspect-square w-full max-w-[320px] md:w-auto md:h-full md:aspect-square rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={productImage}
                                alt={`${result.model} COAX vannvarmer`}
                                fill
                                className="object-cover"
                                sizes="320px"
                              />
                            </div>
                          )}
                        </div>

                        {/* Specs Table */}
                        <div className="flex flex-col space-y-4 h-full">
                          <Table className="rounded-lg overflow-hidden">
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-bold text-lg">
                                  Modell
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                  <span className="text-lg font-bold">{result.model}</span>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {specs?.phase !== undefined && (
                                <TableRow>
                                  <TableCell className="font-medium">
                                    {getSpecLabel("phase")}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {phaseValue}
                                  </TableCell>
                                </TableRow>
                              )}
                              {(flowRatesRaw || flowRatesFormatted) && (
                                <TableRow>
                                  <TableCell className="font-medium">
                                    {getSpecLabel("flowRates")}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {flowRatesRaw && shouldDisplayAsBadges("flowRates", flowRatesRaw) ? (
                                      <div className="flex flex-wrap gap-2 justify-end">
                                        {formatSpecForBadges("flowRates", flowRatesRaw as unknown[]).map(
                                          (badgeText, index) => (
                                            <Badge
                                              key={index}
                                              variant="primary"
                                              className="text-sm"
                                            >
                                              {badgeText}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      flowRatesRaw
                                        ? formatSpecValue("flowRates", flowRatesRaw)
                                        : flowRatesFormatted
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                              {(powerOptionsRaw || powerOptionsFormatted) && powerOptionsFormatted !== "—" && (
                                <TableRow>
                                  <TableCell className="font-medium">
                                    {getSpecLabel("powerOptions")}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {powerOptionsRaw && shouldDisplayAsBadges("powerOptions", powerOptionsRaw) ? (
                                      <div className="flex flex-wrap gap-2 justify-end">
                                        {formatSpecForBadges("powerOptions", powerOptionsRaw as unknown[]).map(
                                          (badgeText, index) => (
                                            <Badge
                                              key={index}
                                              variant="primary"
                                              className="text-sm"
                                            >
                                              {badgeText}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      powerOptionsRaw
                                        ? formatSpecValue("powerOptions", powerOptionsRaw)
                                        : powerOptionsFormatted
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                              {dimensionsValue !== "—" && (
                                <TableRow>
                                  <TableCell className="font-medium">
                                    {getSpecLabel("dimensions")}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {dimensionsValue}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>

                          {/* View Product Link */}
                          {product && (
                            <Button asChild size="lg" className="w-full">
                              <Link href={`/produkter/${product.id}`}>
                                Les mer om {result.model}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produkttabell</CardTitle>
            <p className="text-muted-foreground">
              Oversikt over alle COAX direkte vannvarmere
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table
                className="text-sm w-full rounded-lg overflow-hidden"
                style={{ minWidth: "1000px" }}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Modell</TableHead>
                    <TableHead className="whitespace-nowrap">
                      {getSpecLabel("phase")}
                    </TableHead>
                    <TableHead>{getSpecLabel("flowRates")}</TableHead>
                    <TableHead>{getSpecLabel("powerOptions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Laster produkter...
                      </TableCell>
                    </TableRow>
                  ) : tableProducts.length > 0 ? (
                    tableProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="p-3 font-semibold whitespace-nowrap">
                          {product.model}
                        </TableCell>
                        <TableCell className="p-3 whitespace-nowrap">
                          {product.phase}
                        </TableCell>
                        <TableCell className="p-3">
                          {renderFlowRates(product.flowRates)}
                        </TableCell>
                        <TableCell className="p-3">
                          {renderPowerOptions(product.powerOptions)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Ingen produktdata tilgjengelig.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelSelectorClient;
