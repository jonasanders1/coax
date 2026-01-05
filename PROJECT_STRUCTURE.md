# Project Structure

This document provides a high-level overview of the COAX project's folder and file structure.

## Root Directory

```
coax/
├── 📁 public/                    # Static assets served directly
├── 📁 src/                       # Source code
├── 📁 scripts/                   # Build and utility scripts
├── 📁 rules/                    # Firebase security rules
├── 📁 dist/                     # Build output (legacy)
├── 📁 logs/                     # Chat log files
├── 📁 node_modules/             # Dependencies
│
├── 📄 package.json              # Project dependencies and scripts
├── 📄 package-lock.json         # Locked dependency versions
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 next.config.mjs           # Next.js configuration
├── 📄 tailwind.config.ts        # Tailwind CSS configuration
├── 📄 postcss.config.js         # PostCSS configuration
├── 📄 eslint.config.js          # ESLint configuration
├── 📄 components.json           # shadcn/ui components config
├── 📄 vercel.json               # Vercel deployment config
├── 📄 next-env.d.ts             # Next.js TypeScript definitions
│
├── 📄 index.html                # Legacy HTML entry (from previous build)
├── 📄 README.md                 # Project documentation
├── 📄 SEO_IMPLEMENTATION.md     # SEO implementation guide
├── 📄 CLIENT_IMPLEMENTATION_GUIDE.md
├── 📄 CLIENT_INTEGRATION.md
├── 📄 DESIGN_REVIEW.md
└── 📄 produkter.md              # Product documentation
```

---

## 📁 public/

Static assets served at the root URL path.

```
public/
├── favicon.ico                  # Favicon (ICO format)
├── favicon.png                  # Favicon (PNG format)
├── ogImage.png                  # Open Graph image (1200x630px)
└── reference-images/           # Customer reference images
    ├── ref1.webp
    ├── ref2.webp
    ├── ref3.webp
    ├── ref4.webp
    ├── ref5.webp
    ├── ref6.webp
    ├── ref7.jpeg
    ├── ref8.webp
    └── ref9.webp
```

---

## 📁 src/

Main source code directory following Next.js App Router structure.

### 📁 src/app/

Next.js App Router pages and routes. Each folder represents a route.

```
src/app/
├── layout.tsx                    # Root layout with global metadata & providers
├── page.tsx                      # Homepage (/) - client component
├── providers.tsx                 # React context providers wrapper
├── globals.css                   # Global styles and CSS variables
├── not-found.tsx                # 404 error page
├── robots.ts                     # Dynamic robots.txt generation
├── sitemap.ts                    # Dynamic sitemap.xml generation
│
├── 📁 admin-coax-42901306604af29408bd13855d63d1df/  # Admin panel (protected)
│   ├── page.tsx
│   ├── AdminClient.tsx
│   └── AdminClientWrapper.tsx
│
├── 📁 api/                      # API routes
│   └── log-chat/
│       └── route.ts             # Chat logging endpoint
│
├── 📁 faq/                      # FAQ page (/faq)
│   ├── page.tsx                 # Server component with metadata
│   └── FAQClient.tsx            # Client component
│
├── 📁 kalkulator/               # Calculator pages (/kalkulator)
│   ├── page.tsx                 # Main calculator
│   ├── innstillinger/
│   │   └── page.tsx             # Calculator settings
│   └── detaljer/
│       └── page.tsx             # Calculation details
│
├── 📁 kontakt/                  # Contact page (/kontakt)
│   └── page.tsx
│
├── 📁 personvern/               # Privacy policy (/personvern)
│   └── page.tsx
│
├── 📁 produkter/                # Products pages (/produkter)
│   ├── page.tsx                 # Products listing
│   ├── ProductsClient.tsx       # Products client component
│   └── [id]/                    # Dynamic product detail pages
│       ├── page.tsx             # Server component with metadata
│       ├── ProductDetailsClient.tsx
│       └── not-found.tsx        # Product 404 page
│
├── 📁 referanser/               # References page (/referanser)
│   ├── page.tsx
│   └── ReferencesClient.tsx
│
├── 📁 takk/                     # Thank you page (/takk)
│   ├── page.tsx
│   └── ThanksClient.tsx
│
└── 📁 velg-modell/              # Model selector page (/velg-modell)
    └── page.tsx
```

### 📁 src/features/

Feature-based modules organized by domain. Each feature is self-contained with components, hooks, lib, and data.

```
src/features/
│
├── 📁 admin/                     # Admin panel feature
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── ArrayField.tsx
│   │   ├── FaqForm.tsx
│   │   ├── ImageUpload.tsx
│   │   └── ProductForm.tsx
│   ├── hooks/
│   │   └── useAdminAuth.tsx
│   └── lib/
│       ├── faqs.ts
│       ├── products.ts
│       └── storage.ts
│
├── 📁 calculator/               # Energy calculator feature
│   ├── components/
│   │   ├── AdvancedParametersClient.tsx
│   │   ├── CalculationDetailsClient.tsx
│   │   ├── CalculatorClient.tsx
│   │   ├── ComparisonCard.tsx
│   │   ├── MunicipalitySelect.tsx
│   │   └── ParameterBadge.tsx
│   ├── data/
│   │   └── calculator-description.ts
│   └── lib/
│       └── calculator.ts
│
├── 📁 chatbot/                  # AI chatbot feature
│   ├── components/
│   │   ├── Chatbot3.tsx
│   │   └── CtaSection.tsx
│   └── hooks/
│       ├── useChatBot.tsx
│       └── useCustomChat.ts
│
├── 📁 contact/                  # Contact form feature
│   ├── components/
│   │   ├── ContactClient.tsx
│   │   ├── ContactFields.tsx
│   │   ├── ContactForm.tsx
│   │   ├── FilterSelect.tsx
│   │   ├── NeedsAssessmentForm.tsx
│   │   └── NeedsAssessmentFormHeader.tsx
│   └── utils/
│       └── formSubmission.ts
│
├── 📁 faq/                      # FAQ feature
│   ├── components/
│   │   ├── FaqItemSkeleton.tsx
│   │   └── FaqListSkeleton.tsx
│   └── lib/
│       └── faqs.ts
│
├── 📁 home/                     # Homepage feature components
│   ├── components/
│   │   ├── ComparisonCard.tsx
│   │   └── HowItWorksStep.tsx
│   └── data/
│       └── homeData.ts
│
├── 📁 model-selector/           # Model selection feature (Bøttemetoden)
│   ├── components/
│   │   └── ModelSelectorClient.tsx
│   ├── constants/
│   │   └── modelSelector.ts
│   ├── data/
│   │   └── modelSelectorData.ts
│   └── utils/
│       └── modelSelectorUtils.ts
│
└── 📁 products/                 # Products feature
    ├── components/
    │   ├── ProductCard.tsx
    │   ├── ProductCardSceleton.tsx
    │   ├── ProductImageGallery.tsx
    │   ├── ProductsList.tsx
    │   └── ProductsListSceleton.tsx
    ├── lib/
    │   └── products.ts
    └── utils/
        └── productUtils.ts
```

### 📁 src/shared/

Shared components, utilities, and types used across the application.

```
src/shared/
│
├── 📁 components/               # Reusable UI components
│   ├── 📁 common/               # Common/shared components
│   │   ├── CookieConsent.tsx
│   │   ├── CookieSettingsControls.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── MainContentWrapper.tsx
│   │   ├── PageTitle.tsx
│   │   ├── ScrollUp.tsx
│   │   ├── scrollUp.module.css
│   │   ├── SectionTitle.tsx
│   │   ├── StructuredData.tsx   # JSON-LD structured data
│   │   └── theme-provider.tsx
│   │
│   ├── 📁 layout/               # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Logo.tsx
│   │
│   └── 📁 ui/                   # shadcn/ui component library (39 files)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chat-message.tsx
│       ├── chat.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── copy-button.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── file-preview.tsx
│       ├── input.tsx
│       ├── interrupt-prompt.tsx
│       ├── label.tsx
│       ├── loading.tsx
│       ├── markdown-renderer.tsx
│       ├── message-input.tsx
│       ├── message-list.tsx
│       ├── popover.tsx
│       ├── prompt-suggestions.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── tooltip.tsx
│       └── typing-indicator.tsx
│
├── 📁 context/                   # React context providers
│   └── AppContext.tsx           # Global app state (products, FAQs, etc.)
│
├── 📁 hooks/                     # Shared React hooks
│   ├── use-toast.ts
│   └── useTheme.ts
│
├── 📁 lib/                       # Shared libraries and utilities
│   ├── api.ts                    # API client and utilities
│   ├── audio-utils.ts
│   ├── storage.ts                # Local storage utilities
│   └── utils.ts                  # General utility functions
│
├── 📁 types/                     # TypeScript type definitions
│   ├── chat.ts
│   ├── faq.ts
│   └── product.ts
│
└── 📁 utils/                     # Utility functions
    └── inputValidation.ts
```

### 📁 src/ (Other Directories)

```
src/
│
├── 📁 analytics/                 # Analytics integration
│   └── ga.ts                     # Google Analytics utilities
│
├── 📁 assets/                    # Image assets (imported in code)
│   ├── cabin-water-heater.png
│   ├── hero-water-heater-2.png
│   ├── hero-water-heater.png
│   ├── home-water-heater.webp
│   ├── industrial-water-heater.png
│   └── technology.webp
│
├── 📁 config/                    # Configuration files
│   ├── needsAssessmentConfig.ts
│   ├── site.ts                   # Site URL and config
│   └── sitemapRoutes.json        # Sitemap route definitions
│
├── 📁 constants/                 # Application constants
│   ├── animations.ts             # Animation timing constants
│   └── carousel.ts               # Carousel configuration
│
├── 📁 data/                      # Static data files
│   ├── comparisonData.ts
│   ├── faq.ts
│   ├── privacyData.ts
│   └── references.ts
│
├── 📁 hooks/                     # Global React hooks
│   ├── use-auto-scroll.ts
│   ├── use-autosize-textarea.ts
│   ├── use-copy-to-clipboard.ts
│   ├── use-mobile.tsx
│   ├── useConversationId.ts
│   ├── useCookieConsent.ts
│   └── useFormInput.ts
│
├── 📁 lib/                       # Global libraries
│   └── audio-utils.ts
│
├── 📁 pages-for-later/           # Unused/deprecated pages
│   └── coax-vs-tank/
│       └── page.tsx
│
├── 📁 store/                     # Global state management
│   └── appStore.ts               # Zustand store (if used)
│
├── firebaseConfig.ts             # Firebase configuration
├── navItems.ts                   # Navigation items configuration
└── product-details.json          # Legacy product data (if used)
```

---

## 📁 scripts/

Build and utility scripts.

```
scripts/
├── generateSitemapRoutes.ts      # Generates sitemapRoutes.json
└── ingestFaqs.ts                 # FAQ data ingestion script
```

---

## 📁 rules/

Firebase security rules and configuration.

```
rules/
├── firebase.json                  # Firebase project configuration
├── firestore.indexes.json        # Firestore index definitions
├── firestore.rules               # Firestore security rules
└── storage.rules                 # Firebase Storage security rules
```

---

## 📁 logs/

Chat conversation logs (generated at runtime).

```
logs/
└── chat-log-*.json               # Timestamped chat log files
```

---

## 📁 dist/

Legacy build output directory (from previous Vite build setup).

```
dist/
└── assets/
    ├── cabin-water-heater-C0ToCyyX.png
    ├── hero-water-heater-D8ZotwU_.jpg
    ├── home-water-heater-Bqw1xVyn.png
    ├── industrial-water-heater-Ebd5yvzy.png
    ├── reference-1-BMNrzPsk.webp
    ├── reference-2-CwYppgRL.webp
    ├── reference-3-CJemLZvI.webp
    └── vite.svg
```

---

## Architecture Overview

### Directory Organization Principles

1. **Feature-Based Structure** (`src/features/`)
   - Each feature is self-contained
   - Contains components, hooks, lib, and data specific to that feature
   - Promotes code reusability and maintainability

2. **Shared Resources** (`src/shared/`)
   - Reusable components, utilities, and types
   - UI component library (shadcn/ui)
   - Common business logic

3. **Next.js App Router** (`src/app/`)
   - File-based routing
   - Server and client components separation
   - Route-specific metadata

4. **Configuration** (`src/config/`)
   - Centralized configuration files
   - Site URLs, routes, and settings

### Key Patterns

- **Server Components by Default**: Pages are server components with metadata
- **Client Components When Needed**: Interactive components marked with `"use client"`
- **Feature Modules**: Self-contained features in `src/features/`
- **Shared UI Library**: shadcn/ui components in `src/shared/components/ui/`
- **Type Safety**: TypeScript types in `src/shared/types/` and feature-specific types

### Build Process

1. **Pre-build**: `generateSitemapRoutes.ts` runs to update sitemap routes
2. **Build**: Next.js compiles and optimizes the application
3. **Output**: Static and dynamic pages generated in `.next/` directory

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Utilities**: camelCase (e.g., `productUtils.ts`)
- **Types**: camelCase with `.ts` extension (e.g., `product.ts`)
- **Constants**: camelCase (e.g., `animations.ts`)
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **API Routes**: `route.ts` (Next.js convention)

---

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + Zustand (if used)
- **Backend**: Firebase (Firestore, Storage)
- **Analytics**: Google Analytics 4
- **Deployment**: Vercel

---

## Notes

- The `dist/` folder appears to be from a previous Vite build setup and may be legacy
- The `index.html` file is also from the previous setup
- `pages-for-later/` contains unused/deprecated pages
- Chat logs are stored in `logs/` directory (may want to exclude from git)
- Firebase rules are in `rules/` directory (should be deployed separately)

