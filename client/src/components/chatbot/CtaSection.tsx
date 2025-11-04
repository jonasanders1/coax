import React from "react";
import { Button } from "../ui/button";
import { MessageCircle } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";

interface CtaSectionProps {
  isHeader?: boolean;
}

const CtaSection = ({ isHeader }: CtaSectionProps) => {
  const { openChat } = useChatBot();

  return (
    <section className={isHeader ? "py-0 md:py-0" : "py-16 md:py-24"}>
      <div className="relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ background: 'var(--gradient-primary)' }}>
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute right-20 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-white/10"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            <div className="mb-6 md:mb-0 md:max-w-lg">
              <h2 className="mb-3 text-2xl font-bold md:text-3xl">
                Trenger du hjelp med å velge riktig vannvarmer?
              </h2>
              <p className="text-primary-foreground/90">
                Flux, vår smarte assistent, hjelper deg med å finne den perfekte
                løsningen for ditt hjem eller firma. Få personlig veiledning og
                svar på alle dine spørsmål – 24/7!
              </p>
            </div>
            <div className="flex flex-col ">
              <Button
                onClick={() => openChat()}
                size="lg"
                className="group relative z-10 min-w-[180px] overflow-hidden border-2 border-white bg-white/10 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-primary/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Snakk med Flux
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'var(--gradient-primary)' }}></span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
