/**
 * Shared form submission utilities
 * Handles Web3Forms submission logic for both ContactForm and NeedsAssessmentForm
 */

import {
  sanitizeEmail,
  sanitizeEmailHeader,
  sanitizeForEmail,
  normalizeWhitespace,
} from "@/shared/utils/inputValidation";
import { ELECTRICAL_OPTIONS } from "@/config/needsAssessmentConfig";

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
 * Sanitizes contact form data for email submission
 */
export function sanitizeContactData(data: ContactFormData): {
  name: string;
  email: string;
  phone: string;
  message?: string;
} {
  return {
    name: sanitizeForEmail(normalizeWhitespace(data.name)),
    email: sanitizeEmail(data.email),
    phone: data.phone ? normalizeWhitespace(data.phone) : "",
    message: data.message ? sanitizeForEmail(data.message) : undefined,
  };
}

/**
 * Resolves the electrical setup value to its human-readable label
 */
function getElectricalLabel(value: string): string {
  const option = ELECTRICAL_OPTIONS.find((o) => o.value === value);
  return option ? option.label : value;
}

/**
 * Creates a JSON payload for Web3Forms submission.
 * Uses JSON with explicit Content-Type to ensure proper UTF-8 encoding
 * for Norwegian characters in field names and values.
 */
export function createSubmissionPayload(
  data: ContactFormData | NeedsAssessmentFormData,
  options: SubmissionOptions = {}
): Record<string, string> {
  const sanitized = sanitizeContactData(data);

  const subject =
    options.subject ||
    `${sanitized.name} har sendt en forespørsel via COAX.no`;

  const payload: Record<string, string> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    from_name: "COAX nettside",
    replyto: sanitizeEmailHeader(sanitized.email),
    subject: sanitizeEmailHeader(subject),
    botcheck: "",
    Navn: sanitized.name,
    "E-post": sanitized.email,
  };

  if (sanitized.phone) {
    payload["Telefonnr."] = sanitized.phone;
  }
  if (sanitized.message) {
    payload["Melding"] = sanitized.message;
  }

  // Add assessment-specific fields
  if (options.formType === "needs_assessment") {
    const assessmentData = data as NeedsAssessmentFormData;

    payload["Type"] = "Behovsvurdering";

    if (assessmentData.applicationArea?.length) {
      payload["Anvendelsesomraade"] = assessmentData.applicationArea.join(", ");
    }
    if (assessmentData.applicationAreaOther) {
      payload["Anvendelsesomraade (annet)"] = sanitizeForEmail(
        assessmentData.applicationAreaOther
      );
    }

    if (assessmentData.electricalSetup) {
      payload["Elektrisk oppsett"] = getElectricalLabel(
        assessmentData.electricalSetup
      );
    }

    if (assessmentData.waterFlow) {
      payload["Vannstrombehov"] = assessmentData.waterFlow;
    }
    if (assessmentData.waterFlowCustom) {
      payload["Vannstrom (egendefinert)"] = sanitizeForEmail(
        assessmentData.waterFlowCustom
      );
    }

    if (assessmentData.usagePoints?.length) {
      payload["Brukspunkter"] = assessmentData.usagePoints.join(", ");
    }
    if (assessmentData.usagePointsOther) {
      payload["Brukspunkter (annet)"] = sanitizeForEmail(
        assessmentData.usagePointsOther
      );
    }

    if (assessmentData.comments) {
      payload["Tilleggskommentar"] = sanitizeForEmail(assessmentData.comments);
    }
  }

  return payload;
}

/**
 * Submits form data to Web3Forms as JSON with proper UTF-8 encoding
 */
export async function submitToWeb3Forms(
  payload: Record<string, string>
): Promise<{ success: boolean; message?: string; quotaExceeded?: boolean }> {
  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      return { success: false, quotaExceeded: true };
    }

    const result = await response.json();

    const isQuotaError =
      !result.success &&
      typeof result.message === "string" &&
      /quota|limit|exceeded|too many/i.test(result.message);

    return {
      success: result.success === true,
      message: result.message,
      quotaExceeded: isQuotaError,
    };
  } catch (error) {
    console.error("Form submission error:", error);
    throw new Error("Network error during form submission");
  }
}

export const QUOTA_EXCEEDED_TITLE = "Skjemaet er midlertidig utilgjengelig";
export const QUOTA_EXCEEDED_DESCRIPTION =
  "Vi har mottatt mange henvendelser. Kontakt oss direkte på post@coax.no eller ring 977 32 838.";
