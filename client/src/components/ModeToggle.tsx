import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

const OPTIONS: Array<{
  value: ThemeValue;
  label: string;
  icon: React.ElementType;
}> = [
  { value: "light", label: "Lys", icon: Sun },
  { value: "dark", label: "Mørk", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ModeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = theme ?? "system";
  const activeOption = OPTIONS.find((opt) => opt.value === activeTheme) ?? OPTIONS[2];
  const ActiveIcon = activeOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <span className="inline-flex items-center gap-3">
            <ActiveIcon className="h-4 w-4 text-primary" />
            <span className="lg:hidden">{activeOption.label}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full min-w-[12rem]">
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive =
            value === activeTheme ||
            (value === "system" && theme === "system" && resolvedTheme);
          return (
            <DropdownMenuItem
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm",
                isActive ? "bg-primary/10 text-primary" : ""
              )}
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

