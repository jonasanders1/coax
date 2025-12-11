"use client";

import { useState, useEffect, useCallback } from "react";
import {
  STORAGE_KEY,
  COOKIE_STATUS_EVENT,
} from "@/shared/components/common/CookieConsent";
import type { ConsentPreferences } from "@/shared/components/common/CookieConsent";

export interface CookieConsentState {
  chatbot: boolean;
  ga4: boolean;
}

/**
 * Hook to check and manage cookie consent preferences
 */
export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsentState>({
    chatbot: false,
    ga4: false,
  });
  const [hydrated, setHydrated] = useState(false);

  // Load consent from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentPreferences;
        setConsentState({
          chatbot: parsed.chatbot ?? false,
          ga4: parsed.ga4 ?? false,
        });
      }
    } catch (error) {
      console.warn("Failed to read cookie consent:", error);
    }
    setHydrated(true);
  }, []);

  // Listen for consent changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStatusChange = () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ConsentPreferences;
          setConsentState({
            chatbot: parsed.chatbot ?? false,
            ga4: parsed.ga4 ?? false,
          });
        }
      } catch (error) {
        console.warn("Failed to read cookie consent:", error);
      }
    };

    window.addEventListener(COOKIE_STATUS_EVENT, handleStatusChange);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        handleStatusChange();
      }
    });

    return () => {
      window.removeEventListener(COOKIE_STATUS_EVENT, handleStatusChange);
    };
  }, []);

  const hasChatbotConsent = useCallback(() => {
    return consent.chatbot;
  }, [consent.chatbot]);

  const hasGA4Consent = useCallback(() => {
    return consent.ga4;
  }, [consent.ga4]);

  return {
    consent,
    hasChatbotConsent,
    hasGA4Consent,
    hydrated,
  };
}

