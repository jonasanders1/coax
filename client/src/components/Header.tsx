"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChatBot } from "@/hooks/useChatBot";
import { navItems } from "@/navItems";
import { useAppStore } from "@/store/appStore";
import Logo from "./Logo";
import { ModeToggle } from "./ModeToggle";
import { useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const Header = () => {
  const pathname = usePathname();
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const [isSmall, setIsSmall] = useState(false);
  const frameRequested = useRef(false);
  // const { openChat } = useChatBot();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const threshold = 100;

    const updateHeaderSize = () => {
      const shouldBeSmall = window.scrollY >= threshold;
      setIsSmall((prev) => (prev === shouldBeSmall ? prev : shouldBeSmall));
      frameRequested.current = false;
    };

    const handleScroll = () => {
      if (!frameRequested.current) {
        frameRequested.current = true;
        window.requestAnimationFrame(updateHeaderSize);
      }
    };

    updateHeaderSize();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      frameRequested.current = false;
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md transition-all 0.2s ease-out ${isSmall ? "shadow-md" : ""}`}>
      <nav
        className="container mx-auto px-4 py-2 max-w-6xl"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems
              .filter((item) => item.header)
              .map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.path)
                      ? "text-primary border-b border-primary"
                      : "text-foreground/70"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.icon ? (
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                    {item.label}
                  </span>
                </Link>
              ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <ModeToggle />
          </div>

          {/* <Button
            className="hidden lg:flex text-white"
            style={{ background: 'var(--gradient-primary)' }}
            onClick={openChat}
            size="sm"
            variant="default"
          >
            Snakk med Flux
            <MessageCircle className="h-5 w-5" />
          </Button> */}

          {/* Mobile Menu Button */}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-primary hover:text-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] bg-background"
            closeSize="lg"
          >
            <SheetHeader>
              <VisuallyHidden>
                <SheetTitle>Hovedmeny</SheetTitle>
              </VisuallyHidden>
              <VisuallyHidden>
                <SheetDescription>Navigasjon for nettstedet og tema-innstillinger</SheetDescription>
              </VisuallyHidden>
              <Link href="/" className="flex flex-col leading-tight">
                <Logo className="w-30" />
              </Link>
            </SheetHeader>

            <nav className="flex flex-col gap-4 mt-5 border-t border-border pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-lg font-medium py-3 px-4 rounded-lg transition-all ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground border-b border-primary"
                      : "bg-gray-500/10 hover:bg-gray-500/20 dark:bg-muted/50 dark:hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="inline-flex items-center gap-3">
                    {item.icon ? (
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    ) : null}
                    {item.label}
                  </span>
                </Link>
              ))}
              {/* <div className="border-t border-border pt-4">
                <Button
                  size="lg"
                  className="w-full mt-2"
                  style={{ background: 'var(--gradient-primary)' }}
                  onClick={() => {
                    openChat();
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Snakk med Flux
                </Button>
              </div> */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Tema</p>
                <ModeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
