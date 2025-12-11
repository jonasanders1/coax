"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { disableGA, initGA, logPageView } from "@/analytics/ga";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";

export interface ConsentPreferences {
  chatbot: boolean;
  ga4: boolean;
}

type ConsentState = "unknown" | ConsentPreferences;

export const STORAGE_KEY = "coax-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "coax-open-cookie-settings";
export const COOKIE_STATUS_EVENT = "coax-cookie-status-changed";

const buildPathWithSearch = (
  pathname: string | null,
  searchParams: ReturnType<typeof useSearchParams>
) => {
  if (!pathname) return null;
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
};

export const CookieConsent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [consent, setConsent] = useState<ConsentState>("unknown");
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    chatbot: false,
    ga4: false,
  });
  const [gaReady, setGaReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  // Load consent from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Try to parse as new format (ConsentPreferences)
        try {
          const parsed = JSON.parse(stored) as ConsentPreferences;
          if (typeof parsed === "object" && "chatbot" in parsed && "ga4" in parsed) {
            setPreferences(parsed);
            setConsent(parsed);
            return;
          }
        } catch {
          // Not JSON, might be old format
        }
        // Check for old format ("accepted" | "rejected")
        if (stored === "accepted") {
          // Migrate old "accepted" to new format
          const migrated: ConsentPreferences = { chatbot: true, ga4: true };
          setPreferences(migrated);
          setConsent(migrated);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return;
        }
        if (stored === "rejected") {
          // Migrate old "rejected" to new format
          const migrated: ConsentPreferences = { chatbot: false, ga4: false };
          setPreferences(migrated);
          setConsent(migrated);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return;
        }
      }
    } catch (error) {
      console.warn("Failed to read cookie consent:", error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = () => {
      // Always show details and force open when event is received
      setShowDetails(true);
      setForceOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpen);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpen);
  }, []);

  const enableTracking = useCallback(() => {
    initGA();
    setGaReady(true);
  }, []);

  const disableTracking = useCallback(() => {
    disableGA();
    setGaReady(false);
  }, []);

  // Handle GA4 consent changes
  useEffect(() => {
    if (!hydrated) return;
    if (typeof consent === "object" && consent.ga4 && !gaReady) {
      enableTracking();
    }
    if ((typeof consent === "object" && !consent.ga4) || consent === "unknown") {
      if (gaReady) {
        disableTracking();
      }
    }
  }, [consent, enableTracking, disableTracking, gaReady, hydrated]);

  const pagePath = useMemo(
    () => buildPathWithSearch(pathname, searchParams),
    [pathname, searchParams]
  );

  useEffect(() => {
    if (gaReady && typeof consent === "object" && consent.ga4 && pagePath) {
      logPageView(pagePath);
    }
  }, [consent, gaReady, pagePath]);

  const notifyStatusChange = (value: ConsentPreferences) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent<ConsentPreferences>(COOKIE_STATUS_EVENT, { detail: value })
    );
  };

  const storeConsent = (value: ConsentPreferences) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    setConsent(value);
    setPreferences(value);
    setForceOpen(false);
    setShowDetails(false);
    notifyStatusChange(value);
  };

  const handleAccept = () => {
    storeConsent({ chatbot: true, ga4: true });
  };

  const handleReject = () => {
    storeConsent({ chatbot: false, ga4: false });
  };

  const handlePreferenceChange = (key: keyof ConsentPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    storeConsent(newPreferences);
  };

  const toggleDetails = () => setShowDetails((prev) => !prev);

  const closeOverlay = () => {
    setForceOpen(false);
    if (consent !== "unknown") {
      setShowDetails(false);
    }
  };

  if (!hydrated) {
    return null;
  }

  const shouldShow = consent === "unknown" || forceOpen;

  // Always render the component (even if hidden) so event listeners stay active
  // Hide with CSS instead of returning null to keep event listeners mounted
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center px-4 transition-opacity duration-200",
        !shouldShow ? "pointer-events-none opacity-0 invisible" : "opacity-100 visible"
      )}
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-hidden
        onClick={consent === "unknown" ? undefined : closeOverlay}
      />
      <div className="relative z-10 w-full max-w-2xl space-y-4 rounded-xl border border-primary/20 bg-background p-6 shadow-2xl">
        <div>
          <p className="text-sm md:text-lg font-semibold uppercase tracking-wide text-primary">
            Vi bruker cookies
          </p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Vi bruker informasjonskapsler for å få innsikt i hvordan nettstedet
            brukes og for å forbedre tjenestene våre. Meldinger du sender til
            vår chatbot behandles av en AI-tjeneste hos AWS i USA for å generere
            svar. Du kan velge om du tillater analyse-cookies eller kun de som
            er nødvendige for at nettsiden skal fungere.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-start">
          <Button onClick={handleAccept}>Aksepter alle cookies</Button>
          <Button variant="outline" onClick={toggleDetails}>
            Tilpass innstillinger
          </Button>
        </div>
        {showDetails ? (
          <div className="space-y-4 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold">Dine valg om informasjonskapsler</p>
            <p>
              Vi bruker informasjonskapsler (cookies) og lignende teknologier
              for å levere og forbedre tjenestene våre. Du kan velge hvilke
              tjenester du tillater nedenfor.
            </p>

            {/* Chatbot Switch */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background p-4">
              <div className="flex-1 space-y-1 pr-4">
                <Label htmlFor="chatbot-consent" className="text-base font-medium text-foreground cursor-pointer">
                  Tillat Chatbot
                </Label>
                <p className="text-xs text-muted-foreground">
                  Meldinger behandles av en AI-tjeneste hos AWS i USA (us-east-1) og lagres anonymt i opptil 90 dager for kvalitetskontroll.{" "}
                  <Link href="/personvern" className="text-primary underline">
                    Les mer
                  </Link>
                </p>
              </div>
              <Switch
                id="chatbot-consent"
                checked={preferences.chatbot}
                onCheckedChange={(checked) => handlePreferenceChange("chatbot", checked)}
              />
            </div>

            {/* GA4 Switch */}
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background p-4">
              <div className="flex-1 space-y-1 pr-4">
                <Label htmlFor="ga4-consent" className="text-base font-medium text-foreground cursor-pointer">
                  Tillat Google Analytics 4
                </Label>
                <p className="text-xs text-muted-foreground">
                  Brukes for å forstå hvordan besøkende bruker nettstedet. Data anonymiseres automatisk.{" "}
                  <Link href="/personvern" className="text-primary underline">
                    Les mer
                  </Link>
                </p>
              </div>
              <Switch
                id="ga4-consent"
                checked={preferences.ga4}
                onCheckedChange={(checked) => handlePreferenceChange("ga4", checked)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-start pt-2">
              <Button onClick={handleReject} variant="outline">
                Avslå alle
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CookieConsent;
