"use client";

import { useMemo } from "react";
import { siteUrl } from "@/config/site";

interface StructuredDataProps {
  data: object | object[];
}

/**
 * Component to render JSON-LD structured data
 * Usage: <StructuredData data={schemaObject} />
 */
export function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = useMemo(() => {
    return JSON.stringify(data, null, 0);
  }, [data]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

/**
 * Organization schema for COAX
 */
export function OrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: "COAX AS",
    url: siteUrl,
    logo: `${siteUrl}/ogImage.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+47-977-32-838",
      contactType: "customer service",
      email: "post@coax.no",
      areaServed: "NO",
      availableLanguage: ["Norwegian", "nb"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Grønnliveien 13",
      addressLocality: "Åros",
      postalCode: "3474",
      addressCountry: "NO",
    },
    sameAs: [],
  };
}

/**
 * WebSite schema with search action
 */
export function WebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: "COAX",
    url: siteUrl,
    description:
      "COAX leverer energieffektive, tankløse vannvarmere for boliger, hytter og industri.",
    image: `${siteUrl}/ogImage.png`,
    logo: `${siteUrl}/ogImage.png`,
    publisher: {
      "@id": `${siteUrl}#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/faq?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * LocalBusiness schema for contact page
 */
export function LocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/kontakt#localbusiness`,
    name: "COAX AS",
    url: `${siteUrl}/kontakt`,
    image: `${siteUrl}/ogImage.png`,
    telephone: "+47-977-32-838",
    email: "post@coax.no",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Grønnliveien 13",
      addressLocality: "Åros",
      postalCode: "3474",
      addressCountry: "NO",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Add coordinates if available
      // latitude: "59.1234",
      // longitude: "10.5678",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "16:00",
      },
    ],
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "Norway",
    },
    sameAs: [],
  };
}

/**
 * FAQPage schema
 */
export function FAQPageSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/faq#faqpage`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * BreadcrumbList schema
 */
export function BreadcrumbListSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${items[items.length - 1]?.url || siteUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Service schema for calculator/service pages
 */
export function ServiceSchema({
  name,
  description,
  url,
  provider,
}: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    provider: provider || {
      "@id": `${siteUrl}#organization`,
    },
    areaServed: {
      "@type": "Country",
      name: "Norway",
    },
    serviceType: "Instant Water Heater Consultation",
    category: "Tankless Water Heaters",
  };
}

/**
 * HowTo schema for instructional content
 */
export function HowToSchema({
  name,
  description,
  steps,
  url,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  url?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": url ? `${url}#howto` : `${siteUrl}#howto`,
    name,
    description,
    ...(url && { url }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}
