import type { Product } from "@/types/product";
import { parseFlowValues, parsePowerOptions } from "./productUtils";

export type Recommendation = {
  id: string;
  model: string;
  phase: string;
  fuse: string;
  usage: string;
  minFlow: number;
  maxFlow: number;
  matchMax: number;
  minPowerOption: number;
  maxPowerOption: number;
};

export type TableProduct = {
  id: string;
  model: string;
  flowRates: string[];
  flowValues: number[];
  powerOptions: number[];
  phase: string;
  fuse: string;
};

/**
 * Filters products by category
 */
export function filterProductsByCategory(
  products: Product[],
  category: string
): Product[] {
  if (!products || products.length === 0) return [];
  return products.filter((product) => product.category === category);
}

/**
 * Extracts fuse value from product specs
 */
function extractFuseValue(product: Product): string {
  const specs = product.specs as
    | {
        circuitBreaker?: string | string[];
        fuseCircuit?: string | string[];
      }
    | undefined;
  const fuseRaw = specs?.circuitBreaker ?? specs?.fuseCircuit;
  return Array.isArray(fuseRaw)
    ? fuseRaw.join(", ")
    : fuseRaw ?? "Ikke spesifisert";
}

/**
 * Transforms a product into a Recommendation for model selector
 */
function productToRecommendation(product: Product): Recommendation | null {
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
  const maxPowerOption =
    powerOptions.length > 0 ? Math.max(...powerOptions) : 0;

  const fuseValue = extractFuseValue(product);
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
    matchMax: maxFlow, // Will be updated later
    minPowerOption,
    maxPowerOption,
  };
}

/**
 * Sorts recommendations by minFlow, then by minPowerOption
 */
function sortRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  return recommendations.sort((a, b) => {
    if (a.minFlow !== b.minFlow) {
      return a.minFlow - b.minFlow;
    }
    return a.minPowerOption - b.minPowerOption;
  });
}

/**
 * Calculates matchMax for each recommendation based on next item's minFlow
 */
function calculateMatchMax(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.map((item, index) => {
    const next = recommendations[index + 1];
    return {
      ...item,
      matchMax: next ? next.minFlow : Number.POSITIVE_INFINITY,
    };
  });
}

/**
 * Transforms products into recommendations for model selector
 */
export function createRecommendations(
  products: Product[]
): Recommendation[] {
  if (!products || products.length === 0) return [];

  const derived = products
    .map(productToRecommendation)
    .filter((item): item is Recommendation => item !== null);

  const sorted = sortRecommendations(derived);
  return calculateMatchMax(sorted);
}

/**
 * Transforms a product into a TableProduct for display
 */
function productToTableProduct(product: Product): TableProduct {
  const flowEntries = product.specs?.flowRates ?? [];
  const flowValues = flowEntries
    .flatMap(parseFlowValues)
    .filter((num) => !Number.isNaN(num))
    .sort((a, b) => a - b);

  const powerOptions = parsePowerOptions(product.specs?.powerOptions);
  const fuseValue = extractFuseValue(product);

  return {
    id: product.id,
    model: product.model,
    flowRates: flowEntries.length > 0 ? flowEntries : ["—"],
    flowValues,
    powerOptions: powerOptions.length > 0 ? powerOptions : [],
    phase: String(product.specs?.phase ?? "Ikke spesifisert"),
    fuse: fuseValue,
  };
}

/**
 * Sorts table products by phase, then by min flow value
 */
function sortTableProducts(tableProducts: TableProduct[]): TableProduct[] {
  return tableProducts.sort((a, b) => {
    // Sort by phase first
    const phaseA = a.phase;
    const phaseB = b.phase;
    if (phaseA !== phaseB) {
      // Convert to numbers for comparison if possible, otherwise string compare
      const numA = parseInt(phaseA);
      const numB = parseInt(phaseB);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return phaseA.localeCompare(phaseB);
    }

    // Then sort by liter per minute (lowest flow value)
    const minFlowA = a.flowValues.length > 0 ? a.flowValues[0] : 0;
    const minFlowB = b.flowValues.length > 0 ? b.flowValues[0] : 0;
    return minFlowA - minFlowB;
  });
}

/**
 * Transforms products into table products for display
 */
export function createTableProducts(products: Product[]): TableProduct[] {
  if (!products || products.length === 0) return [];

  const tableProducts = products.map(productToTableProduct);
  return sortTableProducts(tableProducts);
}

/**
 * Finds matching recommendations based on flow rate
 */
export function findMatchingRecommendations(
  recommendations: Recommendation[],
  flowRateLpm: number
): Recommendation[] {
  return recommendations.filter(
    (r) => flowRateLpm >= r.minFlow && flowRateLpm < r.matchMax
  );
}

/**
 * Selects the best matching recommendation from a list
 * Prioritizes lowest power option, then lowest minFlow if power is equal
 */
export function selectBestMatch(
  matchingProducts: Recommendation[]
): Recommendation {
  return matchingProducts.reduce((best, current) => {
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
}

/**
 * Calculates recommendation result based on flow rate
 */
export function calculateRecommendationResult(
  recommendations: Recommendation[],
  flowRateLpm: number
): {
  recommendation: Recommendation;
  calculatedFlowRate: number;
} | null {
  if (!recommendations.length) {
    return null;
  }

  const calculatedFlowRate = Math.round(flowRateLpm * 10) / 10;

  // Find all products that meet the flow requirement
  const matchingProducts = findMatchingRecommendations(
    recommendations,
    flowRateLpm
  );

  let bestMatch: Recommendation;
  if (matchingProducts.length === 0) {
    // If no exact match, use the highest flow product
    bestMatch = recommendations[recommendations.length - 1];
  } else {
    // Among matching products, select the one with the lowest power option
    bestMatch = selectBestMatch(matchingProducts);
  }

  return {
    recommendation: bestMatch,
    calculatedFlowRate,
  };
}

