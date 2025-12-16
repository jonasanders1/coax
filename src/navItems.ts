import {
  Home,
  Package,
  SlidersHorizontal,
  HelpCircle,
  Star,
  Phone,
  Calculator,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  path: string;
  label: string;
  icon?: LucideIcon;
  header?: boolean;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { path: "/", label: "Hjem", icon: Home, header: false },
  { path: "/produkter", label: "Produkter", icon: Package, header: true },
  {
    path: "/velg-modell",
    label: "Velg Modell",
    icon: SlidersHorizontal,
    header: true,
  },
  // {
  //   path: "/coax-vs-tank",
  //   label: "COAX vs. Tank",
  //   icon: Zap,
  //   header: true,
  // },
  {
    path: "/kalkulator",
    label: "Forbrukskalkulator",
    icon: Calculator,
    header: true,
    children: [
      {
        path: "/kalkulator/detaljer",
        label: "Detaljer",
      },
      {
        path: "/kalkulator/innstillinger",
        label: "Innstillinger",
      },
    ],
  },
  { path: "/faq", label: "FAQ", icon: HelpCircle, header: true },
  { path: "/referanser", label: "Referanser", icon: Star, header: true },
  { path: "/kontakt", label: "Kontakt", icon: Phone, header: true },
];
