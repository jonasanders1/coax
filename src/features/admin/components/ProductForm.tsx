"use client";

import { useState, useEffect } from "react";
import { addProduct, updateProduct } from "@/features/admin/lib/products";
import type { Product } from "@/shared/types/product";
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
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ArrayField from "./ArrayField";
import ImageUpload from "./ImageUpload";
import { uploadProductImages } from "@/features/admin/lib/storage";

type ProductFormState = {
  name: string;
  category: string;
  priceFrom: number | string;
  description: string;
  images: string[];
  features: string[];
  ideal: string[];
  inStock: boolean;
  color: string;
  installation?: string;
  phase?: string;
  voltage?: string;
  certifications?: string[];
  specs: {
    [key: string]: unknown;
  };
};

type SpecsFormState = Product["specs"] & {
  [key: string]: unknown;
  tempRange?: string;
  connectionWire?: unknown;
  flowAt40C?: unknown;
  voltage?: string | string[];
};

interface ProductFormProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({
  product,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    category: "",
    priceFrom: "",
    description: "",
    images: [],
    features: [],
    ideal: [],
    inStock: true,
    color: "",
    installation: "",
    phase: "",
    voltage: "",
    certifications: [],
    specs: {},
  });
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.model || "",
        category: product.category || "",
        priceFrom: product.priceFrom || "",
        description: product.description || "",
        images: product.images || [],
        features: product.features || [],
        ideal: product.ideal || [],
        inStock: product.inStock,
        color: product.specs?.color || "",
        certifications: product.specs?.certifications || [],
        specs: product.specs || {},
        installation: product.installation || "",
        phase:
          product.specs?.phase !== undefined ? String(product.specs.phase) : "",
        voltage: product.specs?.voltage || "",
      });
    }
  }, [product]);

  const specs = formData.specs as SpecsFormState;

  const toStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return (value as unknown[]).map((v) => String(v));
    }
    if (value === undefined || value === null || value === "") {
      return [];
    }
    return [String(value)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert priceFrom to number if it's a string
      const priceFromValue =
        typeof formData.priceFrom === "string"
          ? parseFloat(String(formData.priceFrom)) || 0
          : formData.priceFrom || 0;

      const rawSpecs = (formData.specs || {}) as SpecsFormState;

      const toNumber = (value: unknown): number | undefined => {
        if (value == null) return undefined;
        if (typeof value === "number")
          return Number.isFinite(value) ? value : undefined;
        const n = parseFloat(String(value).replace(",", "."));
        return Number.isFinite(n) ? n : undefined;
      };

      const toNumberArray = (value: unknown): number[] | undefined => {
        if (value == null) return undefined;
        const arr = Array.isArray(value)
          ? value
          : String(value)
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
        const nums = arr
          .map((v) => toNumber(v))
          .filter((v): v is number => typeof v === "number");
        return nums.length ? nums : undefined;
      };

      const specsBase: SpecsFormState = { ...rawSpecs };

      // Map certifications from top-level form state into specs
      if (formData.certifications && formData.certifications.length > 0) {
        specsBase.certifications = formData.certifications;
      }

      // Store color ONLY in specs to match schema
      if (formData.color && formData.color.trim().length > 0) {
        specsBase.color = formData.color.trim();
      }

      // Ensure numeric phase (from specs or form field)
      const phaseNum = toNumber(specsBase.phase ?? formData.phase);
      if (phaseNum !== undefined) {
        specsBase.phase = phaseNum;
      }

      // Ensure numeric powerOptions
      const powerNums = toNumberArray(specsBase.powerOptions);
      if (powerNums && powerNums.length) {
        specsBase.powerOptions =
          powerNums.length === 1 ? powerNums[0] : powerNums;
      }

      // Ensure numeric current
      const currentNums = toNumberArray(specsBase.current);
      if (currentNums && currentNums.length) {
        specsBase.current =
          currentNums.length === 1 ? currentNums[0] : currentNums;
      }

      // Ensure numeric overheatProtection
      const overheatNum = toNumber(specsBase.overheatProtection);
      if (overheatNum !== undefined) {
        specsBase.overheatProtection = overheatNum;
      }

      // Ensure numeric efficiency
      const effNum = toNumber(
        specsBase.efficiency ??
          (typeof specsBase.efficiency === "string"
            ? (specsBase.efficiency as string).replace("%", "")
            : specsBase.efficiency)
      );
      if (effNum !== undefined) {
        specsBase.efficiency = effNum;
      }

      // Derive temperatureRange from tempRange if provided
      if (!specsBase.temperatureRange && specsBase.tempRange) {
        const parts = String(specsBase.tempRange)
          .split(/[-–—]/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length === 2) {
          const a = toNumber(parts[0]);
          const b = toNumber(parts[1]);
          if (a !== undefined && b !== undefined) {
            specsBase.temperatureRange = [a, b];
          }
        }
      }

      // Normalize voltage to a single string per schema
      if (Array.isArray(specsBase.voltage)) {
        specsBase.voltage = (specsBase.voltage as string[])
          .map((v) => String(v).trim())
          .filter(Boolean)
          .join("/");
      } else if (specsBase.voltage != null) {
        specsBase.voltage = String(specsBase.voltage);
      } else if (formData.voltage) {
        specsBase.voltage = formData.voltage;
      }

      // circuitBreaker is the only breaker field in the schema (string)

      // Map connectionWire into recommendedConnectionWire (schema field)
      if (specsBase.connectionWire && !specsBase.recommendedConnectionWire) {
        const numbers = toNumberArray(specsBase.connectionWire);
        if (numbers && numbers.length) {
          specsBase.recommendedConnectionWire =
            numbers.length === 1 ? numbers[0] : numbers;
        }
      }

      const productPayload: Omit<Product, "id"> = {
        model: formData.name.trim(),
        category: formData.category,
        inStock: formData.inStock,
        ideal: formData.ideal,
        priceFrom: priceFromValue,
        images: formData.images,
        description: formData.description,
        features: formData.features,
        installation: formData.installation,
        specs: specsBase,
      };

      let productId = product?.id;

      // Create or update product
      if (product) {
        // Update existing product
        await updateProduct(
          product.id,
          productPayload as Partial<Omit<Product, "id">>
        );
        productId = product.id;

        // Upload pending images if any
        if (pendingImages.length > 0) {
          try {
            // Pass existing images to determine next image number
            const imagePaths = await uploadProductImages(
              pendingImages,
              productId,
              formData.images || []
            );
            await updateProduct(productId, {
              images: [...(formData.images || []), ...imagePaths],
            });
            setPendingImages([]); // Clear pending images after successful upload
          } catch (error) {
            console.error("Error uploading images:", error);
            toast({
              title: "Advarsel",
              description:
                "Produktet ble oppdatert, men noen bilder kunne ikke lastes opp.",
            });
          }
        }
      } else {
        // Create new product
        // Generate a product ID from the name (lowercase, replace spaces with hyphens)
        const generatedId =
          formData.name
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "") || `product-${Date.now()}`;

        // Add product to Firestore with the generated ID
        productId = generatedId;
        await addProduct(
          { ...productPayload, images: [] } as Omit<Product, "id">,
          generatedId
        );

        // Upload pending images if any
        if (pendingImages.length > 0) {
          try {
            const imagePaths = await uploadProductImages(
              pendingImages,
              generatedId
            );
            await updateProduct(generatedId, {
              images: imagePaths,
            });
            setPendingImages([]); // Clear pending images after successful upload
          } catch (error) {
            console.error("Error uploading images:", error);
            toast({
              title: "Advarsel",
              description:
                "Produktet ble lagt til, men noen bilder kunne ikke lastes opp.",
            });
          }
        }
      }

      toast({
        title: "Suksess",
        description: product
          ? "Produktet ble oppdatert"
          : "Produktet ble lagt til",
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Feil",
        description: product
          ? "Kunne ikke oppdatere produktet"
          : "Kunne ikke legge til produktet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageFiles = (files: File[]) => {
    setPendingImages((prev) => [...prev, ...files]);
  };

  const handleSpecsChange = (
    field: string,
    value: string | string[] | undefined
  ) => {
    setFormData({
      ...formData,
      specs: {
        ...formData.specs,
        [field]: value,
      },
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-6">
          <DialogTitle>
            {product ? "Endre produkt" : "Legg til nytt produkt"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Oppdater produktinformasjonen nedenfor"
              : "Fyll inn produktinformasjonen nedenfor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information (top-level Product fields) */}
          <section className="space-y-4 rounded-lg border bg-muted/40 p-4">
            <div>
              <h3 className="text-base font-semibold">
                Grunnleggende informasjon
              </h3>
              <p className="text-xs text-muted-foreground">
                Dette er feltene som brukes i produktkort, lister og SEO.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Modellnavn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceFrom">Pris fra (NOK) *</Label>
                <Input
                  id="priceFrom"
                  type="number"
                  value={
                    typeof formData.priceFrom === "number"
                      ? formData.priceFrom
                      : formData.priceFrom || ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceFrom: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Farge</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="f.eks. hvit"
                />
              </div>
              <div className="space-y-2 flex items-center gap-2">
                <input
                  id="inStock"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={formData.inStock}
                  onChange={(e) =>
                    setFormData({ ...formData, inStock: e.target.checked })
                  }
                />
                <Label htmlFor="inStock">På lager</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beskrivelse *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installation">Installasjon</Label>
              <Textarea
                id="installation"
                value={formData.installation || ""}
                onChange={(e) =>
                  setFormData({ ...formData, installation: e.target.value })
                }
                rows={2}
              />
            </div>
          </section>

          {/* Images */}
          <ImageUpload
            images={formData.images || []}
            onChange={(images) => setFormData({ ...formData, images })}
            productId={product?.id}
            onFilesSelected={handleImageFiles}
          />

          {/* Array Fields */}
          <ArrayField
            label="Funksjoner"
            values={formData.features || []}
            onChange={(values) =>
              setFormData({ ...formData, features: values })
            }
            placeholder="Legg til funksjon..."
          />

          <ArrayField
            label="Ideelt for"
            values={formData.ideal || []}
            onChange={(values) => setFormData({ ...formData, ideal: values })}
            placeholder="Legg til bruksområde..."
          />

          <ArrayField
            label="Sertifiseringer"
            values={formData.certifications || []}
            onChange={(values) =>
              setFormData({ ...formData, certifications: values })
            }
            placeholder="Legg til sertifisering..."
          />

          {/* Specs (nested Product.specs fields) */}
          <section className="space-y-4 rounded-lg border bg-muted/40 p-4">
            <div>
              <h3 className="text-base font-semibold">
                Tekniske spesifikasjoner
              </h3>
              <p className="text-xs text-muted-foreground">
                Fyll inn tekniske verdier. Alle spesifikasjoner er valgfrie og
                kan fylles inn senere ved behov.
              </p>
            </div>

            {/* Core specs (anbefalt, men ikke påkrevd) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phase">Fase</Label>
                <Input
                  id="phase"
                  value={formData.phase}
                  onChange={(e) =>
                    setFormData({ ...formData, phase: e.target.value })
                  }
                />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="powerOptions-core">Effektalternativer (kW) *</Label>
                <Input
                  id="powerOptions-core"
                  value={
                  Array.isArray(specs?.powerOptions)
                    ? (specs.powerOptions as number[]).join(", ")
                    : (specs?.powerOptions as string) ?? ""
                  }
                  onChange={(e) =>
                    handleSpecsChange(
                      "powerOptions",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                  placeholder="f.eks. 9, 12, 15, 18"
                />
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="flowRates-core">Vannstrøm (L/min) *</Label>
                <Input
                  id="flowRates-core"
                  value={formData.specs?.flowRates?.join(", ") || ""}
                  onChange={(e) =>
                    handleSpecsChange(
                      "flowRates",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                  placeholder="f.eks. 6, 7, 9, 11, 13"
                />
              </div> */}
            </div>

            {/* Extended specs (all optional) */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Øvrige spesifikasjoner (valgfrie)
              </h4>

              <ArrayField
                label="Vannstrøm (L/min)"
                required={false}
                values={toStringArray(specs?.flowRates)}
                onChange={(values) => handleSpecsChange("flowRates", values)}
                placeholder="Legg til vannstrøm..."
              />

              <ArrayField
                label="Effektalternativer (kW)"
                required={false}
                values={toStringArray(specs?.powerOptions)}
                onChange={(values) => handleSpecsChange("powerOptions", values)}
                placeholder="Legg til effekt..."
              />

              <div className="space-y-2">
                <Label htmlFor="voltage-spec">Spenning (V)</Label>
                <Input
                  id="voltage-spec"
                  value={
                    Array.isArray(specs?.voltage)
                      ? (specs.voltage as string[]).join(", ")
                      : (specs?.voltage as string) || ""
                  }
                  onChange={(e) =>
                    handleSpecsChange(
                      "voltage",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                />
              </div>

              <ArrayField
                label="Strøm (A)"
                values={toStringArray(specs?.current)}
                onChange={(values) => handleSpecsChange("current", values)}
                placeholder="Legg til strøm..."
              />

              <div className="space-y-2">
                <Label htmlFor="circuitBreaker">Vernbryter (A)</Label>
                <Input
                  id="circuitBreaker"
                  value={(specs?.circuitBreaker as string) || ""}
                  onChange={(e) =>
                    handleSpecsChange("circuitBreaker", e.target.value)
                  }
                  placeholder="f.eks. 25 A, 32 A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyClass">Beskyttelsesklasse</Label>
                <Input
                  id="safetyClass"
                  value={(specs?.safetyClass as string) || ""}
                  onChange={(e) =>
                    handleSpecsChange("safetyClass", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempRange">Temperaturområde (°C)</Label>
                <Input
                  id="tempRange"
                  value={(specs?.tempRange as string) || ""}
                  onChange={(e) =>
                    handleSpecsChange("tempRange", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overheatProtection">
                  Overopphetingsvern (°C)
                </Label>
                <Input
                  id="overheatProtection"
                  value={
                    specs?.overheatProtection != null
                      ? String(specs.overheatProtection)
                      : ""
                  }
                  onChange={(e) =>
                    handleSpecsChange("overheatProtection", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingPressure">Arbeidstrykk (bar)</Label>
                <Input
                  id="workingPressure"
                  value={
                    specs?.workingPressure != null
                      ? String(specs.workingPressure)
                      : ""
                  }
                  onChange={(e) =>
                    handleSpecsChange("workingPressure", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Mål (HxBxD mm)</Label>
                <Input
                  id="dimensions"
                  value={
                    Array.isArray(specs?.dimensions)
                      ? (specs.dimensions as string[]).join(", ")
                      : (specs?.dimensions as string) || ""
                  }
                  onChange={(e) =>
                    handleSpecsChange(
                      "dimensions",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Vekt (kg)</Label>
                <Input
                  id="weight"
                  value={(specs?.weight as string) || ""}
                  onChange={(e) => handleSpecsChange("weight", e.target.value)}
                />
              </div>

              <ArrayField
                label="Anbefalt kabeltykkelse (mm²)"
                values={toStringArray(specs?.connectionWire)}
                onChange={(values) =>
                  handleSpecsChange("connectionWire", values)
                }
                placeholder="Legg til kabeltykkelse..."
              />

              <div className="space-y-2">
                <Label htmlFor="pipeSize">Anbefalt rørdimensjon (mm)</Label>
                <Input
                  id="pipeSize"
                  value={
                    Array.isArray(specs?.pipeSize)
                      ? (specs.pipeSize as string[]).join(", ")
                      : (specs?.pipeSize as string) || ""
                  }
                  onChange={(e) =>
                    handleSpecsChange(
                      "pipeSize",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                />
              </div>

              <ArrayField
                label="Tankkapasitet (L)"
                values={toStringArray(specs?.tankCapacity)}
                onChange={(values) => handleSpecsChange("tankCapacity", values)}
                placeholder="Legg til kapasitet..."
              />

              <div className="space-y-2">
                <Label htmlFor="efficiency">Energieffektivitet (%)</Label>
                <Input
                  id="efficiency"
                  value={
                    specs?.efficiency != null ? String(specs.efficiency) : ""
                  }
                  onChange={(e) =>
                    handleSpecsChange("efficiency", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thermalCutoff">Termisk utkobling (°C)</Label>
                <Input
                  id="thermalCutoff"
                  value={String(specs?.thermalCutoff ?? "")}
                  onChange={(e) =>
                    handleSpecsChange("thermalCutoff", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Materiale</Label>
                <Input
                  id="material"
                  value={(specs?.material as string) || ""}
                  onChange={(e) =>
                    handleSpecsChange("material", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compressor">Kompressor</Label>
                <Input
                  id="compressor"
                  value={(specs?.compressor as string) || ""}
                  onChange={(e) =>
                    handleSpecsChange("compressor", e.target.value)
                  }
                />
              </div>

              <ArrayField
                label="Vannstrøm ved 40°C"
                values={toStringArray(specs?.flowAt40C)}
                onChange={(values) => handleSpecsChange("flowAt40C", values)}
                placeholder="Legg til vannstrøm..."
              />
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {product ? "Oppdaterer..." : "Legger til..."}
                </>
              ) : product ? (
                "Oppdater produkt"
              ) : (
                "Legg til produkt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
