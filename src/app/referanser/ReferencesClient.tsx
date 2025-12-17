"use client";

import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import PageTitle from "@/shared/components/common/PageTitle";
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
                          alt={`${ref.caption} - ${ref.testimonial.substring(
                            0,
                            50
                          )}...`}
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
      </div>
    </div>
  );
};

export default ReferencesClient;
