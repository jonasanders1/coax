"use client";
import React from "react";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { calculatorDescription } from "@/lib/calculator-description";
import { useTheme } from "@/hooks/useTheme";
import PageTitile from "@/components/PageTitile";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";

function normalizeMarkdown(src: string) {
  // Convert ```katex ... ``` to $$...$$
  const fencedToMath = src.replace(
    /```katex[\r\n]+([\s\S]*?)```/g,
    (_m, p1) => `$$\n${p1.trim()}\n$$`
  );
  return fencedToMath;
}

const CalculationDetailsClient = () => {
  const { resolvedTheme } = useTheme();
  return (
    <div className="min-h-screen pt-24 bg-muted pb-16 animate-fade-in-up">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-separator": {
              color: "hsl(var(--muted-foreground))",
            },
          }}
        >
          <Link
            href="/"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Hjem
          </Link>
          <Link
            href="/kalkulator"
            style={{
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
            }}
            className="hover:underline"
          >
            Forbrukskalkulator
          </Link>
          <Typography sx={{ color: "hsl(var(--accent))" }}>Detaljer</Typography>
        </Breadcrumbs>
        <PageTitile
          title="COAX Forbrukskalkulator - Detaljer"
          text="Omfattende beskrivelse av kalkulatorens forutsetninger, beregninger og begrunnelser"
        />
        <div className="overflow-y-auto pr-2 -mr-2">
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert markdown-body prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold prose-code:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground pt-6">
            <MarkdownPreview
              source={normalizeMarkdown(calculatorDescription)}
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              style={{
                background: "transparent",
                color: "inherit",
              }}
              wrapperElement={{
                "data-color-mode": resolvedTheme === "dark" ? "dark" : "light",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationDetailsClient;
