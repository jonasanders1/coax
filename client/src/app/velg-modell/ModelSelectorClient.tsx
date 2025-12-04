"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Zap, Droplet, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/AppContext";
import PageTitle from "@/components/PageTitle";
import {
  StructuredData,
  ServiceSchema,
  HowToSchema,
} from "@/components/StructuredData";
import { siteUrl } from "@/config/site";
import { bucketMethodSteps } from "@/data/modelSelectorData";
import {
  formatFlowRange,
  formatPowerRange,
  parseFlowValues,
} from "@/utils/productUtils";
import {
  type Recommendation,
  filterProductsByCategory,
  createRecommendations,
  createTableProducts,
  calculateRecommendationResult,
} from "@/utils/modelSelectorUtils";
import {
  BUCKET_VOLUME_LITERS,
  BUCKET_VOLUME_ML,
  DEFAULT_SECONDS,
  SECONDS_MIN,
  SECONDS_MAX,
  FLOW_RATE_DECIMAL_THRESHOLD,
} from "@/constants/modelSelector";

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
    if (flowRates.length === 0 || flowRates[0] === "—") {
      return <span className="text-muted-foreground">—</span>;
    }
    
    // Parse all numeric values from flow rates
    const flowValues = flowRates
      .flatMap(parseFlowValues)
      .filter((num) => !Number.isNaN(num))
      .sort((a, b) => a - b);
    
    if (flowValues.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    
    const lowest = flowValues[0];
    const highest = flowValues[flowValues.length - 1];
    
    // Format numbers: show 0 decimals if >= threshold, otherwise 1 decimal
    const format = (value: number) =>
      Number.isFinite(value)
        ? value.toFixed(value >= FLOW_RATE_DECIMAL_THRESHOLD ? 0 : 1)
        : "∞";
    
    const rangeText = lowest === highest
      ? `${format(lowest)} L/min`
      : `${format(lowest)} - ${format(highest)} L/min`;
    
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
                        Ta med deg en {BUCKET_VOLUME_LITERS}-liters bøtte i dusjen
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
                        Tid for å fylle {BUCKET_VOLUME_LITERS}L bøtte:{" "}
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
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between text-xs sm:text-sm text-muted-foreground">
                        <span>Høy strøm</span>
                        <span>Lav strøm</span>
                      </div>
                    </div>
                    <Button
                      onClick={calculateRecommendation}
                      size="lg"
                      className="w-full text-base"
                      disabled={isCalculateDisabled}
                      aria-label={productsLoading ? "Laster produkter" : "Beregn anbefalt COAX modell basert på valgt tid"}
                    >
                      {productsLoading ? "Laster produkter..." : "Finn modell"}
                    </Button>

                    <Alert
                      variant="default"
                      className="shadow-card-md border border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/70"
                    >
                      <AlertTitle className="font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        Viktig informasjon
                      </AlertTitle>
                      <AlertDescription className="mt-1 font-medium leading-relaxed text-red-900 dark:text-red-100">
                        <p>
                          Kontakt alltid en elektriker for en vurdering av ditt
                          elektriske anlegg.
                        </p>
                      </AlertDescription>
                    </Alert>
                    {productsError ? (
                      <p className="text-sm text-destructive">
                        Kunne ikke laste produkter. Prøv igjen senere.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {result && flowRate && (
                <Card
                  className="shadow-lg overflow-hidden relative"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {/* Decorative elements */}
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
                  <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
                  <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-white text-2xl">
                      <CheckCircle className="h-6 w-6" />
                      {result.model}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base mt-2">
                      Beregnet vannmengde:{" "}
                      <span className="font-semibold">{flowRate} L/min</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 relative z-10">
                    {(() => {
                      const usageItems = result.usage
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean);
                      const flowRangeLabel = formatFlowRange(
                        result.minFlow,
                        result.maxFlow
                      );
                      const powerRangeLabel =
                        result.minPowerOption > 0 && result.maxPowerOption > 0
                          ? formatPowerRange(
                              result.minPowerOption,
                              result.maxPowerOption
                            )
                          : "—";
                      return (
                        <div className="space-y-6">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Droplet className="w-5 h-5 text-white" />
                                <p className="text-sm text-white/90 font-medium">
                                  Strålestørrelse
                                </p>
                              </div>
                              <p className="text-xl font-bold text-white">
                                {flowRangeLabel}
                              </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-white" />
                                <p className="text-sm text-white/90 font-medium">
                                  Effekt
                                </p>
                              </div>
                              <p className="text-xl font-bold text-white">
                                {powerRangeLabel}
                              </p>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <Settings className="w-5 h-5 text-white" />
                                <p className="text-sm text-white/90 font-medium">
                                  Fase
                                </p>
                              </div>
                              <p className="text-xl font-bold text-white">
                                {result.phase}
                              </p>
                            </div>
                          </div>

                          {/* Usage Items */}
                          {usageItems.length > 0 && (
                            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                              <p className="text-sm font-semibold text-white mb-3">
                                Ideell for:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {usageItems.map((item) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-sm text-white font-medium"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
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
              <table
                className="text-sm w-full"
                style={{ minWidth: "1000px", tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "40%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 whitespace-nowrap">Modell</th>
                    <th className="text-left p-3 whitespace-nowrap">Fase</th>
                    <th className="text-left p-3 whitespace-nowrap">
                      Liter per minutt
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">
                      Effekt (kW)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Laster produkter...
                      </td>
                    </tr>
                  ) : tableProducts.length > 0 ? (
                    tableProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b bg-background hover:bg-muted"
                      >
                        <td className="p-3 font-semibold">{product.model}</td>
                        <td className="p-3 whitespace-nowrap">
                          {product.phase}
                        </td>
                        <td className="p-3">
                          {renderFlowRates(product.flowRates)}
                        </td>
                        <td className="p-3">
                          {renderPowerOptions(product.powerOptions)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Ingen produktdata tilgjengelig.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModelSelectorClient;
