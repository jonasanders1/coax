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
  { value: "1-faset-63A-230V", label: "1-faset 63A med 230V" },
  { value: "1-faset-50A-230V", label: "1-faset 50A med 230V" },
  { value: "1-faset-40A-230V", label: "1-faset 40A med 230V" },
  { value: "1-faset-32A-230V", label: "1-faset 32A med 230V" },
  { value: "1-faset-25A-230V", label: "1-faset 25A med 230V" },
  { value: "3-faset-25A-230V", label: "3-faset 25A med 230V" },
  { value: "3-faset-32A-230V", label: "3-faset 32A med 230V" },
  { value: "3-faset-40A-230V", label: "3-faset 40A med 230V" },
  { value: "3-faset-50A-230V", label: "3-faset 50A med 230V" },
  { value: "3-faset-63A-230V", label: "3-faset 63A med 230V" },
];

export const MAIN_FUSE_OPTIONS: SelectOption[] = [
  {
    value: "3x20A-400V",
    label: "3x20A med 400V",
    description: "ca. 6 liter/min kapasitet",
  },
  {
    value: "3x25A-400V",
    label: "3x25A med 400V",
    description: "ca. 6 liter/min",
  },
  {
    value: "3x32A-400V",
    label: "3x32A med 400V",
    description: "ca. 7 liter/min",
  },
  {
    value: "3x40A-400V",
    label: "3x40A med 400V",
    description: "ca. 9 liter/min",
  },
  {
    value: "3x50A-400V",
    label: "3x50A med 400V",
    description: "ca. 12 liter/min",
  },
  {
    value: "3x63A-400V",
    label: "3x63A med 400V",
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
    title: "Kontaktinformasjon",
    description:
      "Vi trenger dine kontaktopplysninger for å sende deg anbefalinger.",
  },
  2: {
    title: "Anvendelsesområde",
    stepNumber: 2,
    description:
      "Hvilken type lokasjon skal COAX-vannvarmeren installeres i? (Flere valg mulig)",
  },
  3: {
    title: "Elektrisk tilgang",
    stepNumber: 3,
    description:
      "Dette hjelper oss med å matche varmeren til ditt strømforsyning. Velg spenning/fase og hovedsikringer.",
  },
  4: {
    title: "Vannstrømbehov",
    stepNumber: 4,
    description:
      "Hva er din estimerte vannstrøm i liter per minutt (L/min)? Dette bestemmer varmerens kapasitet.",
  },
  5: {
    title: "Brukspunkter",
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

