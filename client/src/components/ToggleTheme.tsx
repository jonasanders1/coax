import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      className="bg-primary text-white hover:bg-primary/90 p-1 rounded-full"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
