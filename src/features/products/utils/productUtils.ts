/**
 * Utility functions for parsing and formatting product data
 */

/**
 * Standard labels for product spec keys
 * Used consistently across all product displays
 */
export const SPEC_LABELS: Record<string, string> = {
  color: "Farge",
  phase: "Fase",
  voltage: "Spenning (V)",
  powerOptions: "Effektalternativer (kW)",
  current: "Strøm (A)",
  flowRates: "Vannstrøm (L/min)",
  circuitBreaker: "Sikringskrav",
  recommendedConnectionWire: "Anbefalt kabeltykkelse (mm²)",
  safetyClass: "Beskyttelsesklasse",
  temperatureRange: "Temperaturområde (°C)",
  overheatProtection: "Overopphetingsvern (°C)",
  thermalCutoff: "Termisk utkobling (°C)",
  workingPressure: "Arbeidstrykk",
  dimensions: "Mål (H×B×D mm)",
  efficiency: "Energieffektivitet (%)",
  weight: "Vekt (kg)",
  minWaterFlowActivation: "Min. vannmengde for aktivering",
  pipeConnection: "Rørtilkobling",
  material: "Materiale",
  tankCapacity: "Tankkapasitet (L)",
  compressor: "Kompressor",
  pipeSize: "Anbefalt rørdimensjon",
  productSize: "Produktstørrelse (mm)",
  giftBoxSize: "Gaveeske størrelse (mm)",
  packageSize: "Emballasjestørrelse (mm)",
  certifications: "Sertifiseringer",
};

/**
 * Gets the label for a spec key
 * @param key - The spec key
 * @returns The label or the key itself if not found
 */
export function getSpecLabel(key: string): string {
  return SPEC_LABELS[key] ?? key;
}

/**
 * Checks if a spec field should be displayed as badges
 * Excludes fields that have special formatting (dimensions, temperatureRange)
 * @param key - The spec key
 * @param value - The spec value
 * @returns True if the value should be displayed as badges
 */
export function shouldDisplayAsBadges(
  key: string,
  value: unknown
): boolean {
  // Only use badges for arrays
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  // Exclude fields with special formatting
  const excludedKeys = ["dimensions", "temperatureRange"];
  return !excludedKeys.includes(key);
}

/**
 * Formats an array value for badge display
 * Returns an array of formatted strings (with units) ready for badge rendering
 * @param key - The spec key
 * @param value - The array value
 * @returns Array of formatted strings for badges
 */
export function formatSpecForBadges(
  key: string,
  value: unknown[]
): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  const unit = getUnitForKey(key);

  return value.map((item) => {
    const displayValue =
      typeof item === "number" ? item.toString() : String(item);
    return unit ? `${displayValue}${unit}` : displayValue;
  });
}

/**
 * Parses flow rate values from a string (e.g., "3 L/min, 4 L/min" -> [3, 4])
 * @param value - String containing flow rate values
 * @returns Array of parsed numbers
 */
export function parseFlowValues(value: string): number[] {
  if (!value) return [];
  const matches = value.match(/[\d]+(?:[.,]\d+)?/g);
  if (!matches) return [];
  return matches.map((match) => parseFloat(match.replace(",", ".")));
}

/**
 * Normalizes power options to an array format
 * @param powerOptions - Power option(s) as number or array of numbers
 * @returns Array of power options
 */
export function parsePowerOptions(
  powerOptions?: number | number[]
): number[] {
  if (powerOptions === undefined || powerOptions === null) return [];
  if (typeof powerOptions === "number") return [powerOptions];
  if (Array.isArray(powerOptions) && powerOptions.length > 0) {
    return powerOptions;
  }
  return [];
}

// Flow rate formatting threshold
const FLOW_RATE_DECIMAL_THRESHOLD = 10; // Show 0 decimals if >= 10

/**
 * Extracts min and max flow values from an array of flow rate strings
 * @param flowRates - Array of flow rate strings (e.g., ["3 L/min", "4.5 L/min"])
 * @returns Object with min and max values, or null if no valid values found
 */
export function extractFlowRange(flowRates: string[]): {
  min: number;
  max: number;
} | null {
  if (flowRates.length === 0 || flowRates[0] === "—") {
    return null;
  }

  // Parse all numeric values from flow rates
  const flowValues = flowRates
    .flatMap(parseFlowValues)
    .filter((num) => !Number.isNaN(num))
    .sort((a, b) => a - b);

  if (flowValues.length === 0) {
    return null;
  }

  return {
    min: flowValues[0],
    max: flowValues[flowValues.length - 1],
  };
}

/**
 * Formats a flow range for display
 * @param min - Minimum flow value
 * @param max - Maximum flow value
 * @returns Formatted string (e.g., "3 - 5 L/min")
 */
export function formatFlowRange(min: number, max: number): string {
  const format = (value: number) =>
    Number.isFinite(value)
      ? value.toFixed(value >= FLOW_RATE_DECIMAL_THRESHOLD ? 0 : 1)
      : "∞";
  // Always show range, even if min === max
  if (min === max) {
    return `${format(min)} L/min`;
  }
  return `${format(min)} - ${format(max)} L/min`;
}

/**
 * Formats a power range for display
 * @param min - Minimum power value
 * @param max - Maximum power value
 * @returns Formatted string (e.g., "3 - 5 kW")
 */
export function formatPowerRange(min: number, max: number): string {
  if (min === max) {
    return `${min} kW`;
  }
  return `${min} - ${max} kW`;
}

/**
 * Helper function to get the unit for a spec key
 * @param key - The spec key to get the unit for
 * @returns The unit string or null if no unit
 */
export function getUnitForKey(key: string): string | null {
  switch (key) {
    case "flowRates":
      return " L/min";
    case "powerOptions":
      return " kW";
    case "overheatProtection":
      return " °C";
    case "thermalCutoff":
      return " °C";
    case "workingPressure":
      return null;
    case "temperatureRange":
      return " °C";
    case "current":
      return " A";
    case "recommendedConnectionWire":
      return " mm²";
    case "voltage":
      return " V";
    case "weight":
      return " kg";
    case "tankCapacity":
      return " L";
    case "phase":
      return "-fase";
    case "efficiency":
      return " %";
    default:
      return null;
  }
}

/**
 * Helper function to extract numeric value from a string or number
 * @param value - The value to extract
 * @returns String representation of the numeric value
 */
export function extractNumericValue(value: string | number): string {
  const numValue = typeof value === "number" ? value : parseFloat(value);
  if (!isNaN(numValue)) {
    return numValue.toString();
  }
  return String(value);
}

/**
 * Helper function to format spec values with appropriate units
 * @param key - The spec key
 * @param value - The value to format (can be string, number, or array)
 * @returns Formatted string with appropriate units
 */
export function formatSpecValue(key: string, value: unknown): string {
  // Handle arrays - group values and add unit once at the end
  if (Array.isArray(value)) {
    const unit = getUnitForKey(key);

    // Handle dimensions specially (can be "100x200x300" format)
    if (key === "dimensions") {
      return value.map((v) => formatSpecValue(key, v)).join(", ");
    }

    // Temperature range as "min - max °C" instead of "min, max °C"
    if (key === "temperatureRange") {
      const numericValues = value
        .map((v) => (typeof v === "number" ? v : parseFloat(String(v))))
        .filter((v) => !Number.isNaN(v));
      if (!numericValues.length) return "";
      const text = `${numericValues[0]}${
        numericValues.length > 1
          ? ` - ${numericValues[numericValues.length - 1]}`
          : ""
      }`;
      return unit ? `${text}${unit}` : text;
    }

    // For other arrays, extract numeric values and add unit once
    if (unit) {
      const numericValues = value.map((v) => extractNumericValue(v));
      return `${numericValues.join(", ")}${unit}`;
    }

    // For keys without units, just join with commas
    return value.join(", ");
  }

  // Normalize numbers to strings
  if (typeof value === "number") {
    value = value.toString();
  }

  // Handle dimensions specially (can be "100x200x300" format)
  if (key === "dimensions") {
    // Check if it's already formatted with separators
    const str = String(value);
    if (str.includes("×") || str.includes("x") || str.includes("X")) {
      // Split by any separator, trim, and join with proper formatting
      const parts = str
        .split(/[×xX]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      return `${parts.join(" × ")} mm`;
    }
    // If it's a single number, add mm
    const numValue = parseFloat(String(value));
    if (!isNaN(numValue)) {
      return `${String(value)} mm`;
    }
    return String(value);
  }

  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) {
    return String(value); // Return as-is if not a number
  }

  // Add units based on spec key
  const unit = getUnitForKey(key);
  if (unit) {
    return `${value}${unit}`;
  }

  return String(value);
}

/**
 * Renders a spec value consistently - either as formatted string or badge data
 * This function determines the rendering strategy and returns the appropriate format
 * @param key - The spec key
 * @param value - The spec value
 * @returns Object with rendering type and data
 */
export function getSpecRenderData(
  key: string,
  value: unknown
): {
  type: "badges" | "formatted";
  data: string | string[];
} {
  if (shouldDisplayAsBadges(key, value)) {
    return {
      type: "badges",
      data: formatSpecForBadges(key, value as unknown[]),
    };
  }
  return {
    type: "formatted",
    data: formatSpecValue(key, value),
  };
}

