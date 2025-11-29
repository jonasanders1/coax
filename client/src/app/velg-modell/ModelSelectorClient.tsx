"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAppContext } from "@/context/AppContext";
import PageTitile from "@/components/PageTitile";

type Recommendation = {
  id: string;
  model: string;
  phase: string;
  fuse: string;
  usage: string;
  minFlow: number;
  maxFlow: number;
  matchMax: number;
  minPowerOption: number;
};

const ModelSelectorClient = () => {
  const { products, productsLoading, productsError, fetchProducts } =
    useAppContext();
  const [seconds, setSeconds] = useState<number>(60);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [flowRate, setFlowRate] = useState<number | null>(null);

  useEffect(() => {
    // Fetch products if not already loaded
    if (!productsLoading && products.length === 0 && !productsError) {
      fetchProducts();
    }
  }, [products, productsLoading, productsError, fetchProducts]);

  // Helper functions
  const parseFlowValues = (value: string): number[] => {
    if (!value) return [];
    const matches = value.match(/[\d]+(?:[.,]\d+)?/g);
    if (!matches) return [];
    return matches.map((match) => parseFloat(match.replace(",", ".")));
  };

  const parsePowerOptions = (powerOptions?: number | number[]): number[] => {
    if (powerOptions === undefined || powerOptions === null) return [];
    if (typeof powerOptions === "number") return [powerOptions];
    if (Array.isArray(powerOptions) && powerOptions.length > 0) {
      return powerOptions;
    }
    return [];
  };

  // Filter products by category "Direkte vannvarmer"
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(
      (product) => product.category === "Direkte vannvarmer"
    );
  }, [products]);

  // Recommendations for model selector (based on flow calculation)
  const recommendations = useMemo<Recommendation[]>(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];

    const derived = filteredProducts
      .map((product) => {
        const flowEntries = product.specs?.flowRates ?? [];
        const flowValues = flowEntries
          .flatMap(parseFlowValues)
          .filter((num) => !Number.isNaN(num))
          .sort((a, b) => a - b);

        if (!flowValues.length) {
          return null;
        }

        const minFlow = flowValues[0];
        const maxFlow = flowValues[flowValues.length - 1];

        const powerOptions = parsePowerOptions(product.specs?.powerOptions);
        const minPowerOption =
          powerOptions.length > 0 ? Math.min(...powerOptions) : 0;

        const specs = product.specs as
          | {
              circuitBreaker?: string | string[];
              fuseCircuit?: string | string[];
            }
          | undefined;
        const fuseRaw = specs?.circuitBreaker ?? specs?.fuseCircuit;
        const fuseValue = Array.isArray(fuseRaw)
          ? fuseRaw.join(", ")
          : fuseRaw ?? "Ikke spesifisert";

        const usage =
          product.ideal?.slice(0, 2).join(", ") ?? "Ikke spesifisert";

        return {
          id: product.id,
          model: product.model,
          phase: String(product.specs?.phase ?? "Ikke spesifisert"),
          fuse: fuseValue,
          usage,
          minFlow,
          maxFlow,
          matchMax: maxFlow,
          minPowerOption,
        } as Recommendation;
      })
      .filter((item): item is Recommendation => item !== null)
      .sort((a, b) => {
        // Sort by minFlow first, then by minPowerOption
        if (a.minFlow !== b.minFlow) {
          return a.minFlow - b.minFlow;
        }
        return a.minPowerOption - b.minPowerOption;
      });

    return derived.map((item, index) => {
      const next = derived[index + 1];
      return {
        ...item,
        matchMax: next ? next.minFlow : Number.POSITIVE_INFINITY,
      };
    });
  }, [filteredProducts]);

  // All products for the table (not filtered by flow)
  const tableProducts = useMemo(() => {
    if (!filteredProducts || filteredProducts.length === 0) return [];

    return filteredProducts
      .map((product) => {
        const flowEntries = product.specs?.flowRates ?? [];
        const flowValues = flowEntries
          .flatMap(parseFlowValues)
          .filter((num) => !Number.isNaN(num))
          .sort((a, b) => a - b);

        const powerOptions = parsePowerOptions(product.specs?.powerOptions);

        const specs = product.specs as
          | {
              circuitBreaker?: string | string[];
              fuseCircuit?: string | string[];
            }
          | undefined;
        const fuseRaw = specs?.circuitBreaker ?? specs?.fuseCircuit;
        const fuseValue = Array.isArray(fuseRaw)
          ? fuseRaw.join(", ")
          : fuseRaw ?? "Ikke spesifisert";

        const usage = product.ideal?.join(", ") ?? "Ikke spesifisert";

        return {
          id: product.id,
          model: product.model,
          flowRates: flowEntries.length > 0 ? flowEntries : ["—"],
          flowValues,
          powerOptions: powerOptions.length > 0 ? powerOptions : [],
          phase: String(product.specs?.phase ?? "Ikke spesifisert"),
          fuse: fuseValue,
          usage,
        };
      })
      .sort((a, b) => {
        // Sort by model name
        return a.model.localeCompare(b.model);
      });
  }, [filteredProducts]);

  const calculateRecommendation = () => {
    if (!recommendations.length) {
      setResult(null);
      setFlowRate(null);
      return;
    }

    const lpm = 600 / seconds;
    setFlowRate(Math.round(lpm * 10) / 10);

    // Find all products that meet the flow requirement
    const matchingProducts = recommendations.filter(
      (r) => lpm >= r.minFlow && lpm < r.matchMax
    );

    if (matchingProducts.length === 0) {
      // If no exact match, use the highest flow product
      setResult(recommendations[recommendations.length - 1]);
      return;
    }

    // Among matching products, select the one with the lowest power option
    const bestMatch = matchingProducts.reduce((best, current) => {
      if (current.minPowerOption < best.minPowerOption) {
        return current;
      }
      // If power is equal, prefer the one with lower minFlow
      if (
        current.minPowerOption === best.minPowerOption &&
        current.minFlow < best.minFlow
      ) {
        return current;
      }
      return best;
    });

    setResult(bestMatch);
  };

  const formatFlowRange = (min: number, max: number) => {
    const format = (value: number) =>
      Number.isFinite(value) ? value.toFixed(value >= 10 ? 0 : 1) : "∞";
    if (!Number.isFinite(max) || max === Number.POSITIVE_INFINITY) {
      return `${format(min)}+ L/min`;
    }
    return `${format(min)} - ${format(max)} L/min`;
  };

  const formatFlowRates = (flowRates: string[]): string => {
    if (flowRates.length === 0 || flowRates[0] === "—") return "—";
    return flowRates.join(", ");
  };

  const formatPowerOptions = (powerOptions: number[]): string => {
    if (powerOptions.length === 0) return "—";
    if (powerOptions.length === 1) return `${powerOptions[0]} kW`;
    return `${powerOptions.join(", ")} kW`;
  };

  const isCalculateDisabled =
    productsLoading || !recommendations.length || Boolean(productsError);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted dark:bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <PageTitile
          title="Finn riktig COAX-modell med Bøttemetoden"
          text="Enkel test: Mål hvor raskt du fyller en 10L bøtte i dusjen – vi anbefaler modell 
            basert på flow og el-tilgang."
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
                        Ta med deg en 10-liters bøtte i dusjen
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
                        Tid for å fylle 10L bøtte:{" "}
                        <strong className="text-primary">
                          {seconds} sekunder
                        </strong>
                      </Label>
                      <Slider
                        id="seconds"
                        value={[seconds]}
                        onValueChange={(value) => setSeconds(value[0])}
                        min={40}
                        max={200}
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
                        result.matchMax
                      );
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
                                {result.minPowerOption > 0
                                  ? `${result.minPowerOption} kW`
                                  : "—"}
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
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "40%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 whitespace-nowrap">Modell</th>
                    <th className="text-left p-3 whitespace-nowrap">
                      Liter per minutt
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">
                      Effekt (kW)
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">Fase</th>
                    <th className="text-left p-3">Brukseksempler</th>
                  </tr>
                </thead>
                <tbody>
                  {productsLoading ? (
                    <tr>
                      <td
                        colSpan={5}
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
                        <td className="p-3">
                          {formatFlowRates(product.flowRates)}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {formatPowerOptions(product.powerOptions)}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {product.phase}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {product.usage}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
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
