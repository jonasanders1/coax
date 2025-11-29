import { sanitizeNumberInput } from "@/utils/inputValidation";

export interface CalculationParams {
  antallPersoner: number;
  dusjerPerPersonPerDag: number;
  minPerDusj: number;
  tanklessEfficiency: number;
  tankEfficiency: number;
  standbyTapTankkWhPerYear: number;
  strømprisNOKPerkWh: number;
  inletTempC: number;
  targetTempC: number;
  flowRateLPerMinTankless: number;
  flowRateLPerMinTank: number;
  kitchenUsesPerPersonPerDay: number;
  kitchenDurationSec: number;
  washbasinUsesPerPersonPerDay: number;
  washbasinDurationSec: number;
  pipeLengthTanklessM: number;
  pipeLengthTankM: number;
  ambientTempC: number;
  insulatedPipes: boolean;
  tankWaitTimeSec: number;
  tankStorageTempC: number;
}

export interface CalculationResults {
  dusjerPerDagTotal: number;
  minPerDagTotal: number;
  dailyVolumeTankless: number;
  dailyVolumeTank: number;
  dailyWaitWaterWasteTankless: number;
  dailyWaitWaterWasteTank: number;
  annualWaterSavingsLiters: number;
  deltaT: number;
  tanklesskWhPerDay: number;
  tankkWhPerDay: number;
  tanklesskWhPerYear: number;
  tankkWhPerYear: number;
  tanklessCostPerYearNOK: number;
  tankCostPerYearNOK: number;
  annualSavingskWh: number;
  annualSavingsNOK: number;
}

export const DEFAULT_PARAMS: CalculationParams = {
  antallPersoner: 3, // Common
  dusjerPerPersonPerDag: 1, // Common
  minPerDusj: 6, // Common
  tanklessEfficiency: 0.99, // COAX
  tankEfficiency: 0.93, // Tank
  standbyTapTankkWhPerYear: 1000.0, // Tank
  strømprisNOKPerkWh: 1.5, // Common
  inletTempC: 10.0, // Common
  targetTempC: 40.0, // Common
  flowRateLPerMinTankless: 6.0, // COAX
  flowRateLPerMinTank: 9.0, // Tank
  kitchenUsesPerPersonPerDay: 4, // Common
  kitchenDurationSec: 37, // Common
  washbasinUsesPerPersonPerDay: 6, // Common
  washbasinDurationSec: 20, // Common
  pipeLengthTanklessM: 2.0, // COAX
  pipeLengthTankM: 10.0, // Tank
  ambientTempC: 15.0, // Common
  insulatedPipes: false, // Common
  tankWaitTimeSec: 10.0, // Tank
  tankStorageTempC: 65.0, // Tank
};

export const PARAM_BOUNDS: Record<
  keyof CalculationParams,
  { min: number; max: number; default: number } | null
> = {
  antallPersoner: { min: 1, max: 10, default: 3 },
  dusjerPerPersonPerDag: { min: 0.5, max: 10, default: 1 },
  minPerDusj: { min: 1, max: 60, default: 4 },
  tanklessEfficiency: { min: 0.9, max: 1, default: 0.99 },
  tankEfficiency: { min: 0.8, max: 1, default: 0.93 },
  standbyTapTankkWhPerYear: { min: 0, max: 10000, default: 800.0 },
  strømprisNOKPerkWh: { min: 0.01, max: 100, default: 1 },
  inletTempC: { min: 5, max: 15, default: 10 },
  targetTempC: { min: 38, max: 42, default: 40 },
  flowRateLPerMinTankless: { min: 4, max: 12, default: 6 },
  flowRateLPerMinTank: { min: 6, max: 12, default: 9 },
  kitchenUsesPerPersonPerDay: { min: 1, max: 10, default: 4 },
  kitchenDurationSec: { min: 10, max: 60, default: 30 },
  washbasinUsesPerPersonPerDay: { min: 1, max: 20, default: 6 },
  washbasinDurationSec: { min: 5, max: 30, default: 10 },
  pipeLengthTanklessM: { min: 0.5, max: 10, default: 2 },
  pipeLengthTankM: { min: 5, max: 20, default: 10 },
  ambientTempC: { min: 15, max: 25, default: 20 },
  insulatedPipes: null, // boolean, no bounds
  tankWaitTimeSec: { min: 5, max: 45, default: 10 },
  tankStorageTempC: { min: 55, max: 75, default: 65 },
};

/**
 * Calculates energy consumption and costs for both tankless (COAX) and tank water heaters
 * @param params - Calculation parameters
 * @returns Calculation results including energy usage, costs, and savings
 */
export function calculateResults(
  params: CalculationParams
): CalculationResults {
  const deltaT = params.targetTempC - params.inletTempC;
  const specificHeat = 1.162; // Wh/L/°C
  const pipeCapacity = 0.15; // L/m for typical 15mm pipe
  const insulatedFactor = params.insulatedPipes ? 0.5 : 1;

  const dusjerPerDagTotal =
    params.antallPersoner * params.dusjerPerPersonPerDag;
  const minPerDagTotal = dusjerPerDagTotal * params.minPerDusj;
  const kitchenUsesTotal =
    params.antallPersoner * params.kitchenUsesPerPersonPerDay;
  const washbasinUsesTotal =
    params.antallPersoner * params.washbasinUsesPerPersonPerDay;
  const totalUsesPerDay =
    dusjerPerDagTotal + kitchenUsesTotal + washbasinUsesTotal;

  // Calculate volumes for tankless system
  const showerVolumeTankless =
    dusjerPerDagTotal * params.minPerDusj * params.flowRateLPerMinTankless;
  const kitchenVolumeTankless =
    kitchenUsesTotal *
    (params.kitchenDurationSec / 60) *
    params.flowRateLPerMinTankless;
  const washbasinVolumeTankless =
    washbasinUsesTotal *
    (params.washbasinDurationSec / 60) *
    params.flowRateLPerMinTankless;
  const extraVolumeTankless =
    totalUsesPerDay *
    (params.pipeLengthTanklessM * pipeCapacity * insulatedFactor);
  const dailyVolumeTankless =
    showerVolumeTankless +
    kitchenVolumeTankless +
    washbasinVolumeTankless +
    extraVolumeTankless;

  // Calculate volumes for tank system
  const showerVolumeTank =
    dusjerPerDagTotal * params.minPerDusj * params.flowRateLPerMinTank;
  const kitchenVolumeTank =
    kitchenUsesTotal *
    (params.kitchenDurationSec / 60) *
    params.flowRateLPerMinTank;
  const washbasinVolumeTank =
    washbasinUsesTotal *
    (params.washbasinDurationSec / 60) *
    params.flowRateLPerMinTank;
  const extraVolumeTank =
    totalUsesPerDay * (params.pipeLengthTankM * pipeCapacity * insulatedFactor);
  const dailyVolumeTank =
    showerVolumeTank +
    kitchenVolumeTank +
    washbasinVolumeTank +
    extraVolumeTank;

  // Calculate wait time water waste
  // COAX: Fixed 2 seconds wait time
  const coaxWaitTimeSec = 3;
  const tankWaitTimeSec = params.tankWaitTimeSec ?? 20; // Default to 20 if undefined

  // Ensure all values are valid numbers
  const validTotalUses = isNaN(totalUsesPerDay) ? 0 : totalUsesPerDay;
  const validFlowRateTankless = isNaN(params.flowRateLPerMinTankless)
    ? 0
    : params.flowRateLPerMinTankless;
  const validFlowRateTank = isNaN(params.flowRateLPerMinTank)
    ? 0
    : params.flowRateLPerMinTank;
  const validTankWaitTime = isNaN(tankWaitTimeSec) ? 20 : tankWaitTimeSec;

  const dailyWaitWaterWasteTankless =
    validTotalUses * (coaxWaitTimeSec / 60) * validFlowRateTankless;

  // Tank: Adjustable wait time
  const dailyWaitWaterWasteTank =
    validTotalUses * (validTankWaitTime / 60) * validFlowRateTank;

  // Calculate annual water savings
  const annualWaterSavingsLiters =
    (dailyWaitWaterWasteTank - dailyWaitWaterWasteTankless) * 365;

  // Calculate energy consumption for tankless
  const tanklessEnergyDailyWh =
    (dailyVolumeTankless * specificHeat * deltaT) / params.tanklessEfficiency;
  const tanklesskWhPerDay = tanklessEnergyDailyWh / 1000;
  const tanklesskWhPerYear = tanklesskWhPerDay * 365;

  // Calculate energy consumption for tank
  // Tanks store water at higher temperature (60-70°C) and mix with cold water
  // Mixing ratio: (targetTemp - inletTemp) / (storageTemp - inletTemp)
  const storageDeltaT = params.tankStorageTempC - params.inletTempC;
  const mixingRatio = deltaT / storageDeltaT; // Ratio of hot water needed
  const requiredHotWaterVolume = dailyVolumeTank * mixingRatio;

  // Energy to heat the required hot water volume to storage temperature
  const tankEnergyDailyWh =
    (requiredHotWaterVolume * specificHeat * storageDeltaT) /
    params.tankEfficiency;
  const tankkWhPerDay = tankEnergyDailyWh / 1000;
  const standbyAdjustment = 1 + (20 - params.ambientTempC) / 10;
  const standbyYearAdjusted =
    params.standbyTapTankkWhPerYear * standbyAdjustment;
  const tankkWhPerYear = tankkWhPerDay * 365 + standbyYearAdjusted;

  // Calculate costs
  const tanklessCostPerYearNOK = tanklesskWhPerYear * params.strømprisNOKPerkWh;
  const tankCostPerYearNOK = tankkWhPerYear * params.strømprisNOKPerkWh;

  // Calculate savings
  const annualSavingskWh = tankkWhPerYear - tanklesskWhPerYear;
  const annualSavingsNOK = tankCostPerYearNOK - tanklessCostPerYearNOK;

  return {
    dusjerPerDagTotal,
    minPerDagTotal,
    dailyVolumeTankless,
    dailyVolumeTank,
    dailyWaitWaterWasteTankless: isNaN(dailyWaitWaterWasteTankless)
      ? 0
      : dailyWaitWaterWasteTankless,
    dailyWaitWaterWasteTank: isNaN(dailyWaitWaterWasteTank)
      ? 0
      : dailyWaitWaterWasteTank,
    annualWaterSavingsLiters: isNaN(annualWaterSavingsLiters)
      ? 0
      : annualWaterSavingsLiters,
    deltaT,
    tanklesskWhPerDay,
    tankkWhPerDay,
    tanklesskWhPerYear,
    tankkWhPerYear,
    tanklessCostPerYearNOK,
    tankCostPerYearNOK,
    annualSavingskWh,
    annualSavingsNOK,
  };
}

/**
 * Validates and sanitizes a parameter value based on its bounds
 * @param key - The parameter key to update
 * @param value - The new value (number, string, or boolean)
 * @param currentParams - Current parameter values
 * @returns Updated parameter value or null if invalid
 */
export function validateAndSanitizeParam(
  key: keyof CalculationParams,
  value: number | string | boolean,
  currentParams: CalculationParams
): Partial<CalculationParams> | null {
  if (key === "insulatedPipes") {
    return { [key]: !!value } as Partial<CalculationParams>;
  }

  const bound = PARAM_BOUNDS[key];
  if (!bound) return null;

  const sanitizedValue = sanitizeNumberInput(
    typeof value === "string" ? parseFloat(value) : (value as number),
    bound.min,
    bound.max,
    bound.default
  );

  return { [key]: sanitizedValue } as Partial<CalculationParams>;
}
