import {
  Home,
  Package,
  SlidersHorizontal,
  HelpCircle,
  Star,
  Phone,
  Calculator,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  icon?: LucideIcon;
  header?: boolean;
};

export const navItems: NavItem[] = [
  { path: "/", label: "Hjem", icon: Home, header: true },
  { path: "/produkter", label: "Produkter", icon: Package, header: true },
  // {
  //   path: "/velg-modell",
  //   label: "Velg Modell",
  //   icon: SlidersHorizontal,
  //   header: true,
  // },
  {
    path: "/kalkulator",
    label: "Sparekalkulator",
    icon: Calculator,
    header: true,
  },
  { path: "/faq", label: "FAQ", icon: HelpCircle, header: true },
  { path: "/referanser", label: "Referanser", icon: Star, header: true },
  { path: "/kontakt", label: "Kontakt", icon: Phone, header: true },
];
