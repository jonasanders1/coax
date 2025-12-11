import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import ScrollUp from "@/shared/components/common/ScrollUp";
import  {ChatDemo } from "@/features/chatbot/components/Chatbot3";
import CookieConsent from "@/shared/components/common/CookieConsent";
import { MainContentWrapper } from "@/shared/components/common/MainContentWrapper";
import { siteUrl } from "@/config/site";
import {
  StructuredData,
  OrganizationSchema,
  WebSiteSchema,
} from "@/shared/components/common/StructuredData";

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

// Viewport configuration to prevent zoom on input focus (mobile)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow pinch zoom but prevent auto-zoom on input focus
  userScalable: true,
};

const MEASUREMENT_ID = "G-HC5YYERVLC";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('coax-ui-theme') || 'system';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const resolvedTheme = theme === 'system' ? systemTheme : theme;
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolvedTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
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
            // Disable GA until consent is given
            window['ga-disable-${MEASUREMENT_ID}'] = true;
            // Configure gtag but don't send page_view yet (will be sent after consent)
            gtag('config', '${MEASUREMENT_ID}', {
              'send_page_view': false,
              'anonymize_ip': true
            });
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
            <main id="main-content" tabIndex={-1}>
              <MainContentWrapper>{children}</MainContentWrapper>
            </main>
            <Footer />
            <div className="fixed bottom-6 right-3 md:right-6 z-50 flex flex-col gap-2 items-end justify-end">
              <ScrollUp />
              <ChatDemo />
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
