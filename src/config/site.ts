export const siteUrl = "https://coax.jonasanders1.com";

export const absoluteUrl = (path: string) => {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return path;
  }
};


