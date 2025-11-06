import { useLocation, useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import Typography from "@mui/material/Typography";
import type { Product } from "@/types/product";
import { getProductById } from "@/lib/products";

const ProductDetailsRedesigned = () => {
  const { id } = useParams();
  const location = useLocation() as { state?: { product?: Product } };
  
  // Fetch product from Firestore if not in location state
  const { data: fetchedProduct, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !location.state?.product && !!id,
  });

  // Use location state product first, then fetched product
  // Images are already processed as storage URLs from getProductById
  const product = location.state?.product || fetchedProduct;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground">Laster produktdata...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 ">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Produkt ikke funnet</h2>
          <p className="text-muted-foreground mb-4">
            Vi fant ikke produktdata for dette produktet. Gå tilbake til
            produktoversikten og prøv igjen.
          </p>
          <Button asChild variant="secondary">
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
    (Array.isArray(specs?.voltage)
      ? specs?.voltage?.join(", ")
      : specs?.voltage);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background animate-fade-in-up">
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: "hsl(var(--muted-foreground))",
            },
          }}
        >
          <RouterLink
            to="/"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Hjem
          </RouterLink>
          <RouterLink
            to="/produkter"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Produkter
          </RouterLink>
          <Typography sx={{ color: "hsl(var(--accent))" }}>{name}</Typography>
        </Breadcrumbs>

        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
          <div className="space-y-4">
            {/* Product name */}
            <h1 className="text-4xl font-bold tracking-tight">{name}</h1>

            {/* Quick facts */}

            <div className="rounded-xl border p-4 bg-card text-sm space-y-1">
              <div>
                <strong className="text-foreground">Fase:</strong> {phase}
              </div>
              {voltageStr && (
                <div>
                  <strong className="text-foreground">Spenning:</strong>{" "}
                  {voltageStr}
                </div>
              )}
              {specs?.flowRates?.[0] && (
                <div>
                  <strong className="text-foreground">Kapasitet:</strong>{" "}
                  {specs.flowRates[0]}
                </div>
              )}
              <div>
                <strong className="text-foreground">Kategori:</strong>{" "}
                {category}
              </div>
            </div>

            {/* Ideal for */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Ideell for</h2>
              <ul className="space-y-1">
                {ideal.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
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

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 text-base">
                <RouterLink to="/kontakt">Kontakt for kjøp</RouterLink>
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-base gap-2 bg-muted hover:bg-primary"
              >
                <Download className="w-4 h-4" /> Last ned datablad
              </Button>
            </div>
          </div>
        </section>

        {/* Description */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
            <h2 className="text-xl font-semibold">{name} beskrivelse</h2>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm">
                {phase}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {category}
              </Badge>
              {specs?.flowRates?.[0] && (
                <Badge variant="secondary" className="text-sm">
                  {specs.flowRates[0]}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </section>

        <Separator />

        {/* Content Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left - Specs */}
          <div className="lg:col-span-2 space-y-8">
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
                  {specs && (
                    <ul className="space-y-2 text-sm">
                      {Object.entries(specs).map(([key, value]) => (
                        <li
                          key={key}
                          className="flex justify-between border-b pb-1"
                        >
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right - Sidebar */}
          <aside className="space-y-6">
            {/* Chat */}
            <div
              className="rounded-2xl p-6 text-white shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <h2 className="text-xl font-semibold mb-2">Chat om {name}</h2>
              <p className="text-sm text-white/90 mb-4">
                Få hjelp til å vurdere om denne modellen passer for ditt behov.
              </p>
              <Button size="lg" variant="secondary" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" /> Start chat
              </Button>
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
