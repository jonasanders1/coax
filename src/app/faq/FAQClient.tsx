"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import PageTitle from "@/shared/components/common/PageTitle";
import type { FaqCategory } from "@/features/faq/lib/faqs";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import CtaSection from "@/features/chatbot/components/CtaSection";
import {
  StructuredData,
  FAQPageSchema,
} from "@/shared/components/common/StructuredData";
import { useAppContext } from "@/shared/context/AppContext";
import FaqListSkeleton from "@/features/faq/components/FaqListSkeleton";

const FAQClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { faqs, faqsLoading, faqsError, fetchFaqs } = useAppContext();

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  // Generate FAQ schema from all FAQs (not filtered)
  const faqSchema = useMemo(() => {
    const allFaqs = faqs.flatMap((category) =>
      category.questions.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      }))
    );
    return FAQPageSchema(allFaqs);
  }, [faqs]);

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in-up">
      <StructuredData data={faqSchema} />
      <div className="container mx-auto px-4 max-w-6xl">
        <PageTitle
          title="Ofte stilte spørsmål om COAX vannvarmere"
          text="Finn svar på alt fra installasjon og el-krav til effektivitet, vannkvalitet og bruksområder."
        />

        <CtaSection isHeader={true} />

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Søk i spørsmål..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg"
              maxLength={200}
            />
          </div>
        </div>

        {faqsLoading ? (
          <FaqListSkeleton />
        ) : faqsError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-destructive text-center">
              Kunne ikke laste spørsmål. Prøv å oppdatere siden.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Prøv igjen
            </Button>
          </div>
        ) : (
          <>
            {filteredFaqs.length === 0 && searchTerm.trim() !== "" ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Ingen spørsmål matcher søket ditt.
                </p>
              </div>
            ) : filteredFaqs.length > 0 ? (
              <div className="space-y-8">
                {filteredFaqs.map((category, idx) => (
                  <div key={idx}>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, qIdx) => (
                        <AccordionItem
                          key={faq.id || qIdx}
                          value={`${idx}-${qIdx}`}
                          className="border rounded-lg px-4 bg-card"
                        >
                          <AccordionTrigger className="text-left hover:no-underline text-lg">
                            <span className="font-semibold">
                              {faq.question}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground text-sm md:text-lg leading-relaxed">
                            {faq.contentSegments ? (
                              <div className="space-y-2">
                                {/* Split answer by double newlines to preserve paragraph spacing */}
                                {faq.answer
                                  .split(/\n\n+/)
                                  .map(
                                    (paragraph, paraIdx) =>
                                      paragraph.trim() && (
                                        <p key={`para-${paraIdx}`}>
                                          {paragraph.trim()}
                                        </p>
                                      )
                                  )}
                                {/* Render content segments */}
                                <p>
                                  {faq.contentSegments.map(
                                    (segment, segmentIdx) =>
                                      segment.kind === "text" ? (
                                        <span
                                          key={`text-${segmentIdx}`}
                                          className=""
                                        >
                                          {segment.value}
                                        </span>
                                      ) : (
                                        <Link
                                          key={`link-${segmentIdx}`}
                                          href={segment.to}
                                          className="text-primary underline font-medium"
                                        >
                                          {segment.value}
                                        </Link>
                                      )
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {/* Split answer by double newlines to preserve paragraph spacing */}
                                {faq.answer
                                  .split(/\n\n+/)
                                  .map(
                                    (paragraph, paraIdx) =>
                                      paragraph.trim() && (
                                        <p key={`para-${paraIdx}`}>
                                          {paragraph.trim()}
                                        </p>
                                      )
                                  )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        <div className="mt-12 bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Fikk du ikke svar på ditt spørsmål?
          </h2>
          <p className="text-muted-foreground mb-6">
            Ta kontakt med oss, så hjelper vi deg gjerne!
          </p>
          <Link href="/kontakt">
            <Button size="lg" className="gap-2">
              Kontakt oss
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQClient;
