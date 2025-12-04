import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Produkt ikke funnet</h1>
        <p className="text-muted-foreground mb-6">
          Vi fant ikke produktdata for dette produktet. Gå tilbake til
          produktoversikten og prøv igjen.
        </p>
        <Button asChild variant="secondary">
          <Link href="/produkter">Tilbake til produkter</Link>
        </Button>
      </div>
    </div>
  );
}

