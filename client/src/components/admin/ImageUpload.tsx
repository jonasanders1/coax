"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { getStorageUrl } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  productId?: string;
  onFilesSelected?: (files: File[]) => void;
}

export default function ImageUpload({
  images,
  onChange,
  productId,
  onFilesSelected,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preview URLs for existing images
  useEffect(() => {
    const loadPreviews = async () => {
      const previews: Record<number, string> = {};
      for (let i = 0; i < images.length; i++) {
        try {
          const url = await getStorageUrl(images[i]);
          if (url) {
            previews[i] = url;
          }
        } catch (error) {
          console.error(`Error loading preview for image ${i}:`, error);
        }
      }
      setPreviewUrls(previews);
    };
    if (images.length > 0) {
      loadPreviews();
    }
  }, [images]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    if (productId) {
      // Product exists, upload immediately
      setUploading(true);
      try {
        const { uploadProductImages } = await import("@/lib/admin/storage");
        // Pass existing images to determine next image number
        const storagePaths = await uploadProductImages(fileArray, productId, images);
        onChange([...images, ...storagePaths]);
      } catch (error) {
        console.error("Error uploading images:", error);
        alert("Kunne ikke laste opp bilder. Prøv igjen.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      // New product - store files for later upload
      if (onFilesSelected) {
        onFilesSelected(fileArray);
      }
      // Create preview URLs for the files (temporary object URLs)
      const newPreviews: Record<number, string> = { ...previewUrls };
      fileArray.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        // Store preview at a negative index to differentiate from real images
        newPreviews[-(images.length + index + 1)] = url;
      });
      setPreviewUrls(newPreviews);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    const newPreviews = { ...previewUrls };
    delete newPreviews[index];
    // Reindex remaining previews
    const reindexed: Record<number, string> = {};
    newImages.forEach((_, i) => {
      if (previewUrls[i] !== undefined) {
        reindexed[i] = previewUrls[i];
      }
    });
    setPreviewUrls(reindexed);
  };

  const handleRemoveAndDelete = async (index: number, storagePath: string) => {
    try {
      if (productId) {
        const { deleteProductImage } = await import("@/lib/admin/storage");
        await deleteProductImage(storagePath);
      }
      handleRemove(index);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from UI even if deletion fails
      handleRemove(index);
    }
  };

  // Get all preview URLs (both real images and pending files)
  const allPreviews = Object.entries(previewUrls)
    .filter(([key]) => parseInt(key) >= 0)
    .map(([key, url]) => ({ index: parseInt(key), url }));
  
  const pendingPreviews = Object.entries(previewUrls)
    .filter(([key]) => parseInt(key) < 0)
    .map(([key, url]) => ({ index: Math.abs(parseInt(key)) - 1, url }));

  return (
    <div className="space-y-2">
      <Label>Bilder</Label>
      {(images.length > 0 || pendingPreviews.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((imagePath, index) => {
            const previewUrl = previewUrls[index];
            return (
              <div key={index} className="relative group">
                <div className="aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveAndDelete(index, imagePath)}
                  aria-label={`Fjern bilde ${index + 1}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Badge
                  variant="secondary"
                  className="absolute bottom-2 left-2 text-xs"
                >
                  {imagePath.split("/").pop()}
                </Badge>
              </div>
            );
          })}
          {pendingPreviews.map(({ index, url }) => (
            <div key={`pending-${index}`} className="relative group">
              <div className="aspect-square border-2 border-dashed border-primary rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={url}
                  alt={`Pending image ${index + 1}`}
                  className="w-full h-full object-cover opacity-75"
                />
              </div>
              <Badge
                variant="outline"
                className="absolute bottom-2 left-2 text-xs"
              >
                Ventende...
              </Badge>
            </div>
          ))}
        </div>
      )}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <Label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={uploading}
            aria-label={uploading ? "Laster opp bilder" : "Last opp nye bilder"}
          >
            <span>
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              {uploading ? "Laster opp..." : "Last opp bilder"}
            </span>
          </Button>
        </Label>
      </div>
    </div>
  );
}

