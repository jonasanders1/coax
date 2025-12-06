/**
 * Input validation and sanitization utilities
 * Provides functions to validate and sanitize user input for security
 */

/**
 * Sanitizes a string by removing HTML tags and dangerous characters
 * Use this for text that will be displayed in HTML
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Sanitizes email by removing dangerous characters that could be used for header injection
 * Removes newlines, carriage returns, and null bytes
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";
  
  return email
    .replace(/[\r\n\0]/g, "") // Remove newlines, carriage returns, null bytes
    .trim()
    .toLowerCase();
}

/**
 * Sanitizes a string for use in email headers (subject, reply-to, etc.)
 * Prevents email header injection attacks
 */
export function sanitizeEmailHeader(header: string): string {
  if (!header) return "";
  
  return header
    .replace(/[\r\n]/g, "") // Remove newlines (key for header injection prevention)
    .replace(/[<>"\\]/g, "") // Remove potentially dangerous characters
    .slice(0, 200) // Limit length
    .trim();
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number (flexible format)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  
  // Allow digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s()+-]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 8;
}

/**
 * Validates that a number is within bounds
 */
export function validateNumberBounds(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validates and clamps a number input
 */
export function sanitizeNumberInput(
  input: string | number,
  min: number = Number.NEGATIVE_INFINITY,
  max: number = Number.POSITIVE_INFINITY,
  defaultValue: number = 0
): number {
  const num = typeof input === "string" ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    return defaultValue;
  }
  
  return validateNumberBounds(num, min, max);
}

/**
 * Truncates a string to a maximum length
 */
export function truncateString(input: string, maxLength: number): string {
  if (!input || input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}

/**
 * Removes leading/trailing whitespace and normalizes internal whitespace
 */
export function normalizeWhitespace(input: string): string {
  if (!input) return "";
  return input.trim().replace(/\s+/g, " ");
}

