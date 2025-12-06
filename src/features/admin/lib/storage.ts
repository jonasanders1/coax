// src/lib/admin/storage.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/firebaseConfig";

/**
 * Upload an image file to Firebase Storage
 * @param file - The file to upload
 * @param productId - The product ID (used in path)
 * @param imageNumber - The image number (1, 2, 3, etc.)
 * @returns Promise resolving to the storage path
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  imageNumber: number
): Promise<string> {
  try {
    // Convert to webp if needed (optional - you can keep original format)
    const fileName = `image${imageNumber}.webp`;
    const storagePath = `products/${productId}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Return the storage path (not the URL, as we'll convert it when needed)
    return storagePath;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

/**
 * Extract image number from storage path (e.g., "products/xfj-2/image3.webp" -> 3)
 */
function extractImageNumber(imagePath: string): number | null {
  const match = imagePath.match(/image(\d+)\.webp$/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Get the next available image number based on existing images
 * @param existingImages - Array of existing image paths
 * @returns The next available image number (starts at 1 if no images exist)
 */
function getNextImageNumber(existingImages: string[]): number {
  if (!existingImages || existingImages.length === 0) {
    return 1;
  }

  const imageNumbers = existingImages
    .map(extractImageNumber)
    .filter((num): num is number => num !== null);

  if (imageNumbers.length === 0) {
    return 1;
  }

  const maxNumber = Math.max(...imageNumbers);
  return maxNumber + 1;
}

/**
 * Upload multiple images for a product
 * @param files - Array of files to upload
 * @param productId - The product ID
 * @param existingImages - Optional array of existing image paths to determine next image number
 * @returns Promise resolving to array of storage paths
 */
export async function uploadProductImages(
  files: File[],
  productId: string,
  existingImages?: string[]
): Promise<string[]> {
  try {
    const startNumber = getNextImageNumber(existingImages || []);
    const uploadPromises = files.map((file, index) =>
      uploadProductImage(file, productId, startNumber + index)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
}

/**
 * Delete an image from Firebase Storage
 * @param storagePath - The storage path to delete
 */
export async function deleteProductImage(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

