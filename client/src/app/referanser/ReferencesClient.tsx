"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import { references } from "@/data/references";

const ReferencesClient = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in-up">
      <div className="mx-auto">
        <PageTitle
          title="Fornøyde kunder i over 20 år"
          text="COAX leverer varmtvannsløsninger til hytter, boliger, næringsbygg, hoteller og industri. Se hvordan våre energieffektive vannvarmere har redusert kostnader og økt komfort for kunder."
        />

        <section className="pb-16 md:pb-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {references.map((ref) => (
                <Card key={ref.id}>
                  {ref.image && (
                    <CardContent className="p-0">
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={ref.image}
                          alt={`${ref.caption} - ${ref.testimonial.substring(0, 50)}...`}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </CardContent>
                  )}
                  <CardFooter className="flex-col items-start p-6">
                    <p className="font-semibold text-foreground">
                      {ref.caption}
                    </p>
                    <blockquote className="mt-2 text-sm text-muted-foreground border-l-2 border-primary italic pl-4">
                      {ref.testimonial}
                    </blockquote>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted text-foreground">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">
              Se hvordan COAX passer inn i ditt prosjekt.
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Klar for å oppgradere? Vi hjelper deg med å finne den beste
              løsningen.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="gap-2" aria-label="Kontakt en ekspert for å snakke om ditt prosjekt">
                <Link href="/kontakt">Snakk med en ekspert</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReferencesClient;

