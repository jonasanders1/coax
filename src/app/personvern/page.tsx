import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageTitle from "@/shared/components/common/PageTitle";
import CookieSettingsControls from "@/shared/components/common/CookieSettingsControls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cookieList } from "@/data/privacyData";

import { siteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "COAX | Personvern og cookies",
  description:
    "Les hvordan COAX bruker informasjonskapsler, hvordan GA4 håndteres, og hvordan du kan administrere samtykket ditt.",
  keywords: [
    "COAX personvern",
    "cookie policy",
    "personvernpolicy",
    "GDPR",
    "informasjonskapsler",
  ],
  alternates: { canonical: `${siteUrl}/personvern` },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "COAX | Personvern og cookies",
    description:
      "Les hvordan COAX bruker informasjonskapsler, hvordan GA4 håndteres, og hvordan du kan administrere samtykket ditt.",
    url: `${siteUrl}/personvern`,
    type: "website",
    siteName: "COAX",
    images: [
      {
        url: `${siteUrl}/ogImage.png`,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COAX | Personvern og cookies",
    description:
      "Les hvordan COAX bruker informasjonskapsler og hvordan du kan administrere samtykket ditt.",
    images: [`${siteUrl}/ogImage.png`],
  },
};

type SectionHeaderProps = {
  title: string;
  description?: ReactNode;
};

const SectionHeader = ({ title, description }: SectionHeaderProps) => (
  <div className="space-y-2">
    <h2 className="text-3xl font-semibold leading-tight text-foreground">
      {title}
    </h2>
    {description ? (
      <p className="text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
    ) : null}
  </div>
);

const PersonvernPage = () => {
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto max-w-6xl px-4 space-y-16 lg:space-y-20">
        <PageTitle
          title="Personvern og cookie-innstillinger"
          text="Vi tar personvern og datatrygghet på alvor. Her finner du all informasjonen om hvordan vi bruker informasjonskapsler og hvordan du styrer samtykket ditt."
        />

        <div className="space-y-16 lg:space-y-20">
          <section className="space-y-8 lg:space-y-10">
            <SectionHeader
              title="1. Velg hvordan vi kan bruke informasjonskapsler"
              description="Du styrer hvilke data vi kan samle inn. Panelene under forklarer forskjellen på nødvendige og valgfrie cookies, og gir deg mulighet til å endre eller tilbakestille samtykket ditt når som helst."
            />
            <CookieSettingsControls />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nødvendige cookies</CardTitle>
                  <CardDescription>Alltid aktivert</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Disse informasjonskapslene er nødvendige for at nettstedet
                    skal fungere riktig. De sørger for grunnleggende funksjoner
                    som navigasjon, sikkerhet og tilgjengelighet.
                  </p>
                  <p>
                    De kan ikke slås av fordi de er essensielle i henhold til
                    ekomloven § 3-15.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Analyse- og statistikk-cookies</CardTitle>
                  <CardDescription>Valgfritt samtykke</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>
                    Brukes for å forstå hvordan besøkende bruker nettstedet. Vi
                    benytter Google Analytics 4 for å samle anonymiserte data
                    som besøkte sider, varighet og enhetstype.
                  </p>
                  <p>
                    Disse aktiveres kun dersom du gir samtykke via
                    cookie-banneret.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <SectionHeader
              title="2. Hvordan vi bruker Google Analytics 4"
              description="Dette er informasjonen vi samler inn, hvordan den lagres, og hvilke rettigheter du har når det gjelder analyseverktøyet vårt."
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Data som samles inn</CardTitle>
                  <CardDescription>Kun ved aktivt samtykke</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Hvilke sider som besøkes</li>
                    <li>Tidspunkt for besøk</li>
                    <li>Interaksjoner på siden</li>
                    <li>Enhetstype, nettleser og operativsystem</li>
                    <li>Anonymisert IP-adresse (maskert automatisk i GA4)</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rettlig grunnlag</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-3">
                  <p>
                    Analyseverktøyet brukes kun dersom du har gitt samtykke i
                    cookie-banneret. Dette er i tråd med personopplysningsloven
                    og ekomloven § 3-15.
                  </p>
                  <p>
                    Du kan når som helst endre eller trekke samtykket ditt
                    tilbake ved å bruke kontrollene over.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Lagring og overføring</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-3">
                  <p>
                    Data lagres i Google Analytics i 2 eller 14 måneder,
                    avhengig av våre innstillinger.
                  </p>
                  <p>
                    Google kan behandle data i EU og i enkelte tilfeller i USA.
                    Google er sertifisert under EU–US Data Privacy Framework.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tilbaketrekking av samtykke</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Når du trekker samtykket ditt tilbake, vil Google Analytics
                  slutte å samle inn data fra ditt besøk. Bruk knappene over for
                  å endre valget ditt når som helst.
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <SectionHeader
              title="4. Grunnleggende om informasjonskapsler"
              description="Litt bakgrunnsinformasjon dersom du vil vite mer før du tar et valg."
            />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hva er en cookie?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  En informasjonskapsel er en liten tekstfil som lagres på
                  enheten din når du besøker et nettsted. Den inneholder anonym
                  informasjon som gjør at nettstedet kan gjenkjenne enheten din.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Hvorfor bruker vi cookies?</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Sikre at nettsiden fungerer</li>
                    <li>Forbedre brukeropplevelsen</li>
                    <li>Analysere trafikk og bruksmønstre</li>
                    <li>Tilpasse tjenester</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Sist oppdatert: November 2025
        </p>
      </div>
    </div>
  );
};

export default PersonvernPage;
