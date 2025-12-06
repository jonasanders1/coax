import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-HC5YYERVLC";
const GA_DISABLE_KEY = `ga-disable-${MEASUREMENT_ID}`;

let isInitialized = false;

const setGADisabled = (disabled: boolean) => {
  if (typeof window === "undefined") return;
  (window as typeof window & Record<string, boolean>)[GA_DISABLE_KEY] = disabled;
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export const initGA = () => {
  if (isInitialized) return;
  
  // Enable GA tracking
  setGADisabled(false);
  
  // Initialize react-ga4 (uses gtag under the hood)
  ReactGA.initialize(MEASUREMENT_ID);
  
  // Also ensure gtag is properly configured and send initial pageview
  if (typeof window !== "undefined" && window.gtag) {
    // Reconfigure gtag to enable tracking
    window.gtag("config", MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true,
    });
    
    // Send initial pageview
    window.gtag("event", "page_view", {
      page_path: window.location.pathname + window.location.search,
    });
  }
  
  isInitialized = true;
};

export const disableGA = () => {
  setGADisabled(true);
};

export const logPageView = (path: string) => {
  if (!isInitialized) return;
  
  // Use both react-ga4 and gtag for compatibility
  ReactGA.send({ hitType: "pageview", page: path });
  
  // Also send via gtag directly
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
    });
  }
};

// Ensure GA is disabled until the user explicitly opts in.
if (typeof window !== "undefined") {
  setGADisabled(true);
}
