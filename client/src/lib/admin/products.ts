// src/lib/admin/products.ts
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import type { Product } from "@/types/product";

const PRODUCTS_COLLECTION = "products";

/**
 * Get all products (for admin)
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    const products: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Add a new product
 */
export async function addProduct(
  product: Omit<Product, "id">,
  productId?: string
): Promise<string> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    
    if (productId) {
      // Use setDoc to create with a specific ID
      const productRef = doc(db, PRODUCTS_COLLECTION, productId);
      await setDoc(productRef, { ...product, id: productId });
      return productId;
    } else {
      // Use addDoc to let Firestore generate the ID
      const docRef = await addDoc(productsRef, product);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, "id">>
): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, updates);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

