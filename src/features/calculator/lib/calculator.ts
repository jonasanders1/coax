import { sanitizeNumberInput } from "@/shared/utils/inputValidation";

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
  waterPricePerM3: number; // kr per m³ delivered water
  wastewaterPricePerM3: number; // kr per m³ wastewater
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
  // Water cost fields
  tanklessWaterCostPerYearNOK: number;
  tankWaterCostPerYearNOK: number;
  totalTanklessCostPerYearNOK: number; // energy + water
  totalTankCostPerYearNOK: number; // energy + water
  totalAnnualSavingsNOK: number; // energy + water combined
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
  flowRateLPerMinTankless: 7.0, // COAX
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
  waterPricePerM3: 22.74, // Average from SSB (kr/m³)
  wastewaterPricePerM3: 26.51, // Average from SSB (kr/m³)
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
  ambientTempC: { min: 10, max: 25, default: 20 },
  insulatedPipes: null, // boolean, no bounds
  tankWaitTimeSec: { min: 5, max: 45, default: 10 },
  tankStorageTempC: { min: 55, max: 75, default: 65 },
  waterPricePerM3: { min: 0, max: 100, default: 22.74 },
  wastewaterPricePerM3: { min: 0, max: 100, default: 26.51 },
};

// Physical constants used in calculations
const SPECIFIC_HEAT_WH_PER_L_C = 1.162; // Wh per liter per °C
const PIPE_CAPACITY_L_PER_M = 0.15; // Liters per meter for typical 15mm pipe
const COAX_WAIT_TIME_SEC = 2; // Fixed wait time for COAX water heater

/**
 * Asserts that all provided values are finite numbers
 * @throws Error if any value is not finite
 */
function assertFinite(...values: number[]): void {
  if (values.some((v) => !Number.isFinite(v))) {
    throw new Error("Invalid calculation input: non-finite values detected");
  }
}

/**
 * Calculates energy consumption and costs for both tankless (COAX) and tank water heaters
 * @param params - Calculation parameters (must be validated and sanitized)
 * @returns Calculation results including energy usage, costs, and savings
 * @throws Error if any input parameter is not a finite number
 */
export function calculateResults(
  params: CalculationParams
): CalculationResults {
  // Guard: Assert all numeric parameters are finite
  assertFinite(
    params.antallPersoner,
    params.dusjerPerPersonPerDag,
    params.minPerDusj,
    params.tanklessEfficiency,
    params.tankEfficiency,
    params.standbyTapTankkWhPerYear,
    params.strømprisNOKPerkWh,
    params.inletTempC,
    params.targetTempC,
    params.flowRateLPerMinTankless,
    params.flowRateLPerMinTank,
    params.kitchenUsesPerPersonPerDay,
    params.kitchenDurationSec,
    params.washbasinUsesPerPersonPerDay,
    params.washbasinDurationSec,
    params.pipeLengthTanklessM,
    params.pipeLengthTankM,
    params.ambientTempC,
    params.tankWaitTimeSec,
    params.tankStorageTempC,
    params.waterPricePerM3,
    params.wastewaterPricePerM3
  );

  const deltaT = params.targetTempC - params.inletTempC;
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
    (params.pipeLengthTanklessM * PIPE_CAPACITY_L_PER_M * insulatedFactor);
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
    totalUsesPerDay *
    (params.pipeLengthTankM * PIPE_CAPACITY_L_PER_M * insulatedFactor);
  const dailyVolumeTank =
    showerVolumeTank +
    kitchenVolumeTank +
    washbasinVolumeTank +
    extraVolumeTank;

  // Calculate wait time water waste
  // COAX: Fixed wait time (3 seconds)
  const dailyWaitWaterWasteTankless =
    totalUsesPerDay * (COAX_WAIT_TIME_SEC / 60) * params.flowRateLPerMinTankless;

  // Tank: Adjustable wait time
  const dailyWaitWaterWasteTank =
    totalUsesPerDay * (params.tankWaitTimeSec / 60) * params.flowRateLPerMinTank;

  // Calculate annual water savings
  const annualWaterSavingsLiters =
    (dailyWaitWaterWasteTank - dailyWaitWaterWasteTankless) * 365;

  // Calculate energy consumption for tankless
  const tanklessEnergyDailyWh =
    (dailyVolumeTankless * SPECIFIC_HEAT_WH_PER_L_C * deltaT) /
    params.tanklessEfficiency;
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
    (requiredHotWaterVolume * SPECIFIC_HEAT_WH_PER_L_C * storageDeltaT) /
    params.tankEfficiency;
  const tankkWhPerDay = tankEnergyDailyWh / 1000;

  // Standby heat loss adjustment based on ambient temperature
  // Heuristic: Lower ambient temp = higher heat loss
  // Clamped to reasonable range (0.7 to 1.3) to prevent negative or extreme values
  const standbyAdjustment = Math.max(
    0.7,
    Math.min(1.3, 1 + (20 - params.ambientTempC) / 20)
  );
  const standbyYearAdjusted =
    params.standbyTapTankkWhPerYear * standbyAdjustment;
  const tankkWhPerYear = tankkWhPerDay * 365 + standbyYearAdjusted;

  // Calculate costs
  const tanklessCostPerYearNOK = tanklesskWhPerYear * params.strømprisNOKPerkWh;
  const tankCostPerYearNOK = tankkWhPerYear * params.strømprisNOKPerkWh;

  // Calculate savings (energy only)
  const annualSavingskWh = tankkWhPerYear - tanklesskWhPerYear;
  const annualSavingsNOK = tankCostPerYearNOK - tanklessCostPerYearNOK;

  // Calculate water consumption in m³ per year
  // Total water = daily consumption + wait water waste
  const annualWaterVolumeTanklessM3 =
    ((dailyVolumeTankless + dailyWaitWaterWasteTankless) * 365) / 1000;
  const annualWaterVolumeTankM3 =
    ((dailyVolumeTank + dailyWaitWaterWasteTank) * 365) / 1000;

  // Calculate water costs (water price + wastewater price per m³)
  const tanklessWaterCostPerYearNOK =
    annualWaterVolumeTanklessM3 *
    (params.waterPricePerM3 + params.wastewaterPricePerM3);
  const tankWaterCostPerYearNOK =
    annualWaterVolumeTankM3 *
    (params.waterPricePerM3 + params.wastewaterPricePerM3);

  // Calculate total costs (energy + water)
  const totalTanklessCostPerYearNOK =
    tanklessCostPerYearNOK + tanklessWaterCostPerYearNOK;
  const totalTankCostPerYearNOK = tankCostPerYearNOK + tankWaterCostPerYearNOK;

  // Calculate total savings (energy + water)
  const totalAnnualSavingsNOK =
    totalTankCostPerYearNOK - totalTanklessCostPerYearNOK;

  return {
    dusjerPerDagTotal,
    minPerDagTotal,
    dailyVolumeTankless,
    dailyVolumeTank,
    dailyWaitWaterWasteTankless,
    dailyWaitWaterWasteTank,
    annualWaterSavingsLiters,
    deltaT,
    tanklesskWhPerDay,
    tankkWhPerDay,
    tanklesskWhPerYear,
    tankkWhPerYear,
    tanklessCostPerYearNOK,
    tankCostPerYearNOK,
    annualSavingskWh,
    annualSavingsNOK,
    // Water costs
    tanklessWaterCostPerYearNOK,
    tankWaterCostPerYearNOK,
    totalTanklessCostPerYearNOK,
    totalTankCostPerYearNOK,
    totalAnnualSavingsNOK,
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

/**
 * Checks if the current parameters differ from default parameters
 * @param params - Current calculation parameters
 * @returns true if any parameter differs from defaults, false otherwise
 */
export function hasCustomParams(params: CalculationParams): boolean {
  const EPSILON = 0.0001; // Small epsilon for floating-point comparison

  for (const key in DEFAULT_PARAMS) {
    const paramKey = key as keyof CalculationParams;
    const currentValue = params[paramKey];
    const defaultValue = DEFAULT_PARAMS[paramKey];

    // Handle boolean values
    if (typeof defaultValue === "boolean") {
      if (currentValue !== defaultValue) {
        return true;
      }
      continue;
    }

    // Handle numeric values with epsilon comparison
    if (typeof defaultValue === "number" && typeof currentValue === "number") {
      if (Math.abs(currentValue - defaultValue) > EPSILON) {
        return true;
      }
    }
  }

  return false;
}
