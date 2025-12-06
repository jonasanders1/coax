// src/lib/admin/faqs.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export type FaqContentSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string; to: string };

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  contentSegments?: FaqContentSegment[] | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const FAQS_COLLECTION = "faqs";

/**
 * Get all FAQs (for admin)
 */
export async function getAllFaqsAdmin(): Promise<FaqItem[]> {
  try {
    const faqsRef = collection(db, FAQS_COLLECTION);
    const q = query(faqsRef, orderBy("category"));
    const querySnapshot = await getDocs(q);

    const faqs: FaqItem[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as FaqItem[];

    // Sort by category, then by question
    faqs.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.question.localeCompare(b.question);
    });

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
}

/**
 * Get all unique categories
 */
export async function getAllCategories(): Promise<string[]> {
  try {
    const faqs = await getAllFaqsAdmin();
    const categories = Array.from(new Set(faqs.map((faq) => faq.category)));
    return categories.sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

/**
 * Add a new FAQ
 */
export async function addFaq(
  faq: Omit<FaqItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const faqsRef = collection(db, FAQS_COLLECTION);
    const faqData = {
      ...faq,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(faqsRef, faqData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding FAQ:", error);
    throw error;
  }
}

/**
 * Update an existing FAQ
 */
export async function updateFaq(
  faqId: string,
  faq: Partial<Omit<FaqItem, "id" | "createdAt">>
): Promise<void> {
  try {
    const faqRef = doc(db, FAQS_COLLECTION, faqId);
    await updateDoc(faqRef, {
      ...faq,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    throw error;
  }
}

/**
 * Delete an FAQ
 */
export async function deleteFaq(faqId: string): Promise<void> {
  try {
    const faqRef = doc(db, FAQS_COLLECTION, faqId);
    await deleteDoc(faqRef);
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    throw error;
  }
}

