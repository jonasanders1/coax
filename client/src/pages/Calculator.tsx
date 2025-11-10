import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { Calculator, Zap, TrendingUp, Clock, DollarSign } from "lucide-react";
import PageTitile from "@/components/PageTitile";
import { useTheme } from "@/hooks/useTheme";
import { sanitizeNumberInput } from "@/utils/inputValidation";
import Seo from "@/components/Seo";

interface CalculationParams {
  antallPersoner: number;
  dusjerPerPersonPerDag: number;
  minPerDusj: number;
  tanklessPowerKW: number;
  tanklesskWhPer4min: number;
  tankkWhPer4min: number;
  standbyTapTankkWhPerYear: number;
  strømprisNOKPerkWh: number;
  installasjonskostnadTanklessNOK: number;
  installasjonskostnadTankNOK: number;
}

interface CalculationResults {
  dusjerPerDagTotal: number;
  minPerDagTotal: number;
  tanklesskWhPerDusj: number;
  tankkWhPerDusj: number;
  tanklesskWhPerDay: number;
  tankkWhPerDay: number;
  tanklesskWhPerYear: number;
  tankkWhPerYear: number;
  tanklessCostPerYearNOK: number;
  tankCostPerYearNOK: number;
  annualSavingskWh: number;
  annualSavingsNOK: number;
  installasjonsDiff: number;
  paybackYears: number;
}

// Custom Tooltip component that adapts to theme
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-card-foreground">
        <p className="font-semibold mb-2 text-card-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{
              color: entry.color,
            }}
          >
            {`${entry.name}: ${entry.value?.toLocaleString("no-NO", {
              maximumFractionDigits: 1,
            })}${entry.dataKey === "Årlig kostnad (NOK)" ? " NOK" : " kWh"}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CalculatorPage = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Default parameters matching the Python calculator
  const [params, setParams] = useState<CalculationParams>({
    antallPersoner: 3,
    dusjerPerPersonPerDag: 1,
    minPerDusj: 4,
    tanklessPowerKW: 18.0,
    tanklesskWhPer4min: 1.2,
    tankkWhPer4min: 3.0,
    standbyTapTankkWhPerYear: 900.0,
    strømprisNOKPerkWh: 0.5,
    installasjonskostnadTanklessNOK: 6000.0,
    installasjonskostnadTankNOK: 5000.0,
  });

  // Calculate results based on current parameters
  const results = useMemo<CalculationResults>(() => {
    const dusjerPerDagTotal =
      params.antallPersoner * params.dusjerPerPersonPerDag;
    const minPerDagTotal = dusjerPerDagTotal * params.minPerDusj;

    // Energy consumption per shower
    const tanklesskWhPerDusj =
      params.tanklesskWhPer4min * (params.minPerDusj / 4.0);
    const tankkWhPerDusj = params.tankkWhPer4min * (params.minPerDusj / 4.0);

    // Daily & annual energy
    const tanklesskWhPerDay = tanklesskWhPerDusj * dusjerPerDagTotal;
    const tankkWhPerDay = tankkWhPerDusj * dusjerPerDagTotal;

    const tanklesskWhPerYear = tanklesskWhPerDay * 365;
    const tankkWhPerYear =
      tankkWhPerDay * 365 + params.standbyTapTankkWhPerYear;

    // Cost
    const tanklessCostPerYearNOK =
      tanklesskWhPerYear * params.strømprisNOKPerkWh;
    const tankCostPerYearNOK = tankkWhPerYear * params.strømprisNOKPerkWh;

    const annualSavingskWh = tankkWhPerYear - tanklesskWhPerYear;
    const annualSavingsNOK = tankCostPerYearNOK - tanklessCostPerYearNOK;

    // Payback
    const installasjonsDiff =
      params.installasjonskostnadTanklessNOK -
      params.installasjonskostnadTankNOK;
    const paybackYears =
      annualSavingsNOK > 0 ? installasjonsDiff / annualSavingsNOK : NaN;

    return {
      dusjerPerDagTotal,
      minPerDagTotal,
      tanklesskWhPerDusj,
      tankkWhPerDusj,
      tanklesskWhPerDay,
      tankkWhPerDay,
      tanklesskWhPerYear,
      tankkWhPerYear,
      tanklessCostPerYearNOK,
      tankCostPerYearNOK,
      annualSavingskWh,
      annualSavingsNOK,
      installasjonsDiff,
      paybackYears,
    };
  }, [params]);

  // Update parameter value with validation
  const updateParam = (
    key: keyof CalculationParams,
    value: number | string
  ) => {
    let sanitizedValue: number;

    // Define bounds for each parameter to prevent invalid inputs
    const bounds: Record<
      keyof CalculationParams,
      { min: number; max: number; default: number }
    > = {
      antallPersoner: { min: 1, max: 10, default: 2 },
      dusjerPerPersonPerDag: { min: 0.5, max: 10, default: 1 },
      minPerDusj: { min: 1, max: 60, default: 4 },
      tanklessPowerKW: { min: 1, max: 100, default: 18.0 },
      tanklesskWhPer4min: { min: 0.1, max: 10, default: 1.2 },
      tankkWhPer4min: { min: 0.1, max: 10, default: 3.0 },
      standbyTapTankkWhPerYear: { min: 0, max: 10000, default: 900.0 },
      strømprisNOKPerkWh: { min: 0.01, max: 100, default: 0.5 },
      installasjonskostnadTanklessNOK: {
        min: 0,
        max: 1000000,
        default: 12000.0,
      },
      installasjonskostnadTankNOK: { min: 0, max: 1000000, default: 5000.0 },
    };

    const bound = bounds[key];
    sanitizedValue = sanitizeNumberInput(
      value,
      bound.min,
      bound.max,
      bound.default
    );

    setParams((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  // Chart data
  const chartData = useMemo(() => {
    return [
      {
        name: "COAX",
        "Årlig kWh": results.tanklesskWhPerYear,
        "Årlig kostnad (NOK)": results.tanklessCostPerYearNOK,
      },
      {
        name: "Tankbereder",
        "Årlig kWh": results.tankkWhPerYear,
        "Årlig kostnad (NOK)": results.tankCostPerYearNOK,
      },
    ];
  }, [results]);

  const COLORS = ["#3b82f6", "#ef4444"];

  const metaDescription =
    "Beregn hvor mye du kan spare med COAX sin tankløse vannvarmer sammenlignet med en tradisjonell varmtvannsbereder. Juster familie- og forbruksdata.";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Seo
          title="COAX | Sparekalkulator for tankløse vannvarmere"
          description={metaDescription}
          canonicalPath="/kalkulator"
        />
        {/* Header */}
        <PageTitile
          title="Sparekalkulator"
          text="Beregn energibruk og kostnader for å sammenligne en direkte vannvarmer (CoaX) med en tradisjonell tankbereder."
        />

        {/* Main Calculator Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-8 mb-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Innstillinger</CardTitle>
                <CardDescription>
                  Juster parametrene etter dine behov
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="antallPersoner">
                    Antall personer: {params.antallPersoner}
                  </Label>
                  <Slider
                    id="antallPersoner"
                    min={1}
                    max={6}
                    step={1}
                    value={[params.antallPersoner]}
                    onValueChange={(value) =>
                      updateParam("antallPersoner", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dusjerPerPersonPerDag">
                    Dusjer per person per dag: {params.dusjerPerPersonPerDag}
                  </Label>
                  <Slider
                    id="dusjerPerPersonPerDag"
                    min={0.5}
                    max={3}
                    step={0.5}
                    value={[params.dusjerPerPersonPerDag]}
                    onValueChange={(value) =>
                      updateParam("dusjerPerPersonPerDag", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minPerDusj">
                    Minutter per dusj: {params.minPerDusj}
                  </Label>
                  <Slider
                    id="minPerDusj"
                    min={2}
                    max={15}
                    step={1}
                    value={[params.minPerDusj]}
                    onValueChange={(value) =>
                      updateParam("minPerDusj", value[0])
                    }
                  />
                </div>

                <Accordion type="single" collapsible>
                  <AccordionItem value="advanced-settings">
                    <AccordionTrigger className="text-base font-semibold">
                      Avanserte innstillinger
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 px-2">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="strømprisNOKPerkWh">
                            Strømpris (NOK/kWh)
                          </Label>
                          <Input
                            id="strømprisNOKPerkWh"
                            type="number"
                            step="0.1"
                            value={params.strømprisNOKPerkWh}
                            onChange={(e) =>
                              updateParam(
                                "strømprisNOKPerkWh",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="standbyTapTankkWhPerYear">
                            Standby tap tank (kWh/år)
                          </Label>
                          <Input
                            id="standbyTapTankkWhPerYear"
                            type="number"
                            step="50"
                            value={params.standbyTapTankkWhPerYear}
                            onChange={(e) =>
                              updateParam(
                                "standbyTapTankkWhPerYear",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="installasjonskostnadTanklessNOK">
                            Installasjon Tankløs (NOK)
                          </Label>
                          <Input
                            id="installasjonskostnadTanklessNOK"
                            type="number"
                            step="1000"
                            value={params.installasjonskostnadTanklessNOK}
                            onChange={(e) =>
                              updateParam(
                                "installasjonskostnadTanklessNOK",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="installasjonskostnadTankNOK">
                            Installasjon Tank (NOK)
                          </Label>
                          <Input
                            id="installasjonskostnadTankNOK"
                            type="number"
                            step="1000"
                            value={params.installasjonskostnadTankNOK}
                            onChange={(e) =>
                              updateParam(
                                "installasjonskostnadTankNOK",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="tanklesskWhPer4min">
                            Direkte kWh per 4 min
                          </Label>
                          <Input
                            id="tanklesskWhPer4min"
                            type="number"
                            step="0.1"
                            value={params.tanklesskWhPer4min}
                            onChange={(e) =>
                              updateParam(
                                "tanklesskWhPer4min",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tankkWhPer4min">
                            Tank kWh per 4 min
                          </Label>
                          <Input
                            id="tankkWhPer4min"
                            type="number"
                            step="0.1"
                            value={params.tankkWhPer4min}
                            onChange={(e) =>
                              updateParam(
                                "tankkWhPer4min",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Totale dusjer per dag:
                      </span>
                      <span className="ml-2 font-medium">
                        {results.dusjerPerDagTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Minutter med vann per dag:
                      </span>
                      <span className="ml-2 font-medium">
                        {results.minPerDagTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Resultater</CardTitle>
                <CardDescription>
                  Årlige tall basert på dine innstillinger
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-sm">
                        Direkte (COAX)
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {results.tanklesskWhPerYear.toFixed(1)} kWh
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {results.tanklessCostPerYearNOK.toFixed(0)} NOK/år
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/40">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-sm">Tankbereder</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">
                      {results.tankkWhPerYear.toFixed(1)} kWh
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {results.tankCostPerYearNOK.toFixed(0)} NOK/år
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-sm">
                        Tilbakebetalingstid
                      </h3>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {isNaN(results.paybackYears)
                        ? "N/A"
                        : results.paybackYears.toFixed(1)}{" "}
                      år
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Merpris installasjon:{" "}
                      {results.installasjonsDiff.toFixed(0)} NOK
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-lg">Årlig besparelse</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Energi</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
                        {results.annualSavingskWh.toFixed(1)} kWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Kostnad</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-300">
                        {results.annualSavingsNOK.toFixed(0)} NOK
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart and Information Section - Side by side on large screens */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Section */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Sammenligning: Årlig energibruk og kostnad
                </CardTitle>
                <CardDescription>
                  Direkte vannvarmer (CoaX) kontra tradisjonell tankbereder
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] sm:h-[400px] lg:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ bottom: 60, top: 20, left: 10, right: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={
                          isDark ? "hsl(var(--border))" : "hsl(var(--border))"
                        }
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                        tick={{
                          fill: isDark
                            ? "hsl(var(--muted-foreground))"
                            : "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        axisLine={{
                          stroke: isDark
                            ? "hsl(var(--border))"
                            : "hsl(var(--border))",
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#3b82f6"
                        tick={{
                          fill: isDark
                            ? "hsl(var(--muted-foreground))"
                            : "hsl(var(--muted-foreground))",
                        }}
                        axisLine={{
                          stroke: isDark
                            ? "hsl(var(--border))"
                            : "hsl(var(--border))",
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#ef4444"
                        tick={{
                          fill: isDark
                            ? "hsl(var(--muted-foreground))"
                            : "hsl(var(--muted-foreground))",
                        }}
                        axisLine={{
                          stroke: isDark
                            ? "hsl(var(--border))"
                            : "hsl(var(--border))",
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{
                          color: isDark
                            ? "hsl(var(--card-foreground))"
                            : "hsl(var(--card-foreground))",
                          fontSize: "14px",
                          paddingTop: "20px",
                        }}
                        iconType="square"
                      />
                      <Bar yAxisId="left" dataKey="Årlig kWh" fill="#3b82f6">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[0]} />
                        ))}
                      </Bar>
                      <Bar
                        yAxisId="right"
                        dataKey="Årlig kostnad (NOK)"
                        fill="#ef4444"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[1]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hvordan fungerer kalkulatoren?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-disc pl-6 text-muted-foreground">
                  <li>
                    <div className="flex items-start gap-2">
                      <span>
                        Kalkulatoren beregner energibruk basert på antall
                        personer, dusjer og dusjens lengde. 4 minutter per dusj
                        er gjennomsnittet i Norge.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start gap-2">
                      <span>
                        COAX bruker kun energi under bruk, og er dermed mer
                        energieffektiv enn en tradisjonell tankbereder.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start gap-2">
                      <span>
                        Tankbereder inkluderer standby-tap (ca. 900 kWh/år), da
                        vannet i tanken holdes varmt døgnet rundt.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start gap-2">
                      <span>
                        Strømprisen (0.5 NOK/kWh) tar utgangspunkt i Norgespris.
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start gap-2">
                      <span>
                        Tilbakebetalingstid viser hvor lang tid det tar å dekke
                        merprisen for tankløs løsning
                      </span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
