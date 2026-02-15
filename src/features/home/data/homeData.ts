import {
  Zap,
  Droplet,
  Leaf,
  CheckCircle,
  XCircle,
  ShowerHead,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import cabinImage from "@/assets/cabin.jpg";
import homeImage from "@/assets/home-water-heater.webp";
import industrialImage from "@/assets/industrial-water-heater.png";

export type Benefit = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const benefits: Benefit[] = [
  {
    icon: Zap,
    title: "Energieffektiv",
    text: "COAX varmer vannet direkte i det øyeblikket du åpner kranen. Det betyr ingen standby-forbruk, ingen varmetap og opptil 99 % virkningsgrad. Resultatet: lavere energibruk og lavere strømregning.",
  },
  {
    icon: Leaf,
    title: "Plassbesparende og miljøvennlig",
    text: "Uten tank frigjør du verdifull plass i boligen. COAX er kompakt, diskret og ideell for små bad, hytter og moderne leiligheter. Null lagring av varmtvann betyr også mindre energisløsing og lavere CO₂-avtrykk.",
  },
  {
    icon: Droplet,
    title: "Friskt og hygienisk varmtvann",
    text: "Vannet varmes direkte ved tapping, uten å stå lagret i en tank. Det gir hygienisk, oksygenrikt varmtvann – helt uten økt risiko for bakterievekst som legionella.",
  },
];

export type HowItWorksStep = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    icon: ShowerHead,
    title: "1. Åpne kranen",
    text: "Når vannet begynner å renne, starter COAX automatisk.",
  },
  {
    icon: Zap,
    title: "2. Vannet varmes opp",
    text: "Vannet passerer gjennom et sikkert varmeelement som varmer opp til 30–60 °C i sanntid.",
  },
  {
    icon: CheckCircle,
    title: "Steg 3: Steng kranen",
    text: "COAX slår seg av umiddelbart. Ingen unødig strømbruk – kun rent varmtvann når du trenger det.",
  },
];

export const securityData = [
  {
    item: "Unikt frontdeksel, sprutsikkert, korrosjonsbestandig og aldringsbestandig.",
  },
  {
    item: "Benytter et lukket krets oppvarmingssystem, gir umiddelbart varmt vann med lavt varmetap, og isolasjonsmateriale som helt skiller vann og strøm.",
  },
  {
    item: "Flerlags oppvarmingskammer med lang sirkulerende vannkanal, hindrer kalkdannelse og gir lang levetid.",
  },
  {
    item: "Beskyttelse mot elektrisk lekkasje, skåldingsbeskyttelse, overtrykk- og overopphetingsbeskyttelse. Full isolasjon mellom vann og strøm.",
  },
  {
    item: "Direkte temperaturinnstilling med automatisk termostat – vanntemperaturen holdes konstant.",
  },
  { item: "IP25 vanntett." },
  {
    item: "LED skjerm som viser driftsstatus, inn- og utløpstemperatur, vann- og strømforbruk.",
  },
  { item: "Automatisk feildeteksjon – årsaken vises automatisk ved feil." },
];

export const tecnologyData = [
  { item: "Nikkel-krom varmerørlselement" },
  { item: "Isolert varmeledende magnesiumpulver" },
  { item: "Varmerør i rustfritt stål" },
  { item: "Vannkanal i rustfritt stål" },
  { item: "Støpegods i aluminiums–magnesiumlegering" },
];

export type ComparisonItem = {
  text: string;
  icon: LucideIcon;
};

export type Comparison = {
  traditional: ComparisonItem[];
  coax: ComparisonItem[];
};

export const comparison: Comparison = {
  traditional: [
    { text: "Alltid på, konstant varmetap", icon: XCircle },
    { text: "Tar stor plass", icon: XCircle },
    { text: "Risiko for bakterievekst (Legionella)", icon: XCircle },
    { text: "Høyt standby-forbruk", icon: XCircle },
    { text: "Begrenset varmtvannsmengde", icon: XCircle },
    { text: "Lang oppvarmingstid", icon: XCircle },
    { text: "Kortere levetid: 8-12 år", icon: XCircle },
    { text: "Behøver vedlikehold", icon: XCircle },
  ],
  coax: [
    { text: "Bruker kun strøm når vann tappes", icon: CheckCircle },
    { text: "Kompakt veggmontering", icon: CheckCircle },
    { text: "Alltid friskt og rent vann", icon: CheckCircle },
    { text: "Optil 60% lavere energibruk", icon: CheckCircle },
    { text: "Miljøvennlig og driftssikker", icon: CheckCircle },
    { text: "Ubegrenset varmtvannsmengde", icon: CheckCircle },
    { text: "Lang levetid: 15-20 år", icon: CheckCircle },
    { text: "Vedlikeholdsfri", icon: CheckCircle },
  ],
};

export type CustomerSegment = {
  id: string;
  title: string;
  text: string;
  image: typeof cabinImage;
};

export const customerSegments: CustomerSegment[] = [
  {
    id: "cabin-owners",
    title: "For alle typer hytter",
    text: "COAX passer for både små og store hytter, fra enkle 1-fas installasjoner til kraftigere 3-fas anlegg (230/400 V). Enheten festes flatt på vegg og bygger kun 5-10 cm ut fra veggen, tar ingen gulvplass og er enkel å montere og demontere ved evt. service. Ingen tank betyr ingen tømming ved sesongavslutning, men systemet kan også tømmes sammen med hevert for rørsystemet. Presis styring av vann og energi gjør COAX ideell for vannsparende armaturer og dusjhoder, samtidig som man kan bruke vannsisterner eller begrensede vanntilførsel uten å miste komfort.",
    image: cabinImage,
  },
  {
    id: "home-owners",
    title: "For boliger og leiligheter",
    text: "COAX vannvarmere leveres i ulike effekter og strålestørrelser, og passer for både 1-fas og 3-fas strøm (230/400 V). Systemet gir raskt og stabilt varmtvann, frigjør gulvplass fra store beredere og gir lavere energibruk. Med presis kontroll av strøm, vann og avløp oppnår moderne hjem bedre komfort og mer effektiv ressursbruk. Nøyaktig styring gjør det også mulig å redusere vannforbruk og oppnå ønsket temperatur selv med lavere l/min i armaturer og dusjhoder.",
    image: homeImage,
  },
  {
    id: "businesses",
    title: "For industri og næringsbygg",
    text: "COAX tilbyr skalerbare løsninger som leverer varmtvann direkte til arbeidsstasjoner, dusjer og storkjøkken. Leveres i ulike effekter og fasetyper, med tankløs, energieffektiv oppvarming. Systemet reduserer driftskostnader, øker effektiviteten og er enkelt å integrere i eksisterende rør- og el-installasjoner. Stabilt, presist og driftssikkert – også for store anlegg med høye krav til kontinuerlig varmtvann.",
    image: industrialImage,
  },
];
