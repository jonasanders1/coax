export type CookieItem = {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
};

export const cookieList: CookieItem[] = [
  {
    name: "_ga",
    provider: "Google",
    purpose: "Skiller brukere fra hverandre",
    expiry: "2 år",
  },
  {
    name: "_ga_<container-id>",
    provider: "Google",
    purpose: "Vedlikeholder sesjoner og statistikk",
    expiry: "2 år",
  },
  {
    name: "cookie_consent",
    provider: "coax.no",
    purpose: "Lagrer samtykkevalget ditt",
    expiry: "6–12 måneder",
  },
] as const;

