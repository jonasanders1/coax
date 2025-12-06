export type ComparisonDataItem = {
  category: string;
  tank: string;
  coax: string;
};

export const comparisonData: ComparisonDataItem[] = [
  {
    category: "Type løsning",
    tank: "Magasinering i tank – vann holdes varmt døgnet rundt",
    coax: "Direkte gjennomstrømningsoppvarming – aktiv kun ved tapping",
  },
  {
    category: "Strømforbruk",
    tank: "Kontinuerlig varmetap (standby-tap)",
    coax: "Ingen standby-tap – bruker kun strøm ved tapping, 24–34% lavere energibruk",
  },
  {
    category: "Plassbehov",
    tank: "Stor: typisk 60x60x120 cm, krever teknisk rom/bod",
    coax: "Ultrakompakt: 9x38x26 cm – kan monteres diskré nær tappested",
  },
  {
    category: "Hygiene",
    tank: "Risiko for bakterievekst i stillestående vann",
    coax: "Ingen tank – friskt, oksygenrikt vann direkte fra ledningsnettet",
  },
  {
    category: "Kapasitet",
    tank: "Begrenset til tankvolum – går tom ved høyt forbruk",
    coax: "Ubegrenset varmtvann – så lenge kranen er åpen",
  },
  {
    category: "Vedlikehold",
    tank: "Krever jevnlig kontroll av anode, rengjøring og tømming",
    coax: "Vedlikeholdsfri – ingen tank, ingen bevegelige deler",
  },
  {
    category: "Levetid",
    tank: "8–12 år",
    coax: "15–20 år – robust, enkel konstruksjon",
  },
  {
    category: "Installasjon",
    tank: "Krever sluk i gulv og sikkerhetsventil, ofte lange rørstrekk",
    coax: "Enkel installasjon – liten enhet, korte rør, ingen sluk nødvendig",
  },
  {
    category: "System og rør",
    tank: "Sentralisert – lange rør gir større varmetap og ventetid",
    coax: "Desentralisert – varme kun der det trengs, nesten ingen ventetid",
  },
  {
    category: "Frostbeskyttelse (hytter)",
    tank: "Må tømmes eller stå i oppvarmet rom – risiko for frostskader",
    coax: "Minimal frostfare – svært lite vannvolum, enkelt å tømme",
  },
  {
    category: "Miljøpåvirkning",
    tank: "Høyere energibruk og mer vannsløsing ved venting",
    coax: "Mer miljøvennlig – lavt strømforbruk og mindre tap av kaldt vann",
  },
  {
    category: "Trykk og vannmengde",
    tank: "Godt trykk, men begrenset mengde",
    coax: "Stabilt trykk, god mengde – ingen trykkfall selv ved flere tappesteder",
  },
  {
    category: "Vannbesparende armatur",
    tank: "Lang ventetid gjør vannbesparende dyser upraktiske – dårligere komfort og mer kaldtvannssløsing",
    coax: "Kan bruke svært effektive vannbesparende armaturer uten at komfort påvirkes – varmt vann kommer raskt",
  },
  {
    category: "Energitap i rør",
    tank: "Store tap i lange rørstrekk fra sentral tank til tappested",
    coax: "Nesten ingen tap – korte rør og lokal oppvarming",
  },
  {
    category: "Skalerbarhet",
    tank: "Én stor enhet som må dimensjoneres for toppforbruk",
    coax: "Modulbasert – flere små enheter kan monteres ved flere tappesteder",
  },
  {
    category: "Støy",
    tank: "Kan lage klikkelyder og ekspansjonsstøy når vann varmes",
    coax: "Nær lydløs drift – ingen stor vannmasse som varmes opp",
  },
  {
    category: "Tappekomfort",
    tank: "Ventetid ved tapping, kaldtvannskast før varmt vann kommer",
    coax: "Rask responstid – mindre temperatursvingninger",
  },
  {
    category: "Sikkerhet",
    tank: "Mulighet for lekkasje eller tankbrudd",
    coax: "Ingen tank – ingen risiko for store vannlekkasjer",
  },
];

