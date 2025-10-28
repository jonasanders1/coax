import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@mui/material";
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Switch
      checked={resolvedTheme === "dark"}
      onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    />
  );
}
