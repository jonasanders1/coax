"use client";

import { useState, useEffect } from "react";
import { addProduct, updateProduct } from "@/lib/admin/products";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ArrayField from "./ArrayField";
import ImageUpload from "./ImageUpload";
import { uploadProductImages } from "@/lib/admin/storage";

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
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "",
    phase: "",
    priceFrom: "",
    description: "",
    images: [],
    features: [],
    ideal: [],
    certifications: [],
    specs: {},
  });
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        phase: product.phase || "",
        voltage: product.voltage || "",
        priceFrom: product.priceFrom || "",
        description: product.description || "",
        images: product.images || [],
        features: product.features || [],
        ideal: product.ideal || [],
        certifications: product.certifications || [],
        specs: product.specs || {},
        installation: product.installation || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert priceFrom to number if it's a string
      const priceFromValue =
        typeof formData.priceFrom === "string"
          ? parseFloat(String(formData.priceFrom)) || 0
          : formData.priceFrom || 0;

      let productId = product?.id;

      // Create or update product
      if (product) {
        // Update existing product
        const productData = {
          ...formData,
          priceFrom: priceFromValue,
        };
        await updateProduct(product.id, productData);
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
              description: "Produktet ble oppdatert, men noen bilder kunne ikke lastes opp.",
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

        const productData = {
          ...formData,
          priceFrom: priceFromValue,
          images: [], // Will be updated after upload
        };

        // Add product to Firestore with the generated ID
        productId = generatedId;
        await addProduct(productData as Omit<Product, "id">, generatedId);

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
              description: "Produktet ble lagt til, men noen bilder kunne ikke lastes opp.",
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

  const handleSpecsChange = (field: string, value: any) => {
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn *</Label>
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
              <Label htmlFor="phase">Fase *</Label>
              <Input
                id="phase"
                value={formData.phase}
                onChange={(e) =>
                  setFormData({ ...formData, phase: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceFrom">Pris fra *</Label>
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
              <Label htmlFor="voltage">Spenning</Label>
              <Input
                id="voltage"
                value={
                  Array.isArray(formData.voltage)
                    ? formData.voltage.join(", ")
                    : formData.voltage || ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    voltage: e.target.value.split(",").map((v) => v.trim()),
                  })
                }
              />
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
            onChange={(values) => setFormData({ ...formData, features: values })}
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

          {/* Specs */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Spesifikasjoner</h3>

            <ArrayField
              label="Vannstrøm (L/min)"
              values={(formData.specs?.flowRates as string[]) || []}
              onChange={(values) =>
                handleSpecsChange("flowRates", values)
              }
              placeholder="Legg til vannstrøm..."
            />

            <ArrayField
              label="Effektalternativer"
              values={(formData.specs?.powerOptions as string[]) || []}
              onChange={(values) =>
                handleSpecsChange("powerOptions", values)
              }
              placeholder="Legg til effekt..."
            />

            <div className="space-y-2">
              <Label htmlFor="voltage-spec">Spenning (V)</Label>
              <Input
                id="voltage-spec"
                value={
                  Array.isArray(formData.specs?.voltage)
                    ? formData.specs.voltage.join(", ")
                    : formData.specs?.voltage || ""
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
              values={(formData.specs?.current as string[]) || []}
              onChange={(values) => handleSpecsChange("current", values)}
              placeholder="Legg til strøm..."
            />

            <ArrayField
              label="Sikringskrav (A)"
              values={(formData.specs?.fuse as string[]) || []}
              onChange={(values) => handleSpecsChange("fuse", values)}
              placeholder="Legg til sikring..."
            />

            <div className="space-y-2">
              <Label htmlFor="safetyClass">Beskyttelsesklasse</Label>
              <Input
                id="safetyClass"
                value={formData.specs?.safetyClass || ""}
                onChange={(e) =>
                  handleSpecsChange("safetyClass", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempRange">Temperaturområde (°C)</Label>
              <Input
                id="tempRange"
                value={formData.specs?.tempRange || ""}
                onChange={(e) =>
                  handleSpecsChange("tempRange", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overheatProtection">Overopphetingsvern</Label>
              <Input
                id="overheatProtection"
                value={formData.specs?.overheatProtection || ""}
                onChange={(e) =>
                  handleSpecsChange("overheatProtection", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingPressure">Arbeidstrykk (bar)</Label>
              <Input
                id="workingPressure"
                value={formData.specs?.workingPressure || ""}
                onChange={(e) =>
                  handleSpecsChange("workingPressure", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Mål (H×B×D mm)</Label>
              <Input
                id="dimensions"
                value={
                  Array.isArray(formData.specs?.dimensions)
                    ? formData.specs.dimensions.join(", ")
                    : formData.specs?.dimensions || ""
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
                value={formData.specs?.weight || ""}
                onChange={(e) => handleSpecsChange("weight", e.target.value)}
              />
            </div>

            <ArrayField
              label="Anbefalt kabeltykkelse"
              values={(formData.specs?.connectionWire as string[]) || []}
              onChange={(values) =>
                handleSpecsChange("connectionWire", values)
              }
              placeholder="Legg til kabeltykkelse..."
            />

            <div className="space-y-2">
              <Label htmlFor="pipeSize">Anbefalt rørdimensjon</Label>
              <Input
                id="pipeSize"
                value={
                  Array.isArray(formData.specs?.pipeSize)
                    ? formData.specs.pipeSize.join(", ")
                    : formData.specs?.pipeSize || ""
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
              values={(formData.specs?.tankCapacity as string[]) || []}
              onChange={(values) =>
                handleSpecsChange("tankCapacity", values)
              }
              placeholder="Legg til kapasitet..."
            />

            <div className="space-y-2">
              <Label htmlFor="efficiency">Energieffektivitet (%)</Label>
              <Input
                id="efficiency"
                value={formData.specs?.efficiency || ""}
                onChange={(e) =>
                  handleSpecsChange("efficiency", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pressureResistance">Trykkbestandighet</Label>
              <Input
                id="pressureResistance"
                value={formData.specs?.pressureResistance || ""}
                onChange={(e) =>
                  handleSpecsChange("pressureResistance", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Materiale</Label>
              <Input
                id="material"
                value={formData.specs?.material || ""}
                onChange={(e) => handleSpecsChange("material", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compressor">Kompressor</Label>
              <Input
                id="compressor"
                value={formData.specs?.compressor || ""}
                onChange={(e) =>
                  handleSpecsChange("compressor", e.target.value)
                }
              />
            </div>

            <ArrayField
              label="Vannstrøm ved 40°C"
              values={(formData.specs?.flowAt40C as string[]) || []}
              onChange={(values) => handleSpecsChange("flowAt40C", values)}
              placeholder="Legg til vannstrøm..."
            />
          </div>

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
