"use client";

import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { CheckCircle, MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ThanksClient = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push("/?openChat=true");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4 py-8 sm:py-12 animate-fade-in-up">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-lg transition-all hover:shadow-xl sm:p-8">
        <div className="mb-4 flex justify-center sm:mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 sm:h-16 sm:w-16">
            <CheckCircle className="h-8 w-8 text-success sm:h-10 sm:w-10" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl">
          Tusen takk for din henvendelse!
        </h1>
        <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">
          Vi har mottatt meldingen din og vil svare så snart vi kan.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link href="/">Tilbake til forsiden</Link>
          </Button>
          <p className="flex flex-col items-center gap-1 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-2">
            <span>Har du spørsmål i mellomtiden?</span>
            <button
              onClick={handleChatClick}
              disabled={isNavigating}
              className="group inline-flex items-center font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
            >
              <MessageSquareText className="mr-1 h-4 w-4 transition-transform group-hover:scale-110" />
              {isNavigating ? "Åpner..." : "Snakk med Coax-AI"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThanksClient;

