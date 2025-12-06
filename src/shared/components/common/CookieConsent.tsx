"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { disableGA, initGA, logPageView } from "@/analytics/ga";
import Link from "next/link";

type ConsentState = "unknown" | "accepted" | "rejected";

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
  const [gaReady, setGaReady] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(
      STORAGE_KEY
    ) as ConsentState | null;
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOpen = () => {
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

  useEffect(() => {
    if (!hydrated) return;
    if (consent === "accepted" && !gaReady) {
      enableTracking();
    }
    if (consent === "rejected" && gaReady) {
      disableTracking();
    }
  }, [consent, enableTracking, disableTracking, gaReady, hydrated]);

  const pagePath = useMemo(
    () => buildPathWithSearch(pathname, searchParams),
    [pathname, searchParams]
  );

  useEffect(() => {
    if (gaReady && consent === "accepted" && pagePath) {
      logPageView(pagePath);
    }
  }, [consent, gaReady, pagePath]);

  const notifyStatusChange = (value: ConsentState) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent<ConsentState>(COOKIE_STATUS_EVENT, { detail: value })
    );
  };

  const storeConsent = (value: ConsentState) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
    setForceOpen(false);
    setShowDetails(false);
    notifyStatusChange(value);
  };

  const handleAccept = () => {
    storeConsent("accepted");
  };

  const handleReject = () => {
    storeConsent("rejected");
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

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
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
            brukes og for å forbedre tjenestene våre. Du kan velge om du
            tillater analyse-cookies eller kun de som er nødvendige for at
            nettsiden skal fungere.
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
              for å levere og forbedre tjenestene våre. Enkelte cookies er
              nødvendige for at nettstedet skal fungere, mens andre brukes til
              statistikk og analyse ved hjelp av Google Analytics 4.
            </p>
            <p>
              Analyse-cookies settes kun hvis du gir ditt samtykke. Du kan når
              som helst endre eller trekke tilbake samtykke.
            </p>

            <Button onClick={handleReject}>
              Avslå / bruk kun nødvendige cookies
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CookieConsent;
