// src/lib/faqs.ts
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export type FaqContentSegment =
  | { kind: "text"; value: string }
  | { kind: "link"; value: string; to: string };

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  contentSegments?: FaqContentSegment[] | null;
};

export type FaqCategory = {
  category: string;
  questions: FaqItem[];
};

const FAQS_COLLECTION = "faqs";

/**
 * Get all FAQs from Firestore, grouped by category
 */
export async function getAllFaqs(): Promise<FaqCategory[]> {
  try {
    const faqsRef = collection(db, FAQS_COLLECTION);
    const q = query(faqsRef, orderBy("category"));
    const querySnapshot = await getDocs(q);

    const faqs: FaqItem[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      question: doc.data().question,
      answer: doc.data().answer,
      category: doc.data().category,
      contentSegments: doc.data().contentSegments || null,
    })) as FaqItem[];

    // Sort FAQs by question within each category
    faqs.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.question.localeCompare(b.question);
    });

    // Group by category
    const categoryMap = new Map<string, FaqItem[]>();
    for (const faq of faqs) {
      if (!categoryMap.has(faq.category)) {
        categoryMap.set(faq.category, []);
      }
      categoryMap.get(faq.category)!.push(faq);
    }

    // Convert to array format
    const categories: FaqCategory[] = Array.from(categoryMap.entries()).map(
      ([category, questions]) => ({
        category,
        questions,
      })
    );

    return categories;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
}

