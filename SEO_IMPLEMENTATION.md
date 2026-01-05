# SEO Implementation Guide

This document provides a comprehensive overview of how SEO (Search Engine Optimization) is implemented in the COAX project.

## Table of Contents

1. [Overview](#overview)
2. [Metadata Management](#metadata-management)
3. [Structured Data (JSON-LD)](#structured-data-json-ld)
4. [Sitemap Generation](#sitemap-generation)
5. [Robots.txt Configuration](#robotstxt-configuration)
6. [Open Graph & Social Media](#open-graph--social-media)
7. [Page-Specific SEO](#page-specific-seo)
8. [Analytics Integration](#analytics-integration)
9. [Accessibility & SEO](#accessibility--seo)
10. [Best Practices](#best-practices)

---

## Overview

The project uses **Next.js 14+ App Router** with the built-in `Metadata` API for SEO management. All SEO configurations are implemented at the server component level, ensuring proper server-side rendering and optimal search engine indexing.

**Key Technologies:**
- Next.js Metadata API
- JSON-LD structured data (Schema.org)
- Dynamic sitemap generation
- Google Analytics 4 (with consent management)

---

## Metadata Management

### Root Layout Metadata

The main SEO configuration is defined in `src/app/layout.tsx` using Next.js's `Metadata` type:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: defaultTitle,
  description: defaultDescription,
  keywords: [...],
  authors: [{ name: "COAX AS" }],
  creator: "COAX AS",
  publisher: "COAX AS",
  // ... additional configurations
}
```

**Key Features:**
- **metadataBase**: Base URL for all relative URLs (`https://coax.jonasanders1.com`)
- **Default title**: "COAX – Effektive tankløse vannvarmere"
- **Default description**: Optimized Norwegian description
- **Keywords**: Array of relevant Norwegian keywords
- **Format detection**: Disabled for email, address, and telephone to prevent auto-linking
- **Icons**: Favicon configuration for all platforms

### Site Configuration

The base URL is centralized in `src/config/site.ts`:

```typescript
export const siteUrl = "https://coax.jonasanders1.com";
```

This ensures consistent URL generation across the application.

---

## Structured Data (JSON-LD)

Structured data is implemented using JSON-LD format and rendered via the `StructuredData` component in `src/shared/components/common/StructuredData.tsx`.

### Global Schemas

**Organization Schema** (`OrganizationSchema`)
- Company information (COAX AS)
- Contact details (phone, email, address)
- Logo and URL
- Service area (Norway)

**WebSite Schema** (`WebSiteSchema`)
- Site name and description
- Search action configuration (points to `/faq?search={search_term_string}`)
- Publisher reference to Organization

These are rendered globally in the root layout:

```tsx
<StructuredData data={OrganizationSchema()} />
<StructuredData data={WebSiteSchema()} />
```

### Page-Specific Schemas

**FAQPage Schema** (`FAQPageSchema`)
- Used on the FAQ page (`/faq`)
- Maps all FAQ questions and answers
- Enables rich snippets in search results

**Product Schema**
- Implemented in `ProductDetailsClient.tsx`
- Includes product name, description, SKU, images, brand, and offers
- Dynamically generated based on product data from Firebase

**LocalBusiness Schema** (`LocalBusinessSchema`)
- Available for contact page (not currently used)
- Includes business hours, location, and contact information

**BreadcrumbList Schema** (`BreadcrumbListSchema`)
- Available for breadcrumb navigation (not currently used)

**Service Schema** (`ServiceSchema`)
- Available for service pages like calculator

**HowTo Schema** (`HowToSchema`)
- Available for instructional content

---

## Sitemap Generation

The sitemap is dynamically generated using Next.js's `sitemap.ts` file at `src/app/sitemap.ts`.

### Implementation

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return UNIQUE_ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
  }));
}
```

### Route Configuration

Routes are defined in `src/config/sitemapRoutes.json`:

```json
[
  "/produkter",
  "/velg-modell",
  "/faq",
  "/referanser",
  "/kalkulator",
  "/kontakt",
  "/personvern",
  "/produkter/multi-31",
  "/produkter/jne-3",
  // ... more product routes
]
```

**Features:**
- Automatic deduplication of routes
- All routes include the homepage (`/`)
- Product routes are manually added
- Last modified date is set to current date

**Access:** `https://coax.jonasanders1.com/sitemap.xml`

---

## Robots.txt Configuration

The robots.txt file is generated at `src/app/robots.ts`:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-coax-42901306604af29408bd13855d63d1df/",
          "/api/",
          "/takk",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

**Blocked Paths:**
- Admin panel (`/admin-coax-...`)
- API routes (`/api/`)
- Thank you page (`/takk`)

**Access:** `https://coax.jonasanders1.com/robots.txt`

---

## Open Graph & Social Media

### Open Graph Configuration

All pages include Open Graph metadata for social media sharing:

```typescript
openGraph: {
  title: defaultTitle,
  description: defaultDescription,
  url: siteUrl,
  type: "website",
  siteName: "COAX",
  locale: "nb_NO",
  images: [{
    url: `${siteUrl}/ogImage.png`,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "COAX – Effektive tankløse vannvarmere",
  }],
}
```

**Key Features:**
- Standard OG image: `/ogImage.png` (1200x630px)
- Norwegian locale (`nb_NO`)
- Product pages use product images when available
- All images are absolute URLs

### Twitter Cards

Twitter card configuration is included on all pages:

```typescript
twitter: {
  card: "summary_large_image",
  title: defaultTitle,
  description: defaultDescription,
  images: [`${siteUrl}/ogImage.png`],
  creator: "@coax",
}
```

**Card Type:** `summary_large_image` for optimal visual presentation

---

## Page-Specific SEO

### Static Pages

All major pages have dedicated metadata exports:

1. **Homepage** (`/`) - Uses root layout defaults
2. **Products** (`/produkter`) - Product listing page
3. **Product Details** (`/produkter/[id]`) - Dynamic metadata generation
4. **FAQ** (`/faq`) - FAQ-specific metadata
5. **Contact** (`/kontakt`) - Contact page metadata
6. **Calculator** (`/kalkulator`) - Calculator tool metadata
7. **References** (`/referanser`) - Customer references
8. **Model Selector** (`/velg-modell`) - Model selection tool
9. **Privacy** (`/personvern`) - Privacy policy

### Dynamic Metadata Generation

Product pages use `generateMetadata` function for dynamic SEO:

```typescript
export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductById(params.id);
  
  if (!product) {
    return {
      title: "COAX | Produkt ikke funnet",
      robots: { index: false, follow: false },
    };
  }
  
  return {
    title: `COAX | ${product.model}`,
    description: product.description?.slice(0, 155),
    // ... product-specific metadata
  };
}
```

**Features:**
- Fetches product data from Firebase
- Handles 404 cases with noindex metadata
- Uses product images for OG tags
- Generates product-specific keywords

### Canonical URLs

Every page includes a canonical URL to prevent duplicate content:

```typescript
alternates: {
  canonical: `${siteUrl}/produkter/${params.id}`,
}
```

**Implementation:**
- All pages have explicit canonical URLs
- Uses absolute URLs from `siteUrl` config
- Prevents duplicate content issues

---

## Analytics Integration

### Google Analytics 4

Google Analytics is integrated with consent management in `src/app/layout.tsx`:

```typescript
const MEASUREMENT_ID = "G-HC5YYERVLC";

// GA is disabled by default until consent
window['ga-disable-${MEASUREMENT_ID}'] = true;

gtag('config', '${MEASUREMENT_ID}', {
  'send_page_view': false,
  'anonymize_ip': true
});
```

**Features:**
- **Consent-based tracking**: Disabled until user consent
- **IP anonymization**: Enabled for privacy compliance
- **Page view tracking**: Controlled via consent
- **Cookie consent**: Managed by `CookieConsent` component

### Analytics Utilities

The `src/analytics/ga.ts` file provides:

- `initGA()`: Initialize GA after consent
- `disableGA()`: Disable tracking
- `logPageView()`: Track page views

**Usage:** Analytics only tracks after explicit user consent via cookie banner.

---

## Accessibility & SEO

### Semantic HTML

- Proper heading hierarchy (h1, h2, h3)
- Semantic HTML5 elements (`<main>`, `<section>`, `<article>`)
- Skip to main content link for keyboard navigation

### Language Configuration

- HTML lang attribute: `lang="nb"` (Norwegian Bokmål)
- Open Graph locale: `nb_NO`
- All content in Norwegian

### Image Optimization

- Next.js `Image` component for optimized images
- Alt text on all images
- Proper image dimensions for OG images

### Meta Tags

- Viewport configuration for mobile optimization
- Format detection disabled to prevent unwanted auto-linking
- Proper charset declaration

### Google Site Verification

Google Search Console verification is configured in the root `index.html` file:

```html
<meta
  name="google-site-verification"
  content="lhyWww0E7mLyxuCOHQ6JLeO9RsAsHes-Pd9rcbAbTA8"
/>
```

**Note:** The `index.html` file appears to be a legacy file from a previous build setup. In Next.js, this verification should ideally be moved to the root layout's metadata or added via a custom `<head>` section.

---

## Best Practices

### ✅ Implemented

1. **Server-Side Rendering**: All metadata is server-rendered
2. **Structured Data**: JSON-LD schemas for rich snippets
3. **Canonical URLs**: Every page has explicit canonical
4. **Mobile Optimization**: Responsive viewport configuration
5. **Social Sharing**: Complete OG and Twitter card metadata
6. **Sitemap**: Dynamic sitemap generation
7. **Robots.txt**: Proper crawl directives
8. **Consent Management**: GDPR-compliant analytics

### 🔄 Recommendations for Enhancement

1. **Dynamic Sitemap**: Consider generating product routes dynamically from Firebase
2. **Breadcrumbs**: Implement breadcrumb navigation with schema
3. **LocalBusiness Schema**: Add to contact page
4. **Product Reviews**: Add review schema if reviews are collected
5. **FAQ Schema**: Currently used, ensure all FAQs are included
6. **Image Sitemap**: Consider separate image sitemap for product images
7. **Hreflang Tags**: If expanding to other languages
8. **Structured Data Testing**: Regular validation via Google Rich Results Test

### 📊 SEO Checklist

- [x] Unique titles for all pages
- [x] Meta descriptions (155 characters or less)
- [x] Keywords meta tags
- [x] Open Graph tags
- [x] Twitter cards
- [x] Canonical URLs
- [x] Structured data (JSON-LD)
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Mobile-friendly viewport
- [x] Semantic HTML
- [x] Alt text on images
- [x] Language declaration
- [x] Analytics integration
- [x] Consent management

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root metadata & global SEO
│   ├── sitemap.ts              # Dynamic sitemap generation
│   ├── robots.ts               # Robots.txt configuration
│   ├── page.tsx                # Homepage
│   ├── produkter/
│   │   ├── page.tsx            # Products listing metadata
│   │   └── [id]/
│   │       └── page.tsx        # Dynamic product metadata
│   ├── faq/
│   │   └── page.tsx            # FAQ metadata
│   └── [other pages]/         # Page-specific metadata
├── config/
│   ├── site.ts                 # Site URL configuration
│   └── sitemapRoutes.json      # Sitemap route definitions
├── shared/
│   └── components/
│       └── common/
│           └── StructuredData.tsx  # JSON-LD component & schemas
└── analytics/
    └── ga.ts                   # Google Analytics utilities
```

---

## Testing & Validation

### Tools for Testing

1. **Google Search Console**: Monitor indexing and search performance
2. **Google Rich Results Test**: Validate structured data
3. **Facebook Sharing Debugger**: Test OG tags
4. **Twitter Card Validator**: Test Twitter cards
5. **Lighthouse**: SEO score and recommendations
6. **Schema.org Validator**: Validate JSON-LD schemas

### Common Issues to Check

- ✅ All pages return 200 status codes
- ✅ No duplicate content (canonical URLs working)
- ✅ Structured data validates without errors
- ✅ Images have proper alt text
- ✅ Mobile-friendly (viewport configured)
- ✅ Fast page load times
- ✅ Proper heading hierarchy

---

## Maintenance

### Regular Updates

1. **Sitemap Routes**: Update `sitemapRoutes.json` when adding new pages
2. **Product Metadata**: Automatically generated from Firebase
3. **Structured Data**: Update schemas when adding new content types
4. **OG Images**: Update when branding changes
5. **Analytics**: Monitor consent rates and tracking

### Monitoring

- Google Search Console for indexing issues
- Analytics for traffic patterns
- Page speed monitoring
- Mobile usability reports

---

## Conclusion

The COAX project implements a comprehensive SEO strategy using Next.js's built-in features and best practices. The implementation is server-side rendered, includes structured data for rich snippets, and follows modern SEO guidelines for optimal search engine visibility.

For questions or improvements, refer to the individual component files or consult the Next.js Metadata API documentation.

