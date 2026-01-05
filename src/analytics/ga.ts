import { logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { firebaseAnalytics } from "@/firebaseConfig";

let isInitialized = false;
let isEnabled = false;

/**
 * Initialize Firebase Analytics tracking.
 * This enables analytics collection and marks the service as initialized.
 */
export const initGA = () => {
  if (typeof window === "undefined") return;
  if (!firebaseAnalytics) {
    console.warn("Firebase Analytics is not available");
    return;
  }

  // Enable analytics collection
  try {
    setAnalyticsCollectionEnabled(firebaseAnalytics, true);
    isEnabled = true;
    isInitialized = true;

    // Log initial page view
    if (window.location) {
      logPageView(
        window.location.pathname + window.location.search
      );
    }
  } catch (error) {
    console.warn("Failed to enable Firebase Analytics:", error);
  }
};

/**
 * Disable Firebase Analytics tracking.
 * This disables analytics collection but keeps the service initialized.
 */
export const disableGA = () => {
  if (typeof window === "undefined") return;
  if (!firebaseAnalytics) return;

  // Disable analytics collection
  try {
    setAnalyticsCollectionEnabled(firebaseAnalytics, false);
    isEnabled = false;
  } catch (error) {
    console.warn("Failed to disable Firebase Analytics:", error);
  }
};

/**
 * Log a page view event.
 * Only logs if analytics is initialized and enabled.
 */
export const logPageView = (path: string) => {
  if (typeof window === "undefined") return;
  if (!firebaseAnalytics || !isInitialized || !isEnabled) return;

  try {
    logEvent(firebaseAnalytics, "page_view", {
      page_path: path,
      page_title: document.title,
    });
  } catch (error) {
    console.warn("Failed to log page view:", error);
  }
};

// Ensure analytics is disabled until the user explicitly opts in.
if (typeof window !== "undefined" && firebaseAnalytics) {
  // Explicitly disable analytics collection on initialization
  // This ensures analytics is off by default until consent is given
  try {
    setAnalyticsCollectionEnabled(firebaseAnalytics, false);
  } catch (error) {
    // Analytics might not be available yet, which is fine
    // It will be properly initialized when initGA() is called
  }
}
