import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Calculator, Zap, TrendingUp, Clock, DollarSign } from "lucide-react";

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

const CalculatorPage = () => {
  // Default parameters matching the Python calculator
  const [params, setParams] = useState<CalculationParams>({
    antallPersoner: 2,
    dusjerPerPersonPerDag: 1,
    minPerDusj: 4,
    tanklessPowerKW: 18.0,
    tanklesskWhPer4min: 1.2,
    tankkWhPer4min: 3.0,
    standbyTapTankkWhPerYear: 900.0,
    strømprisNOKPerkWh: 1.5,
    installasjonskostnadTanklessNOK: 12000.0,
    installasjonskostnadTankNOK: 5000.0,
  });

  // Calculate results based on current parameters
  const results = useMemo<CalculationResults>(() => {
    const dusjerPerDagTotal = params.antallPersoner * params.dusjerPerPersonPerDag;
    const minPerDagTotal = dusjerPerDagTotal * params.minPerDusj;

    // Energy consumption per shower
    const tanklesskWhPerDusj = params.tanklesskWhPer4min * (params.minPerDusj / 4.0);
    const tankkWhPerDusj = params.tankkWhPer4min * (params.minPerDusj / 4.0);

    // Daily & annual energy
    const tanklesskWhPerDay = tanklesskWhPerDusj * dusjerPerDagTotal;
    const tankkWhPerDay = tankkWhPerDusj * dusjerPerDagTotal;

    const tanklesskWhPerYear = tanklesskWhPerDay * 365;
    const tankkWhPerYear = tankkWhPerDay * 365 + params.standbyTapTankkWhPerYear;

    // Cost
    const tanklessCostPerYearNOK = tanklesskWhPerYear * params.strømprisNOKPerkWh;
    const tankCostPerYearNOK = tankkWhPerYear * params.strømprisNOKPerkWh;

    const annualSavingskWh = tankkWhPerYear - tanklesskWhPerYear;
    const annualSavingsNOK = tankCostPerYearNOK - tanklessCostPerYearNOK;

    // Payback
    const installasjonsDiff =
      params.installasjonskostnadTanklessNOK - params.installasjonskostnadTankNOK;
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

  // Update parameter value
  const updateParam = (key: keyof CalculationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Chart data
  const chartData = useMemo(() => {
    return [
      {
        name: "Direkte (CoaX)",
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

  const COLORS = ['#3b82f6', '#ef4444'];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Kalkulator: Direkte vannvarmer vs Tankbereder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Beregn energibruk og kostnader for å sammenligne en direkte vannvarmer (CoaX) med en tradisjonell tankbereder.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Innstillinger</CardTitle>
            <CardDescription>Juster parametrene etter dine behov</CardDescription>
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
                onValueChange={(value) => updateParam("antallPersoner", value[0])}
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
                onValueChange={(value) => updateParam("minPerDusj", value[0])}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strømprisNOKPerkWh">Strømpris (NOK/kWh)</Label>
                <Input
                  id="strømprisNOKPerkWh"
                  type="number"
                  step="0.1"
                  value={params.strømprisNOKPerkWh}
                  onChange={(e) =>
                    updateParam("strømprisNOKPerkWh", parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="standbyTapTankkWhPerYear">Standby tap tank (kWh/år)</Label>
                <Input
                  id="standbyTapTankkWhPerYear"
                  type="number"
                  step="50"
                  value={params.standbyTapTankkWhPerYear}
                  onChange={(e) =>
                    updateParam("standbyTapTankkWhPerYear", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
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
                    updateParam("tanklesskWhPer4min", parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tankkWhPer4min">Tank kWh per 4 min</Label>
                <Input
                  id="tankkWhPer4min"
                  type="number"
                  step="0.1"
                  value={params.tankkWhPer4min}
                  onChange={(e) =>
                    updateParam("tankkWhPer4min", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resultater</CardTitle>
            <CardDescription>Årlige tall basert på dine innstillinger</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-sm">Direkte (CoaX)</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {results.tanklesskWhPerYear.toFixed(1)} kWh
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.tanklessCostPerYearNOK.toFixed(0)} NOK/år
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-sm">Tankbereder</span>
                </div>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {results.tankkWhPerYear.toFixed(1)} kWh
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.tankCostPerYearNOK.toFixed(0)} NOK/år
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
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {results.annualSavingskWh.toFixed(1)} kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kostnad</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {results.annualSavingsNOK.toFixed(0)} NOK
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Tilbakebetalingstid</h3>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {isNaN(results.paybackYears)
                  ? "N/A"
                  : results.paybackYears.toFixed(1)}{" "}
                år
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Merpris installasjon: {results.installasjonsDiff.toFixed(0)} NOK
              </p>
            </div>

            <div className="pt-4 border-t space-y-2">
              <h3 className="font-semibold mb-3">Detaljer</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Totale dusjer per dag:</span>
                  <span className="ml-2 font-medium">{results.dusjerPerDagTotal}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Direkte (kWh/dusj):</span>
                  <span className="ml-2 font-medium">
                    {results.tanklesskWhPerDusj.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tank (kWh/dusj):</span>
                  <span className="ml-2 font-medium">
                    {results.tankkWhPerDusj.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sammenligning: Årlig energibruk og kostnad</CardTitle>
          <CardDescription>
            Direkte vannvarmer (CoaX) kontra tradisjonell tankbereder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="Årlig kWh" fill="#3b82f6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[0]} />
                ))}
              </Bar>
              <Bar yAxisId="right" dataKey="Årlig kostnad (NOK)" fill="#ef4444">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Information Section */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Hvordan fungerer kalkulatoren?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Kalkulatoren beregner energibruk basert på antall personer, dusjer og dusjens lengde
          </li>
          <li>
            • Direkte vannvarmer (CoaX) beregner kun energi ved bruk
          </li>
          <li>
            • Tankbereder inkluderer standby-tap som oppstår når vannet i tanken holdes varmt 24/7
          </li>
          <li>
            • Tilbakebetalingstid viser hvor lang tid det tar å dekke merprisen for tankløs løsning
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CalculatorPage;

