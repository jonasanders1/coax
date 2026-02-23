"use client";

import {
  Zap,
  Maximize2,
  ShieldCheck,
  Droplets,
  Wrench,
  Clock,
  Package,
  Thermometer,
  Volume2,
  Snowflake,
  Leaf,
  Gauge,
  ArrowRight,
  Pipette,
  Cable,
  Scale,
  CalculatorIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import SectionTitle from "@/shared/components/common/SectionTitle";
import {
  ANIMATION_DURATION,
  ANIMATION_OFFSET_Y_SMALL,
  EASING_CURVE,
} from "@/constants/animations";

const categories = [
  {
    icon: Package,
    category: "Type løsning",
    tank: "Magasinering i tank – vann holdes varmt døgnet rundt, uansett om du bruker det eller ikke.",
    coax: "Direkte gjennomstrømningsoppvarming – aktiveres kun når du åpner kranen.",
  },
  {
    icon: Zap,
    category: "Strømforbruk",
    tank: "Kontinuerlig varmetap fra standby-oppvarming. Tanken bruker strøm hele døgnet for å holde vannet varmt.",
    coax: "Ingen standby-tap. Bruker kun strøm ved tapping – 24–34% lavere totalt energibruk.",
    highlight: "24–34% lavere",
  },
  {
    icon: Maximize2,
    category: "Plassbehov",
    tank: "Typisk 60×60×120 cm. Krever eget teknisk rom eller stor bod.",
    coax: "Ultrakompakt: kun 9×38×26 cm. Monteres diskré rett ved tappestedet.",
    highlight: "95% mindre",
  },
  {
    icon: ShieldCheck,
    category: "Hygiene",
    tank: "Stillestående vann i tanken gir risiko for legionella og bakterievekst.",
    coax: "Ingen tank – friskt, oksygenrikt vann strømmer direkte fra ledningsnettet.",
  },
  {
    icon: Droplets,
    category: "Kapasitet",
    tank: "Begrenset til tankens volum. Går tom ved høyt forbruk og trenger tid for å varme opp igjen.",
    coax: "Ubegrenset varmtvann – leverer konstant så lenge kranen er åpen.",
    highlight: "Ubegrenset",
  },
  {
    icon: Wrench,
    category: "Vedlikehold",
    tank: "Krever jevnlig kontroll av anode, rengjøring mot kalkavleiring og tømming.",
    coax: "Vedlikeholdsfri – ingen tank, ingen anode, ingen bevegelige deler.",
  },
  {
    icon: Clock,
    category: "Levetid",
    tank: "Typisk 8–12 år. Korrosjon og kalkoppbygging forkorter levetiden.",
    coax: "15–20 år takket være robust, enkel konstruksjon uten lagret vann.",
    highlight: "15–20 år",
  },
  {
    icon: Cable,
    category: "Installasjon",
    tank: "Krever sluk i gulv, sikkerhetsventil og ofte lange rørstrekk fra teknisk rom.",
    coax: "Enkel montering – liten enhet, korte rør, ingen sluk nødvendig.",
  },
  {
    icon: Pipette,
    category: "System og rør",
    tank: "Sentralisert system – lange rør gir større varmetap og ventetid på varmt vann.",
    coax: "Desentralisert – varmer vannet der det brukes, nesten null ventetid.",
  },
  {
    icon: Snowflake,
    category: "Frostbeskyttelse",
    tank: "Må tømmes helt eller stå i oppvarmet rom. Stor risiko for frostskader på hytta.",
    coax: "Minimal frostfare – svært lite vannvolum, enkelt å tømme.",
  },
  {
    icon: Leaf,
    category: "Miljø",
    tank: "Høyere energibruk og mer vannsløsing mens du venter på varmt vann.",
    coax: "Lavt strømforbruk, mindre kaldt vann i avløpet – bedre for miljøet.",
  },
  {
    icon: Gauge,
    category: "Trykk og vannmengde",
    tank: "Godt trykk, men mengden er begrenset til det tanken inneholder.",
    coax: "Stabilt trykk og god mengde – ingen trykkfall selv med flere tappesteder.",
  },
  {
    icon: Thermometer,
    category: "Tappekomfort",
    tank: "Lang ventetid og kaldtvannskast før varmt vann kommer frem.",
    coax: "Rask responstid med stabil temperatur – minimale svingninger.",
  },
  {
    icon: Scale,
    category: "Skalerbarhet",
    tank: "Én stor enhet som må dimensjoneres for toppforbruk. Vanskelig å utvide.",
    coax: "Modulbasert – legg til flere enheter ved flere tappesteder etter behov.",
  },
  {
    icon: Volume2,
    category: "Støy",
    tank: "Klikkelyder og ekspansjonsstøy når vannet varmes opp i tanken.",
    coax: "Nær lydløs drift – ingen stor vannmasse som ekspanderer.",
  },
  {
    icon: ShieldCheck,
    category: "Sikkerhet",
    tank: "Risiko for lekkasje eller tankbrudd som kan forårsake store vannskader.",
    coax: "Ingen tank – ingen risiko for plutselig vannlekkasje eller brudd.",
  },
];

const keyStats = [
  { value: "24–34%", label: "Lavere energibruk", icon: Zap },
  { value: "95%", label: "Mindre plass", icon: Maximize2 },
  { value: "15–20", label: "År levetid", icon: Clock },
  { value: "∞", label: "Ubegrenset varmtvann", icon: Droplets },
];

export default function VsPage() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
          <div className="container mx-auto px-4 py-20 md:py-28 max-w-5xl relative">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASING_CURVE }}
              className="text-center"
            >
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
                Sammenligning
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
                COAX tankløs vannvarmer vs.{" "}
                <span className="text-muted-foreground">
                  tradisjonell tankbereder
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Se hvorfor over 1000 norske hjem har byttet til en smartere,
                mer effektiv og plassbesparende løsning
              </p>
            </m.div>

            {/* Key Stats */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: EASING_CURVE,
                delay: 0.2,
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto"
            >
              {keyStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="relative text-center p-5 rounded-xl bg-card border border-border shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl md:text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </m.div>
          </div>
        </section>

        {/* Comparison Cards Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionTitle
              title="Punkt for punkt – se forskjellen"
              text="En detaljert sammenligning av COAX og tradisjonell tankbereder på 16 viktige områder"
            />

            <div className="space-y-4">
              {categories.map((item, i) => {
                const Icon = item.icon;
                return (
                  <m.div
                    key={item.category}
                    initial={{ opacity: 0, y: ANIMATION_OFFSET_Y_SMALL }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: ANIMATION_DURATION,
                        ease: EASING_CURVE,
                        delay: (i % 4) * 0.05,
                      },
                    }}
                    viewport={{ once: true, margin: "-30px" }}
                    className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {item.category}
                      </h3>
                      {item.highlight && (
                        <Badge
                          variant="primary"
                          className="text-xs font-bold shrink-0"
                        >
                          {item.highlight}
                        </Badge>
                      )}
                    </div>

                    {/* Comparison content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0">
                      {/* COAX - the good */}
                      <div className="px-5 pb-5 pt-2 md:border-r md:border-border/50">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1">
                              COAX
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {item.coax}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tank - the old */}
                      <div className="px-5 pb-5 pt-2 bg-muted/30">
                        <div className="flex items-start gap-2.5">
                          <XCircle className="h-4.5 w-4.5 text-destructive/60 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                              Tankbereder
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.tank}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visual Size Comparison */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4 max-w-4xl">
            <SectionTitle
              title="Størrelsen taler for seg selv"
              text="Se den enorme forskjellen i fysisk størrelse mellom løsningene"
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASING_CURVE }}
              className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-16"
            >
              {/* Tank */}
              <div className="flex flex-col items-center">
                <div
                  className="relative rounded-2xl border-2 border-dashed border-destructive/30 bg-destructive/5 flex items-center justify-center"
                  style={{ width: 160, height: 200 }}
                >
                  <div className="text-center p-4">
                    <p className="text-sm font-semibold text-destructive/70">
                      Tankbereder
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      60 × 60 × 120 cm
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 font-medium">
                  432 liter volum
                </p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-col items-center pb-10">
                <ArrowRight className="h-8 w-8 text-primary animate-pulse" />
              </div>

              {/* COAX */}
              <div className="flex flex-col items-center">
                <div className="flex items-end" style={{ height: 200 }}>
                  <div
                    className="relative rounded-xl border-2 border-primary/40 bg-primary/10 flex items-center justify-center shadow-md"
                    style={{ width: 50, height: 60 }}
                  >
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-primary">COAX</p>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <p className="text-sm font-medium text-primary">
                    9 × 38 × 26 cm
                  </p>
                  <p className="text-xs text-muted-foreground">
                    0.9 liter volum
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASING_CURVE }}
              className="text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Klar for å oppgradere?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Beregn din besparelse eller få gratis rådgivning fra våre
                eksperter – uforpliktende og enkelt.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-md px-8 font-normal">
                  <Link href="/kalkulator">
                    <CalculatorIcon className="w-4 h-4" />
                    Beregn din besparelse
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-md font-normal px-8"
                >
                  <Link href="/kontakt">Få gratis råd</Link>
                </Button>
              </div>
            </m.div>
          </div>
        </section>
      </div>
    </LazyMotion>
  );
}
