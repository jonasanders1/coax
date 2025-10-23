import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-VVJPG5SY0Y";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
