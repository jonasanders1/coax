/**
 * Shared form submission utilities
 * Handles Web3Forms submission logic for both ContactForm and NeedsAssessmentForm
 */

import {
  sanitizeText,
  sanitizeEmail,
  sanitizeEmailHeader,
  normalizeWhitespace,
} from "@/shared/utils/inputValidation";

const WEB3FORMS_ACCESS_KEY = "a9c0ed65-714a-4a64-876b-e47b207198dd";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface NeedsAssessmentFormData extends ContactFormData {
  applicationArea?: string[];
  applicationAreaOther?: string;
  electricalSetup?: string;
  waterFlow?: string;
  waterFlowCustom?: string;
  usagePoints?: string[];
  usagePointsOther?: string;
  comments?: string;
}

export interface SubmissionOptions {
  formType?: "general" | "needs_assessment";
  subject?: string;
  successMessage?: string;
}

/**
 * Sanitizes contact form data
 */
export function sanitizeContactData(data: ContactFormData): {
  name: string;
  email: string;
  phone: string;
  message?: string;
} {
  return {
    name: sanitizeText(normalizeWhitespace(data.name)),
    email: sanitizeEmail(data.email),
    phone: data.phone ? normalizeWhitespace(data.phone) : "",
    message: data.message ? sanitizeText(data.message) : undefined,
  };
}

/**
 * Creates FormData for Web3Forms submission
 */
export function createFormData(
  data: ContactFormData | NeedsAssessmentFormData,
  options: SubmissionOptions = {}
): FormData {
  const sanitized = sanitizeContactData(data);
  const formData = new FormData();

  // Contact fields
  formData.append("Navn", sanitized.name);
  formData.append("E-post", sanitized.email);
  if (sanitized.phone) {
    formData.append("Telefonnr.", sanitized.phone);
  }
  if (sanitized.message) {
    formData.append("Melding", sanitized.message);
  }

  // Web3Forms required fields
  formData.append("access_key", WEB3FORMS_ACCESS_KEY);
  formData.append("from_name", "COAX nettside");
  formData.append("replyto", sanitizeEmailHeader(sanitized.email));
  
  // Subject line
  const subject =
    options.subject ||
    `${sanitized.name} har sendt en forespørsel via COAX.no`;
  formData.append("subject", sanitizeEmailHeader(subject));
  
  formData.append("botcheck", "");

  // Add assessment-specific fields
  if (options.formType === "needs_assessment") {
    const assessmentData = data as NeedsAssessmentFormData;
    
    formData.append("Type", "Behovsvurdering");
    
    if (assessmentData.applicationArea?.length) {
      formData.append(
        "Anvendelsesområde",
        JSON.stringify(assessmentData.applicationArea)
      );
    }
    if (assessmentData.applicationAreaOther) {
      formData.append(
        "Anvendelsesområde (annet)",
        sanitizeText(assessmentData.applicationAreaOther)
      );
    }
    
    if (assessmentData.electricalSetup) {
      formData.append("Elektrisk oppsett", assessmentData.electricalSetup);
    }

    
    if (assessmentData.waterFlow) {
      formData.append("Vannstrømbehov", assessmentData.waterFlow);
    }
    if (assessmentData.waterFlowCustom) {
      formData.append(
        "water_flow_custom",
        sanitizeText(assessmentData.waterFlowCustom)
      );
    }
    
    if (assessmentData.usagePoints?.length) {
      formData.append(
        "Brukspunkter",
        JSON.stringify(assessmentData.usagePoints)
      );
    }
    if (assessmentData.usagePointsOther) {
      formData.append(
        "Brukspunkter (annet)",
        sanitizeText(assessmentData.usagePointsOther)
      );
    }
    
    if (assessmentData.comments) {
      formData.append("Tilleggskommentar", sanitizeText(assessmentData.comments));
    }
  }

  return formData;
}

/**
 * Submits form data to Web3Forms
 */
export async function submitToWeb3Forms(
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return {
      success: result.success === true,
      message: result.message,
    };
  } catch (error) {
    console.error("Form submission error:", error);
    throw new Error("Network error during form submission");
  }
}

