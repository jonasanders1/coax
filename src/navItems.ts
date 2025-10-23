import { Home, Package, SlidersHorizontal, HelpCircle, Star, Phone, type LucideIcon } from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  icon?: LucideIcon;
};

export const navItems: NavItem[] = [
  { path: "/", label: "Hjem", icon: Home },
  { path: "/produkter", label: "Produkter", icon: Package },
  { path: "/velg-modell", label: "Velg Modell", icon: SlidersHorizontal },
  { path: "/faq", label: "FAQ", icon: HelpCircle },
  { path: "/referanser", label: "Referanser", icon: Star },
  { path: "/kontakt", label: "Kontakt", icon: Phone },
];
