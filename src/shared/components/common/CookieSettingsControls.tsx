"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  COOKIE_SETTINGS_EVENT,
  COOKIE_STATUS_EVENT,
  STORAGE_KEY,
} from "@/shared/components/common/CookieConsent";

type ConsentState = "unknown" | "accepted" | "rejected";

const statusLabel: Record<ConsentState, string> = {
  accepted: "Analyse-cookies er aktivert",
  rejected: "Kun nødvendige cookies er i bruk",
  unknown: "Ikke valgt ennå",
};

const CookieSettingsControls = () => {
  const [status, setStatus] = useState<ConsentState>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readStatus = () => {
      const stored = window.localStorage.getItem(
        STORAGE_KEY
      ) as ConsentState | null;
      if (stored === "accepted" || stored === "rejected") {
        setStatus(stored);
      } else {
        setStatus("unknown");
      }
    };

    readStatus();

    const handleStatusChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentState>).detail;
      if (detail) {
        setStatus(detail);
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

  const handleOpen = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
  };

  const resetConsent = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setStatus("unknown");
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
    window.dispatchEvent(
      new CustomEvent<ConsentState>(COOKIE_STATUS_EVENT, { detail: "unknown" })
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Administrer samtykke
        </p>
        <p className="text-base text-foreground">{statusLabel[status]}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleOpen}>Endre cookie-innstillinger</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Når du åpner innstillingene kan du godta eller avslå analyse-cookies når
        som helst.
      </p>
    </div>
  );
};

export default CookieSettingsControls;
