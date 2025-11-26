"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
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
};

const ModelSelectorClient = () => {
  const { products, productsLoading, productsError, fetchProducts } =
    useAppContext();
  const [seconds, setSeconds] = useState<number>(60);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [flowRate, setFlowRate] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!products || products.length === 0) return [];

    const parseFlowValues = (value: string): number[] => {
      if (!value) return [];
      const matches = value.match(/[\d]+(?:[.,]\d+)?/g);
      if (!matches) return [];
      return matches.map((match) => parseFloat(match.replace(",", ".")));
    };

    const derived = products
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

        const specs =
          product.specs as
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
        } as Recommendation;
      })
      .filter((item): item is Recommendation => item !== null)
      .sort((a, b) => a.minFlow - b.minFlow);

    return derived.map((item, index) => {
      const next = derived[index + 1];
      return {
        ...item,
        matchMax: next ? next.minFlow : Number.POSITIVE_INFINITY,
      };
    });
  }, [products]);

  const calculateRecommendation = () => {
    if (!recommendations.length) {
      setResult(null);
      setFlowRate(null);
      return;
    }

    const lpm = 600 / seconds;
    setFlowRate(Math.round(lpm * 10) / 10);

    const rec = recommendations.find(
      (r) => lpm >= r.minFlow && lpm < r.matchMax
    );
    setResult(rec || recommendations[recommendations.length - 1]);
  };

  const formatFlowRange = (min: number, max: number) => {
    const format = (value: number) =>
      Number.isFinite(value) ? value.toFixed(value >= 10 ? 0 : 1) : "∞";
    if (!Number.isFinite(max) || max === Number.POSITIVE_INFINITY) {
      return `${format(min)}+ L/min`;
    }
    return `${format(min)} - ${format(max)} L/min`;
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
                        min={10}
                        max={120}
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
                <Alert className="rounded-xl border border-success p-6 shadow-sm">
                  <AlertTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Beregnet vannmengde: {flowRate} L/min
                  </AlertTitle>
                  <AlertDescription>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 "></div>
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
                          <div className="">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Anbefalt modell
                                </p>
                                <h4 className="text-2xl font-semibold text-foreground">
                                  {result.model}
                                </h4>
                              </div>
                              <Badge
                                variant="secondary"
                                className="border border-primary/30 bg-primary text-primary-foreground"
                              >
                                {flowRangeLabel}
                              </Badge>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                              <div className="rounded-lg bg-background/70 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Strålestørrelse
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                  {flowRangeLabel}
                                </p>
                              </div>
                              <div className="rounded-lg bg-background/70 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Fase
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                  {result.phase}
                                </p>
                              </div>
                              <div className="rounded-lg bg-background/70 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Sikring
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                  {result.fuse}
                                </p>
                              </div>
                            </div>

                            {usageItems.length ? (
                              <div className="mt-6">
                                <p className="text-sm font-medium text-foreground">
                                  Ideell for:
                                </p>
                                <ul className="mt-2 flex flex-col gap-2">
                                  {usageItems.map((item) => (
                                    <li
                                      key={item}
                                      className="inline-flex items-center gap-2 rounded-md  text-sm text-foreground"
                                    >
                                      <span className="mt-0.5 h-2 w-2 rounded-full bg-foreground" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anbefalingstabell</CardTitle>
            <p className="text-muted-foreground">
              Anbefalt modell per vannmengde
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="text-sm w-full" style={{ minWidth: "800px", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "44%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 whitespace-nowrap">
                      Strålestørrelse (L/min)
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">
                      Anbefalt modell
                    </th>
                    <th className="text-left p-3 whitespace-nowrap">Fase</th>
                    <th className="text-left p-3 whitespace-nowrap">Sikring</th>
                    <th className="text-left p-3">Brukseksempler</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec) => (
                    <tr
                      key={rec.id}
                      className="border-b bg-background hover:bg-muted"
                    >
                      <td className="p-3 whitespace-nowrap">
                        {formatFlowRange(rec.minFlow, rec.matchMax)}
                      </td>
                      <td className="p-3 font-semibold">{rec.model}</td>
                      <td className="p-3 whitespace-nowrap">{rec.phase}</td>
                      <td className="p-3 ">{rec.fuse}</td>
                      <td className="p-3 text-muted-foreground">{rec.usage}</td>
                    </tr>
                  ))}
                  {!recommendations.length && !productsLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Ingen produktdata tilgjengelig.
                      </td>
                    </tr>
                  ) : null}
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
