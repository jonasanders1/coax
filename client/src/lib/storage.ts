// src/lib/storage.ts
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebaseConfig";

/**
 * Get download URL from Firebase Storage path
 * The filename can be anything - it doesn't matter what you name it
 * @param storagePath - Path to the file in Firebase Storage
 *   Examples:
 *   - "products/xfj-2/image1.jpg"
 *   - "products/xfj-2/random.doesNotMatter"
 *   - "products/xfj-2/any-filename-here.png"
 *   - "https://..." (already a URL, returned as-is)
 * @returns Promise resolving to the download URL, or empty string if not found
 */
export async function getStorageUrl(storagePath: string): Promise<string> {
  try {
    // If it's already a URL (starts with http), return it as-is
    if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
      return storagePath;
    }

    // Remove leading slash if present
    const cleanPath = storagePath.startsWith("/") ? storagePath.slice(1) : storagePath;
    
    const storageRef = ref(storage, cleanPath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    // Log warning but don't throw - return empty string so app doesn't break
    // This allows products to work even if some images are missing
    console.warn(`Could not get storage URL for path "${storagePath}":`, error);
    return "";
  }
}

/**
 * Get download URLs for multiple storage paths
 * Filters out any failed/empty URLs so products can still display even if some images fail
 * @param storagePaths - Array of storage paths (filename doesn't matter, any name works)
 * @returns Promise resolving to an array of download URLs (empty strings filtered out)
 */
export async function getStorageUrls(storagePaths: string[]): Promise<string[]> {
  try {
    const urlPromises = storagePaths.map((path) => getStorageUrl(path));
    const urls = await Promise.all(urlPromises);
    // Filter out empty strings (failed image loads) so products can still display
    return urls.filter((url) => url.length > 0);
  } catch (error) {
    console.error("Error getting storage URLs:", error);
    // Return empty array instead of throwing so app doesn't break
    return [];
  }
}

