export type FaqContentSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string; to: string };

export type FaqItem = {
  q: string;
  a: string;
  contentSegments?: FaqContentSegment[];
};

export type FaqCategory = {
  category: string;
  questions: FaqItem[];
};

export const faqs: FaqCategory[] = [
  {
    category: "Bruksområder",
    questions: [
      {
        q: "Er COAX ideell for hytter og fritidsboliger?",
        a: "Ja, COAX passer perfekt til alle typer hytter, fritidsboliger, anneks og småhus med strømtilkobling. Vannvarmeren tar minimalt med plass, krever ingen tank å tømme, og gir varmt vann umiddelbart – også når du får besøk. Du får friskt, rent varmtvann hver gang. Ettersom varmeren kun bruker strøm når vannet faktisk tappes, blir det både energieffektivt og kostnadsbesparende.",
      },
      {
        q: "Kan jeg bruke COAX i helårsbolig?",
        a: "Absolutt. Våre 3-fasemodeller (for eksempel XFJ-3-serien) er laget for helårsbruk i boliger med dusj, kjøkken og vaskerom. De gir jevn og stabil varmtvannsforsyning uten behov for stor bereder. Velg modell etter vannforbruk og el-tilgang – vi hjelper gjerne med riktig dimensjonering.",
      },
      {
        q: "Fungerer COAX i næringsbygg?",
        a: "Ja, COAX brukes i dag i hoteller, kontorer, verksteder og industrielle bygg. Systemet kan enkelt skaleres etter behov og er kjent for driftssikkerhet og vedlikeholdsfri bruk. Siden det ikke finnes noen tank, reduseres både plassbehov, varmetap og risiko for bakterievekst – samtidig som du får et svært energieffektivt anlegg.",
      },
    ],
  },
  {
    category: "El-krav",
    questions: [
      {
        q: "Hvilke elektriske krav må oppfylles?",
        a: "Kravene avhenger av modell og ønsket effekt. Våre 1-fasemodeller fungerer med 230V og sikringer fra 16–50A, mens 3-fasemodeller krever 230V eller 400V og sikringer fra 3x20–40A. Det er viktig å avklare kapasitet og hovedsikringer med en autorisert elektriker før installasjon, slik at du får optimal ytelse uten overbelastning.",
      },
      {
        q: "Kan jeg installere COAX selv?",
        a: "Nei. Av sikkerhetsmessige årsaker må installasjonen utføres av autorisert elektriker og rørlegger. Riktig montering sikrer korrekt trykk, optimal temperatur og trygg drift. Vi kan om ønskelig anbefale godkjente fagfolk i ditt område.",
      },
      {
        q: "Hva om jeg har begrenset el-anlegg?",
        a: "Selv ved lavere strømtilgang finnes det løsninger. Modellen XFJ-2-55 er utviklet for mindre anlegg og gir varmt vann til håndvask eller enkel dusj med lavt strømforbruk (omtrent 0,3 kW per dusj). For små hytter, anneks eller campingvogn kan også COAX Armatur 3,3 kW være et godt alternativ. Vi hjelper deg gjerne med å finne den mest egnede modellen for ditt anlegg.",
      },
    ],
  },
  {
    category: "Effektivitet",
    questions: [
      {
        q: "Hvor mye energi sparer jeg med COAX?",
        a: "COAX varmer kun vannet når du faktisk bruker det. I motsetning til en tradisjonell varmtvannstank som holder vannet varmt døgnet rundt, reduserer du både standby-forbruk og varmetap. Mange brukere opplever 20–40 % lavere strømforbruk til varmtvann, avhengig av bruksmønster og antall tappesteder.",
        contentSegments: [
          { kind: "text", value: "Bruk vår " },
          { kind: "link", value: "sparekalkulator", to: "/kalkulator" },
          {
            kind: "text",
            value: " for å beregne hvor mye du kan spare, eller ta kontakt hvis du trenger hjelp til å vurdere løsningen.",
          },
        ],
      },
      {
        q: "Hvor raskt får jeg varmt vann?",
        a: "Umiddelbart! COAX varmer vannet direkte mens det passerer gjennom varmeelementet, så du får varmt vann med en gang du åpner kranen. I tradisjonelle varmtvannstanker må vannet ofte transporteres fra kjeller eller bod via lange rørstrekk til tappestedet, noe som gir ventetid og varmetap. Med COAX unngår du dette, og sparer både tid og vann – perfekt for dusj, kjøkken og vaskerom.",
      },
      {
        q: "Hva er energieffektiviteten til COAX?",
        a: "COAX har en typisk virkningsgrad på opptil 97 %, noe som betyr at nesten all energien brukes til å varme opp vannet. Til sammenligning har tradisjonelle varmtvannstanker betydelig varmetap i både tank og rørstrekk. Du får altså maksimalt utbytte av strømmen du betaler for.",
      },
      {
        q: "Hvordan finner jeg riktig COAX-modell?",
        a: "Bruk vår effektkalkulator for å beregne anbefalt modell, eller ta kontakt hvis du trenger hjelp til å vurdere løsningen.",
      },
    ],
  },
  {
    category: "Vannkvalitet",
    questions: [
      {
        q: "Er vannet trygt å drikke?",
        a: "Ja. COAX gir deg alltid friskt og rent varmtvann direkte fra vannledningen, uten lagring i tank. Dette eliminerer risikoen for bakterievekst og dårlig smak som ofte kan forekomme i varmtvannstanker. Resultatet er hygienisk, oksygenrikt og behagelig varmtvann – hver gang.",
      },
      {
        q: "Kan legionella vokse i COAX?",
        a: "Nei. Legionella-bakterier trenger stillestående vann mellom 20 og 50 °C for å vokse. COAX har ingen lagringstank, og vannet varmes umiddelbart opp til ønsket temperatur i det øyeblikket du åpner kranen. Dermed er risikoen for bakterier som legionella eliminert.",
      },
    ],
  },
  {
    category: "Montering og vedlikehold",
    questions: [
      {
        q: "Hvor mye plass trenger COAX?",
        a: "COAX er svært kompakt og stikker kun ca. 8 cm ut fra veggen. Det gjør den ideell for små bad, hytter, båter og andre steder der plass er en knapp ressurs. Du kan montere den nært tappestedet for rask respons og minimalt varmetap.",
      },
      {
        q: "Hva koster installasjonen?",
        a: "Pris for installasjon varierer avhengig av plassering, eksisterende el-anlegg og rørføringer. Kostnaden er som regel lavere enn ved installasjon av tradisjonell varmtvannstank, siden systemet er mindre og enklere å koble opp. Kontakt oss for et uforpliktende pristilbud fra en av våre samarbeidspartnere.",
      },
      {
        q: "Trenger COAX vedlikehold?",
        a: "COAX er i praksis vedlikeholdsfri under normal bruk. Det finnes ingen tank som må tømmes eller renses, og ingen bevegelige deler som slites. I områder med svært hardt vann kan det likevel være lurt å få en elektriker til å kontrollere anlegget hvert 2–3 år for å sikre optimal drift.",
      },
    ],
  },
];