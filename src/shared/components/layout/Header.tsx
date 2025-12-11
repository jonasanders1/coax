"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Menu, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { useChatBot } from "@/features/chatbot/hooks/useChatBot";
import { navItems } from "@/navItems";
import { useAppStore } from "@/store/appStore";
import Logo from "@/shared/components/layout/Logo";
import { useEffect, useRef, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronRight } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const [isSmall, setIsSmall] = useState(false);
  const frameRequested = useRef(false);
  const { openChat } = useChatBot();

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

      

          <Button
            className="hidden lg:flex text-white"
            style={{ background: 'var(--gradient-primary)' }}
            onClick={openChat}
            size="sm"
            variant="default"
          >
            Snakk med COAX-AI
            <MessageCircle className="h-5 w-5" />
          </Button> 

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

            <nav className="flex flex-col gap-2 mt-5 border-t border-border pt-4">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isParentActive =
                  isActive(item.path) ||
                  (hasChildren &&
                    item.children?.some((child) => isActive(child.path)));

                if (hasChildren) {
                  return (
                    <Accordion
                      key={item.path}
                      type="single"
                      collapsible
                      className="w-full"
                    >
                      <AccordionItem value={item.path} className="border-none">
                        <AccordionTrigger
                          className={`text-lg font-medium py-3 px-4 rounded-lg transition-all hover:no-underline ${
                            isParentActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-500/10 hover:bg-gray-500/20 dark:bg-muted/50 dark:hover:bg-muted"
                          }`}
                        >
                          <span className="inline-flex items-center gap-3">
                            {item.icon ? (
                              <item.icon className="h-5 w-5" aria-hidden="true" />
                            ) : null}
                            {item.label}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-2">
                          <div className="flex flex-col gap-2 pl-7">
                            <Link
                              href={item.path}
                              className={`text-base font-medium py-2 px-3 rounded-lg transition-all mt-3 ${
                                isActive(item.path)
                                  ? "bg-primary/20 text-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              Kalkulator
                            </Link>
                            {item.children?.map((child) => (
                              <Link
                                key={child.path}
                                href={child.path}
                                className={`text-base font-medium py-2 px-3 rounded-lg transition-all ${
                                  isActive(child.path)
                                    ? "bg-primary/20 text-primary"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                }

                return (
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
                );
              })}
              <div className="border-t border-border pt-4">
                <Button
                  size="lg"
                  className="w-full mt-2 text-base font-medium"
                  style={{ background: 'var(--gradient-primary)' }}
                  onClick={() => {
                    openChat();
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Snakk med COAX-AI
                </Button>
              </div>
           
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
