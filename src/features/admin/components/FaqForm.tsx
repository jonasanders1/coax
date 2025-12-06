"use client";

import { useState, useEffect } from "react";
import { addFaq, updateFaq, getAllCategories, type FaqItem } from "@/features/admin/lib/faqs";
import type { FaqContentSegment } from "@/features/admin/lib/faqs";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, Plus, X, GripVertical } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface FaqFormProps {
  faq: FaqItem | null;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
  onCategoriesChange: () => void;
}

type SegmentForm = {
  kind: "text" | "link";
  value: string;
  to?: string;
};

export default function FaqForm({
  faq,
  categories,
  onClose,
  onSuccess,
  onCategoriesChange,
}: FaqFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [segments, setSegments] = useState<SegmentForm[]>([]);
  const [showSegmentForm, setShowSegmentForm] = useState(false);
  const [segmentForm, setSegmentForm] = useState<SegmentForm>({
    kind: "text",
    value: "",
    to: "",
  });

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || "");
      setAnswer(faq.answer || "");
      setCategory(faq.category || "");
      setUseNewCategory(false);
      setNewCategory("");
      if (faq.contentSegments && faq.contentSegments.length > 0) {
        setSegments(
          faq.contentSegments.map((seg) => ({
            kind: seg.kind,
            value: seg.value,
            to: seg.kind === "link" ? seg.to : undefined,
          }))
        );
      } else {
        setSegments([]);
      }
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("");
      setUseNewCategory(false);
      setNewCategory("");
      setSegments([]);
    }
  }, [faq]);

  const handleAddSegment = () => {
    if (!segmentForm.value.trim()) {
      toast({
        title: "Feil",
        description: "Segment må ha en verdi",
        variant: "destructive",
      });
      return;
    }
    if (segmentForm.kind === "link" && !segmentForm.to?.trim()) {
      toast({
        title: "Feil",
        description: "Link må ha en URL",
        variant: "destructive",
      });
      return;
    }
    setSegments([...segments, { ...segmentForm }]);
    setSegmentForm({ kind: "text", value: "", to: "" });
    setShowSegmentForm(false);
  };

  const handleRemoveSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalCategory = useNewCategory ? newCategory.trim() : category;
      if (!finalCategory) {
        toast({
          title: "Feil",
          description: "Kategori er påkrevd",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const contentSegments: FaqContentSegment[] | null =
        segments.length > 0
          ? segments.map((seg) =>
              seg.kind === "text"
                ? { kind: "text" as const, value: seg.value }
                : { kind: "link" as const, value: seg.value, to: seg.to! }
            )
          : null;

      const faqData = {
        question: question.trim(),
        answer: answer.trim(),
        category: finalCategory,
        contentSegments,
      };

      if (faq?.id) {
        await updateFaq(faq.id, faqData);
        toast({
          title: "Suksess",
          description: "FAQ ble oppdatert",
        });
      } else {
        await addFaq(faqData);
        toast({
          title: "Suksess",
          description: "FAQ ble lagt til",
        });
        if (useNewCategory) {
          onCategoriesChange();
        }
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast({
        title: "Feil",
        description: faq
          ? "Kunne ikke oppdatere FAQ"
          : "Kunne ikke legge til FAQ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const previewText = () => {
    if (segments.length === 0) {
      return answer;
    }
    let preview = answer;
    segments.forEach((seg) => {
      if (seg.kind === "text") {
        preview += " " + seg.value;
      } else {
        preview += ` [${seg.value}](${seg.to})`;
      }
    });
    return preview;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-6">
          <DialogTitle>
            {faq ? "Endre FAQ" : "Legg til ny FAQ"}
          </DialogTitle>
          <DialogDescription>
            {faq
              ? "Oppdater FAQ-informasjonen nedenfor"
              : "Fyll inn FAQ-informasjonen nedenfor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Spørsmål *</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="f.eks. Er COAX ideell for hytter?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Svar *</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              rows={4}
              placeholder="Skriv svaret her..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <div className="flex gap-2">
              <Select
                value={useNewCategory ? "new" : category}
                onValueChange={(value) => {
                  if (value === "new") {
                    setUseNewCategory(true);
                    setCategory("");
                  } else {
                    setUseNewCategory(false);
                    setCategory(value);
                    setNewCategory("");
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Velg kategori eller legg til ny" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Legg til ny kategori</SelectItem>
                </SelectContent>
              </Select>
              {useNewCategory && (
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ny kategori"
                  className="flex-1"
                  required={useNewCategory}
                />
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Innholdsegmenter (valgfritt)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Legg til tekst eller lenker som skal vises etter svaret
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSegmentForm(!showSegmentForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til segment
              </Button>
            </div>

            {showSegmentForm && (
              <div className="space-y-3 p-3 bg-background rounded border">
                <div className="flex gap-2">
                  <Select
                    value={segmentForm.kind}
                    onValueChange={(value: "text" | "link") =>
                      setSegmentForm({ ...segmentForm, kind: value, to: "" })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Tekst</SelectItem>
                      <SelectItem value="link">Lenke</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={segmentForm.value}
                    onChange={(e) =>
                      setSegmentForm({ ...segmentForm, value: e.target.value })
                    }
                    placeholder={
                      segmentForm.kind === "text"
                        ? "Tekst..."
                        : "Lenketekst..."
                    }
                    className="flex-1"
                  />
                  {segmentForm.kind === "link" && (
                    <Input
                      value={segmentForm.to || ""}
                      onChange={(e) =>
                        setSegmentForm({ ...segmentForm, to: e.target.value })
                      }
                      placeholder="/path eller URL"
                      className="flex-1"
                    />
                  )}
                  <Button
                    type="button"
                    onClick={handleAddSegment}
                    size="sm"
                  >
                    Legg til
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSegmentForm(false);
                      setSegmentForm({ kind: "text", value: "", to: "" });
                    }}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {segments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Segmenter:</p>
                {segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-background rounded border"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={seg.kind === "link" ? "default" : "secondary"}>
                      {seg.kind === "link" ? "🔗 Lenke" : "📝 Tekst"}
                    </Badge>
                    <span className="flex-1 text-sm">
                      {seg.kind === "link" ? (
                        <>
                          {seg.value} → {seg.to}
                        </>
                      ) : (
                        seg.value
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSegment(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {segments.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded">
                <p className="text-xs font-medium mb-1">Forhåndsvisning:</p>
                <p className="text-sm text-muted-foreground">
                  {previewText()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {faq ? "Oppdaterer..." : "Legger til..."}
                </>
              ) : faq ? (
                "Oppdater FAQ"
              ) : (
                "Legg til FAQ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

