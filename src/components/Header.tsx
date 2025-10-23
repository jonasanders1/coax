import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import logo from "@/assets/coax-logo.png";
import { useChatBot } from "@/hooks/useChatBot";
import { navItems } from "@/navItems";
import { useAppStore } from "@/store/appStore";

const Header = () => {
  const location = useLocation();
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useAppStore((s) => s.setMobileMenuOpen);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const { openChat } = useChatBot();

  const isActive = (path: string) => location.pathname === path;

  // navItems shared via src/navItems.ts

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-tight">
            <img src={logo} className="w-32" alt="COAX" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-md font-medium transition-colors hover:text-primary ${
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
          <Button className="hidden lg:flex" onClick={openChat} size="sm">
            <MessageCircle className="h-4 w-4" />
            Chat med ThermaBuddy
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
              className="w-full sm:w-[400px]"
              closeSize="lg"
            >
              <SheetHeader>
                <Link to="/" className="flex flex-col leading-tight">
                  <img src={logo} className="w-24" alt="COAX" />
                </Link>
              </SheetHeader>

              <nav className="flex flex-col gap-4 mt-8 border-t border-border pt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-lg font-medium py-3 px-4 rounded-lg transition-all ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground border-b border-primary"
                        : "bg-gray-100 hover:bg-gray-200"
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
                <div className="border-t border-border pt-4">
                  <Button
                    size="lg"
                    className="w-full mt-2"
                    onClick={() => {
                      openChat();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat med ThermaBuddy
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
