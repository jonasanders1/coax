"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import Link from "next/link";
import {
  COOKIE_STATUS_EVENT,
  STORAGE_KEY,
  type ConsentPreferences,
} from "@/shared/components/common/CookieConsent";
import { disableGA, initGA } from "@/analytics/ga";
import { toast } from "@/shared/components/ui/sonner";

const getStatusLabel = (preferences: ConsentPreferences | null): string => {
  if (!preferences) return "Ikke valgt ennå";
  if (preferences.chatbot && preferences.ga4) {
    return "Alle cookies er aktivert";
  }
  if (preferences.chatbot || preferences.ga4) {
    const parts: string[] = [];
    if (preferences.chatbot) parts.push("Chatbot");
    if (preferences.ga4) parts.push("GA4");
    return `${parts.join(" og ")} er aktivert`;
  }
  return "Kun nødvendige cookies er i bruk";
};

const CookieSettingsControls = () => {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readStatus = () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          // Try to parse as new format
          try {
            const parsed = JSON.parse(stored) as ConsentPreferences;
            if (
              typeof parsed === "object" &&
              "chatbot" in parsed &&
              "ga4" in parsed
            ) {
              setPreferences(parsed);
              return;
            }
          } catch {
            // Not JSON, might be old format
          }
          // Check for old format
          if (stored === "accepted") {
            setPreferences({ chatbot: true, ga4: true });
            return;
          }
          if (stored === "rejected") {
            setPreferences({ chatbot: false, ga4: false });
            return;
          }
        }
        setPreferences(null);
      } catch (error) {
        console.warn("Failed to read cookie consent:", error);
        setPreferences(null);
      }
    };

    readStatus();

    const handleStatusChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      if (
        detail &&
        typeof detail === "object" &&
        "chatbot" in detail &&
        "ga4" in detail
      ) {
        setPreferences(detail);
      } else {
        readStatus();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        readStatus();
      }
    };

    window.addEventListener(
      COOKIE_STATUS_EVENT,
      handleStatusChange as EventListener
    );
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        COOKIE_STATUS_EVENT,
        handleStatusChange as EventListener
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const storeConsent = (value: ConsentPreferences) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      setPreferences(value);

      // Dispatch event to notify other components
      window.dispatchEvent(
        new CustomEvent<ConsentPreferences>(COOKIE_STATUS_EVENT, {
          detail: value,
        })
      );

      // Handle GA4 consent changes
      if (value.ga4) {
        initGA();
      } else {
        disableGA();
      }
    } catch (error) {
      console.warn("Failed to store cookie consent:", error);
    }
  };

  const handlePreferenceChange = (
    key: keyof ConsentPreferences,
    value: boolean
  ) => {
    if (!preferences) {
      // Initialize with default values if preferences are null
      const newPreferences: ConsentPreferences = {
        chatbot: false,
        ga4: false,
        [key]: value,
      };
      storeConsent(newPreferences);

      // Show toast based on what was changed
      if (key === "chatbot") {
        toast.success(
          value
            ? "Chatbot-tjenesten er nå aktivert"
            : "Chatbot-tjenesten er nå deaktivert"
        );
      } else if (key === "ga4") {
        toast.success(
          value
            ? "Google Analytics 4 er nå aktivert"
            : "Google Analytics 4 er nå deaktivert"
        );
      }
    } else {
      const newPreferences = { ...preferences, [key]: value };
      storeConsent(newPreferences);

      // Show toast based on what was changed
      if (key === "chatbot") {
        toast.success(
          value
            ? "Chatbot-tjenesten er nå aktivert"
            : "Chatbot-tjenesten er nå deaktivert"
        );
      } else if (key === "ga4") {
        toast.success(
          value
            ? "Google Analytics 4 er nå aktivert"
            : "Google Analytics 4 er nå deaktivert"
        );
      }
    }
  };

  const handleAcceptAll = () => {
    storeConsent({ chatbot: true, ga4: true });
    toast.success("Alle cookies er nå aktivert");
  };

  const handleRejectAll = () => {
    storeConsent({ chatbot: false, ga4: false });
    toast.success("Alle valgfrie cookies er nå deaktivert");
  };

  return (
    <div className="space-y-6 rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Administrer samtykke
        </p>
        <p className="text-base text-foreground mt-2">
          {getStatusLabel(preferences)}
        </p>
      </div>

      {/* Chatbot Switch */}
      <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background p-4">
        <div className="flex-1 space-y-1 pr-4">
          <Label
            htmlFor="chatbot-consent-inline"
            className="text-base font-medium text-foreground cursor-pointer"
          >
            Tillat Chatbot
          </Label>
          <p className="text-xs text-muted-foreground">
            Meldinger behandles av en AI-tjeneste hos AWS i USA (us-east-1) og
            lagres anonymt i opptil 90 dager for kvalitetskontroll.{" "}
            <Link href="/personvern#chatbot" className="text-primary underline">
              Les mer
            </Link>
          </p>
        </div>
        <Switch
          id="chatbot-consent-inline"
          checked={preferences?.chatbot ?? false}
          onCheckedChange={(checked) =>
            handlePreferenceChange("chatbot", checked)
          }
        />
      </div>

      {/* GA4 Switch */}
      <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background p-4">
        <div className="flex-1 space-y-1 pr-4">
          <Label
            htmlFor="ga4-consent-inline"
            className="text-base font-medium text-foreground cursor-pointer"
          >
            Tillat Google Analytics 4
          </Label>
          <p className="text-xs text-muted-foreground">
            Brukes for å forstå hvordan besøkende bruker nettstedet. Data
            anonymiseres automatisk.{" "}
            <Link href="/personvern#ga4" className="text-primary underline">
              Les mer
            </Link>
          </p>
        </div>
        <Switch
          id="ga4-consent-inline"
          checked={preferences?.ga4 ?? false}
          onCheckedChange={(checked) => handlePreferenceChange("ga4", checked)}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row pt-2">
        <Button onClick={handleAcceptAll} variant="default">
          Aksepter alle
        </Button>
        <Button onClick={handleRejectAll} variant="outline">
          Avslå alle
        </Button>
      </div>
    </div>
  );
};

export default CookieSettingsControls;
