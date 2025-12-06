// NEW SCHEMA
export type Product = {
  id: string;
  model: string; // e.g. JNE70
  category: string;
  inStock: boolean;
  priceFrom: number;
  images?: string[];
  description: string;
  ideal: string[];
  features?: string[];
  installation?: string;
  specs: {
    phase?: number;
    voltage?: string;
    certifications?: string[];
    powerOptions?: number | number[];
    current?: number | number[];
    flowRates?: string[];
    circuitBreaker?: string;
    recommendedConnectionWire?: number | number[];
    safetyClass?: string;
    temperatureRange?: number | number[];
    overheatProtection?: number;
    thermalCutoff?: number;
    workingPressure?: string;
    dimensions?: string | string[];
    efficiency?: number;
    weight?: string;
    color?: string;
    minWaterFlowActivation?: string; // not specified
    pipeConnection?: string; // G1/2"
    material?: string;
    tankCapacity?: string[];
    compressor?: string;
    pipeSize?: string | string[];
    productSize?: number | number[]; // 358×246×85 mm
    packageSize?: number | number[]; // 410×310×120 mm
  };
};
