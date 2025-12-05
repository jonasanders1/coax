import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollUp from "@/components/ScrollUp";
// import ChatBot from "@/components/chatbot/ChatBot";
import CookieConsent from "@/components/CookieConsent";
import { siteUrl } from "@/config/site";
import {
  StructuredData,
  OrganizationSchema,
  WebSiteSchema,
} from "@/components/StructuredData";

const defaultTitle = "COAX – Effektive tankløse vannvarmere";
const defaultDescription =
  "Opplev kompakte, energieffektive vannvarmere fra COAX – umiddelbar varmtvann uten tank. Ideelt for bolig, hytte og industri.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  keywords: [
    "COAX",
    "direkte vannvarmer",
    "tankløs vannvarmer",
    "elektrisk vannvarmer",
    "varmtvannsbereder",
    "energieffektiv vannvarmer",
    "varmtvann uten tank",
    "COAX vannvarmere",
    "tankløs varmtvannsbereder",
    "elektrisk varmtvann",
  ],
  authors: [{ name: "COAX AS" }],
  creator: "COAX AS",
  publisher: "COAX AS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    type: "website",
    siteName: "COAX",
    locale: "nb_NO",
    images: [
      {
        url: `${siteUrl}/ogImage.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "COAX – Effektive tankløse vannvarmere",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [`${siteUrl}/ogImage.png`],
    creator: "@coax",
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const MEASUREMENT_ID = "G-HC5YYERVLC";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body>
        {/* Google Analytics 4 - gtag.js script for compatibility with Google Tag Assistant */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${MEASUREMENT_ID}', {
              'send_page_view': false,
              'anonymize_ip': true
            });
            // Disable GA until consent is given
            window['ga-disable-${MEASUREMENT_ID}'] = true;
          `}
        </Script>
        <StructuredData data={OrganizationSchema()} />
        <StructuredData data={WebSiteSchema()} />
        <Providers>
          <div className="min-h-screen">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Hopp til hovedinnhold
            </a>
            <Header />
            <main id="main-content" tabIndex={-1}>{children}</main>
            <Footer />
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end justify-end">
              <ScrollUp />
              {/* <ChatBot /> */}
            </div>
            <Suspense fallback={null}>
              <CookieConsent />
            </Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
