import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { navItems } from "@/navItems";
import Logo from "./Logo";

const Footer = () => {


  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="text-center md:text-left md:border-r md:border-border md:pr-8">
            <Link
              href="/"
              className="flex flex-col leading-tight pb-3 items-center md:items-start"
            >
              <Logo className="w-28" />
            </Link>
            <p className="text-sm text-muted-foreground">
              COAX leverer plassbesparende og effektive elektriske vannvarmere.
              Vår visjon er å tilby smarte, miljøvennlige løsninger for
              oppvarming av vann i norske hjem, hytter og bedrifter.
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-border md:mt-0 md:pt-0 md:border-t-0 md:border-r md:border-border md:px-8 text-center md:text-left">
            <h3 className="font-semibold mb-4 text-foreground">Snarveier</h3>
            <nav className="grid grid-cols-1 lg:grid-cols-2 gap-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 justify-center md:justify-start"
                >
                  {item.icon ? (
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                  {item.label}
                </Link>
              ))}
              {/* <button
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 justify-center md:justify-start"
                onClick={() => {
                  openChat();
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Flux
              </button> */}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-border md:mt-0 md:pt-0 md:border-t-0 md:pl-8 text-center md:text-left">
            <h3 className="font-semibold mb-4 text-foreground">Kontakt</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2 justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Grønnliveien 13, 3474 Åros
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+4797732838"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  977 32 838
                </a>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:post@coax.no"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  post@coax.no
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center space-y-3">
          <Link
            href="/personvern"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Personvern og cookies
          </Link>
          <p className="text-sm text-muted-foreground">
            © 1994-2025 COAX AS. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
