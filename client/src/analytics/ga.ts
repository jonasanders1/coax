import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-HC5YYERVLC";
const GA_DISABLE_KEY = `ga-disable-${MEASUREMENT_ID}`;

let isInitialized = false;

const setGADisabled = (disabled: boolean) => {
  if (typeof window === "undefined") return;
  (window as typeof window & Record<string, boolean>)[GA_DISABLE_KEY] = disabled;
};

export const initGA = () => {
  if (isInitialized) return;
  setGADisabled(false);
  ReactGA.initialize(MEASUREMENT_ID);
  isInitialized = true;
};

export const disableGA = () => {
  setGADisabled(true);
};

export const logPageView = (path: string) => {
  if (!isInitialized) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

// Ensure GA is disabled until the user explicitly opts in.
if (typeof window !== "undefined") {
  setGADisabled(true);
}
