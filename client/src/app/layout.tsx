import type { Metadata } from "next";
import { Suspense } from "react";
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
    images: [
      {
        url: "/ogImage.png",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/ogImage.png"],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <body>
        <StructuredData data={OrganizationSchema()} />
        <StructuredData data={WebSiteSchema()} />
        <Providers>
          <div className="min-h-screen">
            <Header />
            <main>{children}</main>
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

