/**
 * Configuration for Needs Assessment Form
 * Centralized configuration for form steps, options, and labels
 */

export interface StepConfig {
  title: string;
  description: string;
  stepNumber?: number;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export const APPLICATION_AREAS: string[] = [
  "Bolig",
  "Hytte/Fritidshus",
  "Anneks",
  "Båt",
  "Yrkesbygg",
  "Verksted",
];

export const VOLTAGE_PHASE_OPTIONS: SelectOption[] = [
  { value: "230V-1Phase", label: "230V - 1-Phase" },
  { value: "230V-3Phase", label: "230V - 3-Phase" },
  { value: "400V-3Phase", label: "400V - 3-Phase" },
  { value: "3Phase-25A-230V", label: "3-Phase 25A at 230V" },
  { value: "3Phase-32A-230V", label: "3-Phase 32A at 230V" },
  { value: "3Phase-40A-230V", label: "3-Phase 40A at 230V" },
  { value: "3Phase-50A-230V", label: "3-Phase 50A at 230V" },
  { value: "3Phase-63A-230V", label: "3-Phase 63A at 230V" },
  { value: "1Phase-63A-230V", label: "1-Phase 63A at 230V" },
  { value: "1Phase-50A-230V", label: "1-Phase 50A at 230V" },
  { value: "1Phase-40A-230V", label: "1-Phase 40A at 230V" },
  { value: "1Phase-32A-230V", label: "1-Phase 32A at 230V" },
  { value: "1Phase-25A-230V", label: "1-Phase 25A at 230V" },
];

export const MAIN_FUSE_OPTIONS: SelectOption[] = [
  {
    value: "3x20A-400V",
    label: "3x20A at 400V",
    description: "ca. 6 liter/min kapasitet",
  },
  {
    value: "3x25A-400V",
    label: "3x25A at 400V",
    description: "ca. 6 liter/min",
  },
  {
    value: "3x32A-400V",
    label: "3x32A at 400V",
    description: "ca. 7 liter/min",
  },
  {
    value: "3x40A-400V",
    label: "3x40A at 400V",
    description: "ca. 9 liter/min",
  },
  {
    value: "3x50A-400V",
    label: "3x50A at 400V",
    description: "ca. 12 liter/min",
  },
  {
    value: "3x63A-400V",
    label: "3x63A at 400V",
    description: "ca. 13 liter/min",
  },
];

export const WATER_FLOW_OPTIONS: SelectOption[] = [
  {
    value: "3 L/min",
    label: "3 L/min",
    description: "f.eks. for håndvask eller små vasker",
  },
  {
    value: "6 L/min",
    label: "6 L/min",
    description: "f.eks. grunnleggende dusj eller kjøkken",
  },
  { value: "7 L/min", label: "7 L/min" },
  { value: "9 L/min", label: "9 L/min" },
  { value: "12 L/min", label: "12 L/min" },
  { value: "13 L/min", label: "13 L/min" },
];

export const USAGE_POINTS: string[] = [
  "Dusj",
  "Kjøkken",
  "Bad",
  "Handvask",
  "Badekar",
  "Utendørs dusj",
];

export const FORM_STEPS: Record<number, StepConfig> = {
  1: {
    title: "1. Kontaktinformasjon",
    description:
      "Vi trenger dine kontaktopplysninger for å sende deg anbefalinger.",
  },
  2: {
    title: "2. Anvendelsesområde",
    stepNumber: 2,
    description:
      "Hvilken type lokasjon skal COAX-vannvarmeren installeres i? (Flere valg mulig)",
  },
  3: {
    title: "3. Elektrisk tilgang",
    stepNumber: 3,
    description:
      "Dette hjelper oss med å matche varmeren til ditt strømforsyning. Velg spenning/fase og hovedsikringer.",
  },
  4: {
    title: "4. Vannstrømbehov",
    stepNumber: 4,
    description:
      "Hva er din estimerte vannstrøm i liter per minutt (L/min)? Dette bestemmer varmerens kapasitet.",
  },
  5: {
    title: "5. Brukspunkter",
    stepNumber: 5,
    description:
      "Hvor trenger du varmt vann? (Flere valg mulig) Dette hjelper oss med å foreslå plassering og modellfunksjoner.",
  },
};

export const STEP_LABELS: Record<number, string> = {
  1: "Kontakt",
  2: "Område",
  3: "Elektrisk",
  4: "Vannstrøm",
  5: "Bruk & Kommentar",
};

export const TOTAL_STEPS = 5;

