import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  // resolve actual theme (important when theme === "system")
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  return { theme, setTheme, resolvedTheme };
}
