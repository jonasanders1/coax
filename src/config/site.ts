export const siteUrl = "https://coax.no";

export const absoluteUrl = (path: string) => {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return path;
  }
};


