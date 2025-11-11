"use client";

/**
 * Shared hook for form input sanitization
 */

import { useCallback } from "react";
import { sanitizeEmail } from "@/utils/inputValidation";

export function useFormInput() {
  const sanitizeInput = useCallback(
    (name: string, value: string): string => {
      if (name === "email") {
        return sanitizeEmail(value.slice(0, 254));
      } else if (name === "phone") {
        return value.slice(0, 20);
      } else if (name === "name") {
        // Allow spaces during typing, only normalize multiple consecutive spaces
        // Don't trim while typing - only normalize internal whitespace
        return value
          .slice(0, 100)
          .replace(/\s+/g, " "); // Replace multiple spaces with single space
      } else if (name === "message" || name === "comments") {
        return value.slice(0, name === "comments" ? 2000 : 5000);
      }
      return value;
    },
    []
  );

  return { sanitizeInput };
}

