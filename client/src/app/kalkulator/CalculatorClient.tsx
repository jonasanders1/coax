"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import {
  TrendingDown,
  DollarSign,
  Users,
  Droplet,
  Clock,
  Thermometer,
  Flame,
  Home,
  Wrench,
  Timer,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { ParameterBadge } from "@/components/ParameterBadge";
import {
  CalculationParams,
  CalculationResults,
  DEFAULT_PARAMS,
  calculateResults,
  validateAndSanitizeParam,
} from "@/lib/calculator";
import PageTitile from "@/components/PageTitile";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  StructuredData,
  ServiceSchema,
} from "@/components/StructuredData";
import { siteUrl } from "@/config/site";

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value?.toLocaleString("no-NO", {
              maximumFractionDigits: 1,
            })}${entry.dataKey === "Årlig kostnad (kr)" ? " kr" : " kWh"}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper to deserialize params from URL
function searchParamsToParams(
  searchParams: URLSearchParams
): Partial<CalculationParams> {
  const params: Partial<CalculationParams> = {};
  searchParams.forEach((value, key) => {
    const paramKey = key as keyof CalculationParams;
    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      // Only assign if the key exists in DEFAULT_PARAMS (valid CalculationParams key)
      if (paramKey in DEFAULT_PARAMS && paramKey !== "insulatedPipes") {
        // Type assertion is safe here because we've verified the key exists and is not boolean
        (params as Record<string, number>)[key] = numValue;
      }
    } else if (value === "true" || value === "false") {
      // Only assign if the key is the boolean field
      if (paramKey === "insulatedPipes") {
        params[paramKey] = value === "true";
      }
    }
  });
  return params;
}

const CalculatorClient = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllDefaults, setShowAllDefaults] = useState(false);

  const [params, setParams] = useState<CalculationParams>(() => {
    if (!searchParams) return DEFAULT_PARAMS;
    const urlParams = searchParamsToParams(searchParams);
    return { ...DEFAULT_PARAMS, ...urlParams };
  });

  // Update params when URL changes (e.g., returning from settings page)
  useEffect(() => {
    if (!searchParams) return;
    const urlParams = searchParamsToParams(searchParams);
    setParams((prev) => ({ ...DEFAULT_PARAMS, ...prev, ...urlParams }));
  }, [searchParams]);

  const results = useMemo<CalculationResults>(() => {
    return calculateResults(params);
  }, [params]);

  const updateParam = (
    key: keyof CalculationParams,
    value: number | string | boolean
  ) => {
    if (key === "insulatedPipes") {
      setParams((prev) => ({ ...prev, [key]: !!value }));
      return;
    }
    const updated = validateAndSanitizeParam(key, value, params);
    if (updated) {
      setParams((prev) => ({ ...prev, ...updated }));
    }
  };

  const chartData = useMemo(() => {
    return [
      {
        name: "COAX",
        "Årlig kWh": results.tanklesskWhPerYear,
        "Årlig kostnad (kr)": results.tanklessCostPerYearNOK,
      },
      {
        name: "Tank",
        "Årlig kWh": results.tankkWhPerYear,
        "Årlig kostnad (kr)": results.tankCostPerYearNOK,
      },
    ];
  }, [results]);

  const COLORS = ["hsl(var(--primary))", "#ef4444"];

  const serviceSchema = useMemo(
    () =>
      ServiceSchema({
        name: "COAX Forbrukskalkulator",
        description:
          "Beregn hvor mye energi, vann og penger du kan spare ved å bytte fra tradisjonell varmtvannstank til en direkte vannvarmer fra COAX",
        url: `${siteUrl}/kalkulator`,
      }),
    []
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background animate-fade-in-up">
      <StructuredData data={serviceSchema} />
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        <PageTitile
          title="COAX Forbrukskalkulator"
          text="Se hvor mye energi, vann og penger du kan spare ved å bytte fra tradisjonell varmtvannstank til en direkte vannvarmer fra COAX"
        />

        {/* Default Parameters Display */}
        <Card className="mb-8 shadow-card-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Standard forutsetninger
                </CardTitle>
                <CardDescription className="text-sm md:text-base text-muted-foreground">
                  Kalkulatoren bruker realistiske standardverdier for
                  energibruk, vannforbruk og temperatur. Disse kan justeres for
                  mer nøyaktige beregninger.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-base font-semibold mb-3 text-muted-foreground">
              Felles parametere
            </h3>
            <div className="space-y-6">
              {/* Common Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ParameterBadge
                  icon={Timer}
                  iconColor="text-green-500"
                  label="Dusjlengde"
                  value={`${params.minPerDusj} min`}
                />
                <ParameterBadge
                  icon={Timer}
                  iconColor="text-green-500"
                  label="Håndvask varighet"
                  value={`${params.washbasinDurationSec}s`}
                />
                <ParameterBadge
                  icon={Timer}
                  iconColor="text-green-500"
                  label="Kjøkkenvask varighet"
                  value={`${params.kitchenDurationSec}s`}
                />
                <ParameterBadge
                  icon={Thermometer}
                  label="Innløp"
                  iconColor="text-blue-500"
                  value={`${params.inletTempC}°C`}
                />
                <ParameterBadge
                  icon={Flame}
                  label="Måltemp"
                  iconColor="text-orange-500"
                  value={`${params.targetTempC}°C`}
                />
                <ParameterBadge
                  icon={DollarSign}
                  label="Strømpris"
                  iconColor="text-yellow-500"
                  value={`${params.strømprisNOKPerkWh} kr/kWh`}
                />
                {showAllDefaults && (
                  <>
                    <ParameterBadge
                      icon={Droplet}
                      label="Dusjer per pers./dag"
                      iconColor="text-blue-500"
                      value={params.dusjerPerPersonPerDag}
                    />
                    <ParameterBadge
                      icon={Droplet}
                      label="Håndvask per pers./dag"
                      iconColor="text-blue-500"
                      value={params.washbasinUsesPerPersonPerDay}
                    />

                    <ParameterBadge
                      icon={Users}
                      label="Antall personer"
                      iconColor="text-green-500"
                      value={params.antallPersoner}
                    />
                    <ParameterBadge
                      icon={Wrench}
                      label="Isolasjon"
                      iconColor="text-red-500"
                      value={params.insulatedPipes ? "Ja" : "Nei"}
                    />
                    <ParameterBadge
                      icon={Droplet}
                      iconColor="text-blue-500"
                      label="Kjøkken vask per pers./dag"
                      value={params.kitchenUsesPerPersonPerDay}
                    />
                  </>
                )}
              </div>

              {/* Comparison Sections */}
              {showAllDefaults && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-base font-semibold mb-2 text-muted-foreground">
                    Ulike parametere
                  </h3>
                  {/* Table-style header for services - hidden on mobile */}
                  <div className="hidden md:grid grid-cols-2 gap-3">
                    <div className="text-base font-semibold text-muted-foreground border-b border-primary pb-2 text-left">
                      COAX
                    </div>
                    <div className="text-base font-semibold text-muted-foreground border-b border-destructive pb-2 text-right">
                      Tank
                    </div>
                  </div>

                  {/* Standby Tap Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Flame}
                        iconColor="text-blue-500"
                        label="Standby tap (kWh/år)"
                        value="0 kWh/år"
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Flame}
                        iconColor="text-red-500"
                        label="Standby tap (kWh/år)"
                        value={`${params.standbyTapTankkWhPerYear} kWh/år`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>

                  {/* Flow Rate Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Droplet}
                        iconColor="text-blue-500"
                        label="Strømningsrate (L/min)"
                        value={`${params.flowRateLPerMinTankless} L/min`}
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Droplet}
                        iconColor="text-red-500"
                        label="Strømningsrate (L/min)"
                        value={`${params.flowRateLPerMinTank} L/min`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>

                  {/* Efficiency Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Zap}
                        iconColor="text-blue-500"
                        label="Effektivitet"
                        value={`${(params.tanklessEfficiency * 100).toFixed(
                          0
                        )} %`}
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Zap}
                        iconColor="text-red-500"
                        label="Effektivitet"
                        value={`${(params.tankEfficiency * 100).toFixed(0)} %`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>

                  {/* Pipe Length Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Home}
                        iconColor="text-blue-500"
                        label="Rørlengde til kran (m)"
                        value={`${params.pipeLengthTanklessM} m`}
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Home}
                        iconColor="text-red-500"
                        label="Rørlengde til kran (m)"
                        value={`${params.pipeLengthTankM} m`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>

                  {/* Wait Time Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Clock}
                        iconColor="text-blue-500"
                        label="Ventetid varmtvann (sek)"
                        value="3 sek"
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Clock}
                        iconColor="text-red-500"
                        label="Ventetid varmtvann (sek)"
                        value={`${params.tankWaitTimeSec} sek`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>

                  {/* Room Temperature Comparison */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ParameterBadge
                        icon={Thermometer}
                        iconColor="text-blue-500"
                        label="Romtemperatur (°C)"
                        value="21°C"
                        variant="comparison"
                        side="left"
                        typeLabel="COAX"
                      />
                      <ParameterBadge
                        icon={Thermometer}
                        iconColor="text-red-500"
                        label="Romtemperatur (°C)"
                        value={`${params.ambientTempC}°C`}
                        variant="comparison"
                        side="right"
                        typeLabel="Tank"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 border-t pt-4 flex gap-2 justify-center">
              <Button
                variant="default"
                size="sm"
                className="group"
                onClick={() => setShowAllDefaults(!showAllDefaults)}
              >
                {showAllDefaults ? (
                  <>
                    Skjul forutsetninger
                    <ChevronRight className="w-4 h-4 group-hover:rotate-[-90deg] transition-transform" />
                  </>
                ) : (
                  <>
                    Vis alle forutsetninger
                    <ChevronRight className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Parameter Customization Card */}
        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  Vil du justere parametrene?
                </h3>
                <p className="text-muted-foreground">
                  Du kan tilpasse alle beregningsparametere for å få en mer
                  nøyaktig beregning basert på dine spesifikke behov og forhold.
                  Det er enkelt å renge ut forbruket til en COAX vannvarmer. Det
                  er derimot ikke så enkelt å renge ut forbruket til en
                  tankbereder da den avhenger av en rekke faktorer.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={() => router.push("/kalkulator/innstillinger")}
                  size="lg"
                  className="group w-full md:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Innstillinger
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="mt-12 space-y-6">
          {/* Savings Hero Card */}
          <Card
            className="shadow-lg overflow-hidden relative"
            style={{ background: "var(--gradient-success)" }}
          >
            {/* Decorative elements */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-2">
                  <TrendingDown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90 mb-2">
                    Din årlige besparelse med COAX
                  </p>
                  <p className="text-5xl md:text-6xl font-bold text-white mb-1">
                    {results.annualSavingsNOK.toLocaleString("no-NO", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    kr
                  </p>
                  <p className="text-lg text-white/90">
                    {results.annualSavingskWh.toFixed(0)} kWh redusert energibruk
                    per år
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* COAX Card */}
            <Card
              className="shadow-lg overflow-hidden relative"
              style={{ background: "var(--gradient-primary)" }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  COAX vannvarmer
                </CardTitle>
                <CardDescription className="text-white/90">
                  Energieffektiv og desentralisert løsning
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Årlig kostnad</p>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {results.tanklessCostPerYearNOK.toLocaleString("no-NO", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    kr
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Årlig energibruk</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.tanklesskWhPerYear.toFixed(0)} kWh
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Daglig forbruk</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.dailyVolumeTankless.toFixed(0)} liter
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Ventevann tap</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.dailyWaitWaterWasteTankless
                      ? (results.dailyWaitWaterWasteTankless * 365).toFixed(0)
                      : "0"}{" "}
                    liter/år
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tank Card */}
            <Card
              className="shadow-lg overflow-hidden relative"
              style={{ background: "var(--gradient-destructive)" }}
            >
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
              <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  Tradisjonell tankbereder
                </CardTitle>
                <CardDescription className="text-white/90">
                  Konvensjonell sentralisert løsning
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Årlig kostnad</p>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {results.tankCostPerYearNOK.toLocaleString("no-NO", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    kr
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Årlig energibruk</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.tankkWhPerYear.toFixed(0)} kWh
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Daglig forbruk</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.dailyVolumeTank.toFixed(0)} liter
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-white" />
                    <p className="text-sm text-white/90">Ventevann tap</p>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {results.dailyWaitWaterWasteTank
                      ? (results.dailyWaitWaterWasteTank * 365).toFixed(0)
                      : "0"}{" "}
                    liter/år
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <section className="space-y-4 pt-4">
            <div>
              <h2 className="text-2xl font-bold">Visuell sammenligning</h2>
              <p className="text-muted-foreground">
                Årlig energibruk og kostnad side om side
              </p>
            </div>

            <div className="w-full h-[350px] md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ bottom: 20, top: 20, left: 20, right: 20 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 14, fontWeight: 500 }}
                    axisLine={{ strokeWidth: 1 }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    label={{
                      value: "kWh",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12 },
                    }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${value.toLocaleString("no-NO")}`
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "kr",
                      angle: 90,
                      position: "insideRight",
                      style: { textAnchor: "middle", fontSize: 12 },
                    }}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${value.toLocaleString("no-NO")}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="Årlig kWh" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-kwh-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                  <Bar
                    yAxisId="right"
                    dataKey="Årlig kostnad (kr)"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-cost-${index}`}
                        fill={COLORS[index]}
                        opacity={0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex items-center justify-center gap-8 pb-2 m-0">
              {chartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-sm shadow-sm"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Info Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Hvordan fungerer kalkulatoren?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p className="md:text-base">
                Det er vanskelig å gi presise beregninger for
                vannvarmingsforbruk. COAX vannvarmere er enkle å beregne
                siden de kun varmer vann når det brukes, mens
                tankbereder-forbruk avhenger av mange variabler som
                tankstørrelse, isolasjonskvalitet, plassering, romtemperatur,
                tappefrekvens og hvor lenge vannet står ubrukt.
              </p>

              <p className="md:text-base">
                Kalkulatoren bruker fysikkbaserte formler og realistiske
                forutsetninger for å gi et representativt estimat. Standby-tap
                alene kan variere fra 400-1500 kWh/år for tankbereder, avhengig
                av alder og installasjonsforhold.
              </p>

              <p className="md:text-base">
                <strong>Alle parametere er justerbare</strong> – tilpass
                beregningen til ditt spesifikke forbruk og installasjon for mest
                mulig nøyaktig resultat.
              </p>

              <div className="pt-3 border-t">
                <Link
                  href="/kalkulator/detaljer"
                  className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                >
                  Les komplett gjennomgang av beregningsmetodikk
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorClient;
