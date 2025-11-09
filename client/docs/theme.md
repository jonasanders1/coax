Implementing Light/Dark Mode in Your Vite App with shadcn/ui

javascript
This article will guide you through implementing a light/dark mode feature in your Vite project using the powerful and user-friendly shadcn/ui library.

1. Setting Up the Theme Provider
First, we need to create a theme provider component that will manage the application's theme state. This component will handle switching between light, dark, and system themes, and persist the user's preference in local storage.

components/theme-provider.tsx:
```
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
```

Explanation:

Theme type: Defines the possible theme values (dark, light, system).
ThemeProviderProps: Defines the props accepted by the ThemeProvider component.
ThemeProviderState: Defines the state of the theme provider, including the current theme and a function to update it.
initialState: Sets the initial theme to "system", which will follow the user's system preference.
ThemeProviderContext: Creates a React context to share the theme state throughout the application.
ThemeProvider component:
Uses useState to manage the current theme, initialized from local storage or the defaultTheme prop.
Uses useEffect to update the document's class list based on the current theme.
Provides the theme state and setTheme function through the context.
useTheme hook: A custom hook to access the theme state and setTheme function within any component.
2. Wrapping Your Root Layout
Next, wrap your root layout component (App.tsx or similar) with the ThemeProvider. This ensures that all components within your application have access to the theme context.

App.tsx:
```
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

export default App;
```

3. Adding a Mode Toggle
Finally, create a mode toggle component that allows users to switch between light, dark, and system themes.

components/mode-toggle.tsx:
```
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

```
Explanation:

useTheme hook: Imports the useTheme hook to access the setTheme function.
DropdownMenu component: Uses the DropdownMenu component from shadcn/ui to create a dropdown menu for the mode toggle.
DropdownMenuItem components: Each item in the dropdown represents a theme option, with an onClick handler that calls setTheme with the corresponding theme.
Conclusion
Now you have a fully functional light/dark mode implementation in your Vite project using shadcn/ui. Users can easily switch between themes and their preference will be saved in local storage. This provides a seamless and customizable experience for your users.

