/**
 * Utility functions for parsing and formatting product data
 */

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

