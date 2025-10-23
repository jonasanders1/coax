import { useLocation, useParams, Link as RouterLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Download, LifeBuoy } from "lucide-react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import type { Product } from "@/types";
import productDetails from "@/product-details.json";
import cabinImage from "@/assets/cabin-water-heater.png";
import homeImage from "@/assets/home-water-heater.png";
import industrialImage from "@/assets/industrial-water-heater.png";

const imageMap: Record<string, string> = {
  cabinImage,
  homeImage,
  commercialImage: industrialImage,
};

const ProductDetailsRedesigned = () => {
  const { id } = useParams();
  const location = useLocation() as { state?: { product?: Product } };
  let product = location.state?.product;
  if (!product && id) {
    const fromJson = (productDetails as any).products.find((p: any) => p.id === id);
    if (fromJson) {
      product = {
        ...fromJson,
        images: Array.isArray(fromJson.images)
          ? fromJson.images.map((key: string) => imageMap[key] || imageMap.homeImage)
          : [],
      } as Product;
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Produkt ikke funnet</h2>
          <p className="text-muted-foreground mb-4">
            Vi fant ikke produktdata i navigasjonen. Gå tilbake til
            produktoversikten og prøv igjen.
          </p>
          <Button asChild variant="outline">
            <RouterLink to="/produkter">Tilbake til produkter</RouterLink>
          </Button>
        </div>
      </div>
    );
  }

  const { name, images, phase, priceFrom, description, ideal, specs } = product;
  const category = product.category;
  const voltageStr =
    (Array.isArray(product.voltage)
      ? product.voltage.join(", ")
      : product.voltage) ||
    (Array.isArray(specs?.voltage) ? specs?.voltage?.join(", ") : specs?.voltage);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink underline="hover" color="inherit" href="/">
            Hjem
          </MuiLink>
          <MuiLink underline="hover" color="inherit" href="/produkter">
            Produkter
          </MuiLink>
          <Typography color="text.primary">{name}</Typography>
        </Breadcrumbs>

        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-sm bg-muted/30 aspect-[4/3]">
            {images && images.length > 0 ? (
              <img
                src={images[0]}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Ingen bilde tilgjengelig
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{phase}</Badge>
              <Badge variant="outline">{category}</Badge>
              {specs?.flowRates?.[0] && (
                <Badge variant="outline">{specs.flowRates[0]}</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight">{name}</h1>

            <div>
              <span className="block text-muted-foreground text-sm mb-1">
                Fra
              </span>
              <span className="text-3xl font-semibold text-primary">
                {priceFrom}
              </span>
              <span className="block text-muted-foreground text-xs mt-0.5">
                inkl. mva
              </span>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 text-base">
                <RouterLink to="/kontakt">Kontakt for kjøp</RouterLink>
              </Button>
              <Button variant="outline" className="flex-1 text-base gap-2">
                <Download className="w-4 h-4" /> Last ned datablad
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left - Specs & Ideal */}
          <div className="md:col-span-2 space-y-8">
            <Accordion
              type="single"
              collapsible
              defaultValue="specs"
              className="border-none"
            >
              <AccordionItem value="specs">
                <AccordionTrigger className="text-lg font-semibold">
                  Tekniske spesifikasjoner
                </AccordionTrigger>
                <AccordionContent>
                  {specs ? (
                    <ul className="space-y-2 text-sm">
                      {Object.entries(specs).map(([key, value]) => (
                        <li key={key} className="flex justify-between border-b pb-1">
                          <span className="font-medium">
                            {key}
                          </span>
                          <span className="text-muted-foreground">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ideal">
                <AccordionTrigger className="text-lg font-semibold">
                  Ideell for
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="grid sm:grid-cols-2 gap-2 mt-2">
                    {ideal.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right - Sidebar */}
          <aside className="space-y-6">
            {/* Chat */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
              <h2 className="text-xl font-semibold mb-2">Chat om {name}</h2>
              <p className="text-sm text-primary-foreground/90 mb-4">
                Få hjelp til å vurdere om denne modellen passer for ditt behov.
              </p>
              <Button size="lg" variant="secondary" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" /> Start chat
              </Button>
            </div>

            {/* Quick facts */}
            <div className="rounded-2xl border p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Hurtigfakta</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Fase:</strong> {phase}
                </li>
                {voltageStr && (
                  <li>
                    <strong className="text-foreground">Spenning:</strong>{" "}
                    {voltageStr}
                  </li>
                )}
                {specs?.flowRates?.[0] && (
                  <li>
                    <strong className="text-foreground">Kapasitet:</strong>{" "}
                    {specs.flowRates[0]}
                  </li>
                )}
                <li>
                  <strong className="text-foreground">Kategori:</strong> {category}
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="rounded-2xl border p-6 flex items-center justify-between shadow-sm">
              <div>
                <div className="font-semibold">Trenger du hjelp?</div>
                <div className="text-sm text-muted-foreground">
                  Kontakt oss for rådgivning
                </div>
              </div>
              <Button asChild size="sm" className="gap-2">
                <RouterLink to="/kontakt">
                  <LifeBuoy className="w-4 h-4" /> Kontakt
                </RouterLink>
              </Button>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailsRedesigned;
