// src/lib/products.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import type { Product } from "@/shared/types/product";
import { getStorageUrls } from "@/shared/lib/storage";

// Collection name for products
const PRODUCTS_COLLECTION = "products";

/**
 * Convert product image paths to storage URLs
 * Handles both Firebase Storage paths and existing URLs
 */
async function processProductImages(images: string[] | undefined): Promise<string[]> {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }

  try {
    // Filter out any falsy values and check if they're already URLs
    const validImages = images.filter(Boolean);
    
    // If all images are already URLs, return them as-is
    const allAreUrls = validImages.every(
      (img) => img.startsWith("http://") || img.startsWith("https://")
    );
    
    if (allAreUrls) {
      return validImages;
    }

    // Convert storage paths to URLs
    return await getStorageUrls(validImages);
  } catch (error) {
    console.error("Error processing product images:", error);
    // Return empty array on error to prevent breaking the app
    return [];
  }
}

/**
 * Get all products from Firestore
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("model"));
    const querySnapshot = await getDocs(q);
    
    const products: Product[] = [];
    
    // Process all products and convert image paths to URLs
    const productPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const product = {
        id: doc.id,
        ...data,
      } as Product;
      
      // Convert image paths to storage URLs
      if (product.images) {
        product.images = await processProductImages(product.images);
      }
      
      return product;
    });
    
    const processedProducts = await Promise.all(productPromises);
    products.push(...processedProducts);
    
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Get a single product by ID from Firestore
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const product = {
        id: productSnap.id,
        ...productSnap.data(),
      } as Product;
      
      // Convert image paths to storage URLs
      if (product.images) {
        product.images = await processProductImages(product.images);
      }
      
      return product;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

/**
 * Get products by category from Firestore
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    return products.filter((product) => product.category === category);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
}

