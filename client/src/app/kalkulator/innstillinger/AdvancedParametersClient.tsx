"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalculationParams,
  DEFAULT_PARAMS,
  validateAndSanitizeParam,
} from "@/lib/calculator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitile from "@/components/PageTitile";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";

// Helper to serialize params to URL
function paramsToSearchParams(params: CalculationParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  return searchParams;
}

// Helper to deserialize params from URL
function searchParamsToParams(
  searchParams: URLSearchParams
): Partial<CalculationParams> {
  const params: Partial<CalculationParams> = {};
  searchParams.forEach((value, key) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      params[key as keyof CalculationParams] = numValue as any;
    } else if (value === "true" || value === "false") {
      params[key as keyof CalculationParams] = (value === "true") as any;
    }
  });
  return params;
}

const AdvancedParametersClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<CalculationParams>(() => {
    if (!searchParams) return DEFAULT_PARAMS;
    const urlParams = searchParamsToParams(searchParams);
    return { ...DEFAULT_PARAMS, ...urlParams };
  });

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

  // Update URL when params change (but not on initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    // Skip URL update on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const urlParams = paramsToSearchParams(params);
    router.replace(`/kalkulator/innstillinger?${urlParams.toString()}`, {
      scroll: false,
    });
  }, [params, router]);

  const handleSaveAndReturn = () => {
    const urlParams = paramsToSearchParams(params);
    router.push(`/kalkulator?${urlParams.toString()}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container max-w-6xl mx-auto px-4 space-y-6">
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
            href="/kalkulator"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Forbrukskalkulator
          </Link>
          <Typography sx={{ color: "hsl(var(--accent))" }}>
            Innstillinger
          </Typography>
        </Breadcrumbs>
        <PageTitile
          title="Innstillinger"
          text="Detaljerte innstillinger for mer nøyaktige beregninger"
        />

        <Card className="shadow-lg">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-2xl">Innstillinger</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Household Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Husholdning</h3>
                <div className="space-y-2">
                  <Label htmlFor="antallPersoner">
                    Antall personer i husholdningen: {params.antallPersoner}
                  </Label>
                  <Slider
                    id="antallPersoner"
                    min={1}
                    max={8}
                    step={1}
                    value={[params.antallPersoner]}
                    onValueChange={(value) =>
                      updateParam("antallPersoner", value[0])
                    }
                  />
                </div>
              </div>

              {/* Usage Parameters */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Vannbruk
                </h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kitchenUsesPerPersonPerDay">
                        Kjøkkenbruk per person/dag:{" "}
                        {params.kitchenUsesPerPersonPerDay}
                      </Label>
                      <Slider
                        id="kitchenUsesPerPersonPerDay"
                        min={1}
                        max={10}
                        step={1}
                        value={[params.kitchenUsesPerPersonPerDay]}
                        onValueChange={(value) =>
                          updateParam("kitchenUsesPerPersonPerDay", value[0])
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="washbasinUsesPerPersonPerDay">
                        Håndvask per person/dag:{" "}
                        {params.washbasinUsesPerPersonPerDay}
                      </Label>
                      <Slider
                        id="washbasinUsesPerPersonPerDay"
                        min={1}
                        max={20}
                        step={1}
                        value={[params.washbasinUsesPerPersonPerDay]}
                        onValueChange={(value) =>
                          updateParam("washbasinUsesPerPersonPerDay", value[0])
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kitchenDurationSec">
                        Kjøkkenvask varighet (sek)
                      </Label>
                      <Input
                        id="kitchenDurationSec"
                        type="number"
                        value={params.kitchenDurationSec}
                        onChange={(e) =>
                          updateParam(
                            "kitchenDurationSec",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="washbasinDurationSec">
                        Håndvask varighet (sek)
                      </Label>
                      <Input
                        id="washbasinDurationSec"
                        type="number"
                        value={params.washbasinDurationSec}
                        onChange={(e) =>
                          updateParam(
                            "washbasinDurationSec",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow Rate */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">
                  Strømningsrate (L/min)
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="flowRateLPerMinTank">
                      Tank: {params.flowRateLPerMinTank} L/min
                    </Label>
                    <Slider
                      id="flowRateLPerMinTank"
                      min={6}
                      max={12}
                      step={0.5}
                      value={[params.flowRateLPerMinTank]}
                      onValueChange={(value) =>
                        updateParam("flowRateLPerMinTank", value[0])
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Pipe Length */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">
                  Rørlengde til kran (m)
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pipeLengthTankM">
                      Tank: {params.pipeLengthTankM} m
                    </Label>
                    <Slider
                      id="pipeLengthTankM"
                      min={5}
                      max={20}
                      step={1}
                      value={[params.pipeLengthTankM]}
                      onValueChange={(value) =>
                        updateParam("pipeLengthTankM", value[0])
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Wait Time */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">
                  Ventetid for varmtvann
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tankWaitTimeSec">
                      Tank: {params.tankWaitTimeSec} sekunder
                    </Label>
                    <Slider
                      id="tankWaitTimeSec"
                      min={5}
                      max={45}
                      step={1}
                      value={[params.tankWaitTimeSec]}
                      onValueChange={(value) =>
                        updateParam("tankWaitTimeSec", value[0])
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      COAX har fast ventetid på 3 sekunder
                    </p>
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Temperaturer (°C)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inletTempC">Innløp</Label>
                    <Input
                      id="inletTempC"
                      type="number"
                      value={params.inletTempC}
                      onChange={(e) =>
                        updateParam(
                          "inletTempC",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetTempC">Mål (bruk)</Label>
                    <Input
                      id="targetTempC"
                      type="number"
                      value={params.targetTempC}
                      onChange={(e) =>
                        updateParam(
                          "targetTempC",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tankStorageTempC">Tank lagring</Label>
                    <Input
                      id="tankStorageTempC"
                      type="number"
                      value={params.tankStorageTempC}
                      onChange={(e) =>
                        updateParam(
                          "tankStorageTempC",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Lagringstemp. for tank
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ambientTempC">Rom (tank)</Label>
                    <Input
                      id="ambientTempC"
                      type="number"
                      value={params.ambientTempC}
                      onChange={(e) =>
                        updateParam(
                          "ambientTempC",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Romtemp. hvor tank står
                    </p>
                  </div>
                </div>
              </div>

              {/* Efficiency */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Effektivitet</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tankEfficiency">Tank</Label>
                    <Input
                      id="tankEfficiency"
                      type="number"
                      step="0.01"
                      value={params.tankEfficiency}
                      onChange={(e) =>
                        updateParam(
                          "tankEfficiency",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Cost & Other */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Kostnad og andre</h3>
                <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="insulatedPipes"
                    checked={params.insulatedPipes}
                    onCheckedChange={(checked) =>
                      updateParam("insulatedPipes", !!checked)
                    }
                  />
                  <Label htmlFor="insulatedPipes">
                    Isolerte rør (reduserer tap)
                  </Label>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button onClick={handleSaveAndReturn} size="lg">
                  Lagre og se resultater
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedParametersClient;
