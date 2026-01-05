// src/lib/api.ts
import {
  ChatRequest,
  ChatResponse,
  ErrorResponse,
  SSEEvent,
  ApiMessage,
  createErrorResponse,
} from "@/shared/types/chat";

type ApiResponse =
  | { type: "stream"; message: ApiMessage | null; metadata: unknown[] | null }
  | {
      type: "error";
      error: ErrorResponse;
      status?: number;
      statusText?: string;
      errorData?: unknown;
      originalError?: string;
    }
  | { type: "response"; message: ApiMessage }
  | null;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* --------------------------------------------------------------
   LOGGING – Write messages and user queries to JSON file
   -------------------------------------------------------------- */
async function logChatToFile(
  payload: ChatRequest,
  correlationId: string,
  apiResponse?: ApiResponse
): Promise<void> {
  // Skip logging in production (Vercel)
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    // Extract user query (last user message)
    const userMessages = payload.messages.filter((msg) => msg.role === "user");
    const userQuery = userMessages[userMessages.length - 1]?.content || "";

    const logData = {
      timestamp: new Date().toISOString(),
      correlationId,
      userQuery,
      request: {
        messages: payload.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      },
      response: apiResponse || null,
    };

    // Call the logging API route
    const response = await fetch("/api/log-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("❌ Failed to log chat to file:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return;
    }

    const result = await response.json().catch(() => null);
  } catch (err) {
    // Log error but don't interrupt the main flow
    console.error("❌ Error logging chat to file:", err);
  }
}

/* --------------------------------------------------------------
   1. NON-STREAMING (existing) – kept for health-checks, etc.
   -------------------------------------------------------------- */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function postChat(
  payload: ChatRequest,
  options?: {
    signal?: AbortSignal;
    conversationId?: string | null;
    onConversationId?: (conversationId: string) => void;
  }
): Promise<ChatResponse> {
  const correlationId = crypto.randomUUID();
  const { signal, conversationId, onConversationId } = options || {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add X-Conversation-ID header if provided (optional - backend generates if not sent)
  if (conversationId) {
    headers["X-Conversation-ID"] = conversationId;
  }

  // Prepare payload - make IDs and timestamps optional (backend generates them)
  const apiPayload: ChatRequest = {
    messages: payload.messages.map((msg): ApiMessage => {
      const apiMsg: ApiMessage = {
        role: msg.role,
        content: msg.content,
      };
      // Include id and createdAt only if they exist (optional - backend generates them)
      if (msg.id) {
        apiMsg.id = msg.id;
      }
      if (msg.createdAt) {
        apiMsg.createdAt = msg.createdAt;
      }
      return apiMsg;
    }),
  };

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(apiPayload),
    signal,
  });

  // Capture conversation ID from response headers (backend generates it if not sent)
  const responseConversationId = res.headers.get("X-Conversation-ID");
  if (responseConversationId && onConversationId) {
    onConversationId(responseConversationId);
  }

  const responseData = await handleResponse<ChatResponse>(res);

  // Log the chat request and response
  await logChatToFile(payload, correlationId, {
    type: "response",
    message: responseData.message,
  });

  return responseData;
}

/* --------------------------------------------------------------
   2. STREAMING – Server-Sent Events (SSE)
   -------------------------------------------------------------- */

export interface StreamChatOptions {
  onMessage: (chunk: SSEEvent) => void;
  onError?: (error: ErrorResponse) => void;
  onComplete?: () => void;
  signal?: AbortSignal;
  correlationId?: string;
  conversationId?: string | null;
  onConversationId?: (conversationId: string) => void; // Callback when conversation ID is received from backend
}

export async function streamChat(
  payload: ChatRequest,
  {
    onMessage,
    onError,
    onComplete,
    signal,
    correlationId,
    conversationId,
    onConversationId,
  }: StreamChatOptions
): Promise<void> {
  const correlationIdToUse = correlationId || crypto.randomUUID();

  // Validate configuration before making request
  if (!API_BASE_URL) {
    const error = createErrorResponse(
      "API base URL is not configured. Please check your .env file.",
      "CONFIGURATION_ERROR",
      correlationIdToUse,
      "frontend"
    );
    onError?.(error);
    return;
  }

  const apiUrl = `${API_BASE_URL}/chat`;

  // Prepare payload - backend generates IDs and timestamps automatically if not provided
  // We include them if available (for backward compatibility), but they're optional
  const apiPayload: ChatRequest = {
    messages: payload.messages.map((msg): ApiMessage => {
      const apiMsg: ApiMessage = {
        role: msg.role,
        content: msg.content,
      };
      // Include id and createdAt only if they exist (optional - backend generates them)
      if (msg.id) {
        apiMsg.id = msg.id;
      }
      if (msg.createdAt) {
        apiMsg.createdAt = msg.createdAt;
      }
      return apiMsg;
    }),
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
    "X-Correlation-ID": correlationIdToUse,
  };

  // Add X-Conversation-ID header if provided
  if (conversationId) {
    headers["X-Conversation-ID"] = conversationId;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(apiPayload),
      signal,
    });

    // Capture conversation ID from response headers (backend generates it if not sent)
    const responseConversationId = res.headers.get("X-Conversation-ID");
    if (responseConversationId && onConversationId) {
      onConversationId(responseConversationId);
    }

    if (!res.ok) {
      // Try to parse error response from API
      let errorData: unknown = null;
      try {
        errorData = await res.json();
        // Check if it's an ErrorResponse format
        if (
          errorData &&
          typeof errorData === "object" &&
          "error_code" in errorData &&
          "error" in errorData
        ) {
          const errorObj = errorData as {
            error: string;
            error_code: string;
            correlation_id?: string;
            timestamp?: string;
            details?: { service: string; retry_after?: number };
          };

          const apiError: ErrorResponse = {
            type: "error",
            error: errorObj.error,
            error_code: errorObj.error_code,
            correlation_id: errorObj.correlation_id || correlationIdToUse,
            timestamp: errorObj.timestamp || new Date().toISOString(),
            details: errorObj.details || { service: "api" },
          };

          // Log the error response
          await logChatToFile(payload, correlationIdToUse, {
            type: "error",
            error: apiError,
            status: res.status,
          });

          onError?.(apiError);
          return;
        }
      } catch {
        // Not JSON, try text
      }

      // Fallback to text error - preserve full error details
      const txt = await res.text().catch(() => "");
      const errorMessage =
        txt || `HTTP ${res.status}: ${res.statusText || "Unknown error"}`;
      const errorResponseObj = createErrorResponse(
        errorMessage,
        "HTTP_ERROR",
        correlationIdToUse,
        "api"
      );

      // Log the error response
      await logChatToFile(payload, correlationIdToUse, {
        type: "error" as const,
        error: errorResponseObj,
        status: res.status,
        statusText: res.statusText,
        errorData,
      });

      onError?.(errorResponseObj);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Failed to get response reader");

    const decoder = new TextDecoder();
    let buffer = "";
    let finalMessage: ApiMessage | null = null;
    let metadata: unknown[] | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        // Handle both "data: " (with space) and "data:" (without space)
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr) as SSEEvent;

          // Only capture the "done" event which contains the final message
          if (data.type === "done") {
            finalMessage = data.message;
            metadata = data.metadata;
          }

          onMessage(data);
        } catch (err) {
          console.error("Error parsing SSE message:", err, "Raw:", jsonStr);
        }
      }
    }

    // Handle any remaining data
    if (buffer.trim()) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, "");
      if (jsonStr) {
        try {
          const data = JSON.parse(jsonStr) as SSEEvent;

          // Only capture the "done" event which contains the final message
          if (data.type === "done") {
            finalMessage = data.message;
            metadata = data.metadata;
          }

          onMessage(data);
        } catch (err) {
          console.error("Error parsing final SSE message:", err);
        }
      }
    }

    // Log the chat request and final message only
    await logChatToFile(payload, correlationIdToUse, {
      type: "stream",
      message: finalMessage,
      metadata: metadata,
    });

    onComplete?.();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    const correlationIdToUse = correlationId || crypto.randomUUID();

    // Preserve detailed error information
    let errorMessage = "En feil oppstod ved kommunikasjon med serveren.";
    let errorCode = "NETWORK_ERROR";

    if (err instanceof Error) {
      // Preserve the full error message instead of simplifying it
      errorMessage = err.message;

      if (err.message.includes("Failed to fetch")) {
        errorCode = "CONNECTION_ERROR";
        // Provide more context for connection errors
        errorMessage = `Kunne ikke koble til server. ${err.message}`;
      } else if (
        err.message.includes("NetworkError") ||
        err.message.includes("network")
      ) {
        errorCode = "NETWORK_ERROR";
      }

      console.error("❌ Network error:", {
        message: err.message,
        url: `${API_BASE_URL}/chat`,
        correlationId: correlationIdToUse,
        error: err,
      });
    } else {
      // For non-Error objects, convert to string but preserve details
      errorMessage = String(err);
    }

    const errorResponse = createErrorResponse(
      errorMessage,
      errorCode,
      correlationIdToUse,
      "network"
    );

    // Log the error response with full details
    await logChatToFile(payload, correlationIdToUse, {
      type: "error",
      error: errorResponse,
      originalError: err instanceof Error ? err.message : String(err),
      errorData: err instanceof Error ? { stack: err.stack } : undefined,
    });

    onError?.(errorResponse);
  }
}

// SSB API types for water pricing
export interface WaterPriceData {
  municipalities: Record<
    string,
    {
      name: string;
      waterPrice: number | null; // kr per m³
      wastewaterPrice: number | null; // kr per m³
    }
  >;
  averages: {
    waterPrice: number | null;
    wastewaterPrice: number | null;
  };
  metadata: {
    year: string;
    totalMunicipalities: number;
    source: string;
  };
}

interface SSBWaterPriceResponse {
  value?: (number | null)[];
  dimension?: {
    KOKkommuneregion0000?: {
      category?: {
        index?: Record<string, number>;
        label?: Record<string, string>;
      };
    };
    ContentsCode?: {
      category?: {
        index?: Record<string, number>;
        label?: Record<string, string>;
      };
    };
  };
  size?: number[];
}

// Gebyrsats per m3 vann – ekskl mva. (kr) - Price per m³ delivered water
// Gebyrsats per m3 avløp – ekskl. mva. (kr) - Price per m³ wastewater
export async function getWaterPrices(): Promise<WaterPriceData> {
  const query = {
    query: [
      {
        code: "KOKkommuneregion0000",
        selection: {
          filter: "agg_single:KOGkommuneregion000005402",
          values: [
            "3101",
            "3103",
            "3105",
            "3107",
            "3110",
            "3112",
            "3114",
            "3116",
            "3118",
            "3120",
            "3122",
            "3124",
            "3201",
            "3203",
            "3205",
            "3207",
            "3209",
            "3212",
            "3214",
            "3216",
            "3218",
            "3220",
            "3222",
            "3224",
            "3226",
            "3228",
            "3230",
            "3232",
            "3234",
            "3236",
            "3238",
            "3240",
            "3242",
            "0301",
            "3401",
            "3403",
            "3405",
            "3407",
            "3411",
            "3412",
            "3413",
            "3414",
            "3415",
            "3416",
            "3417",
            "3418",
            "3419",
            "3420",
            "3421",
            "3422",
            "3423",
            "3424",
            "3425",
            "3426",
            "3427",
            "3428",
            "3429",
            "3430",
            "3431",
            "3432",
            "3433",
            "3434",
            "3435",
            "3436",
            "3437",
            "3438",
            "3439",
            "3440",
            "3441",
            "3442",
            "3443",
            "3446",
            "3447",
            "3448",
            "3449",
            "3450",
            "3451",
            "3452",
            "3453",
            "3454",
            "3301",
            "3303",
            "3305",
            "3310",
            "3312",
            "3314",
            "3316",
            "3318",
            "3320",
            "3322",
            "3324",
            "3326",
            "3328",
            "3330",
            "3332",
            "3334",
            "3336",
            "3338",
            "3901",
            "3903",
            "3905",
            "3907",
            "3909",
            "3911",
            "4001",
            "4003",
            "4005",
            "4010",
            "4012",
            "4014",
            "4016",
            "4018",
            "4020",
            "4022",
            "4024",
            "4026",
            "4028",
            "4030",
            "4032",
            "4034",
            "4036",
            "4201",
            "4202",
            "4203",
            "4204",
            "4205",
            "4206",
            "4207",
            "4211",
            "4212",
            "4213",
            "4214",
            "4215",
            "4216",
            "4217",
            "4218",
            "4219",
            "4220",
            "4221",
            "4222",
            "4223",
            "4224",
            "4225",
            "4226",
            "4227",
            "4228",
            "1101",
            "1103",
            "1106",
            "1108",
            "1111",
            "1112",
            "1114",
            "1119",
            "1120",
            "1121",
            "1122",
            "1124",
            "1127",
            "1130",
            "1133",
            "1134",
            "1135",
            "1144",
            "1145",
            "1146",
            "1149",
            "1151",
            "1160",
            "4601",
            "4602",
            "4611",
            "4612",
            "4613",
            "4614",
            "4615",
            "4616",
            "4617",
            "4618",
            "4619",
            "4620",
            "4621",
            "4622",
            "4623",
            "4624",
            "4625",
            "4626",
            "4627",
            "4628",
            "4629",
            "4630",
            "4631",
            "4632",
            "4633",
            "4634",
            "4635",
            "4636",
            "4637",
            "4638",
            "4639",
            "4640",
            "4641",
            "4642",
            "4643",
            "4644",
            "4645",
            "4646",
            "4647",
            "4648",
            "4649",
            "4650",
            "4651",
            "1505",
            "1506",
            "1508",
            "1511",
            "1514",
            "1515",
            "1516",
            "1517",
            "1520",
            "1525",
            "1528",
            "1531",
            "1532",
            "1535",
            "1539",
            "1547",
            "1554",
            "1557",
            "1560",
            "1563",
            "1566",
            "1573",
            "1576",
            "1577",
            "1578",
            "1579",
            "1580",
            "5001",
            "5006",
            "5007",
            "5014",
            "5020",
            "5021",
            "5022",
            "5025",
            "5026",
            "5027",
            "5028",
            "5029",
            "5031",
            "5032",
            "5033",
            "5034",
            "5035",
            "5036",
            "5037",
            "5038",
            "5041",
            "5042",
            "5043",
            "5044",
            "5045",
            "5046",
            "5047",
            "5049",
            "5052",
            "5053",
            "5054",
            "5055",
            "5056",
            "5057",
            "5058",
            "5059",
            "5060",
            "5061",
            "1804",
            "1806",
            "1811",
            "1812",
            "1813",
            "1815",
            "1816",
            "1818",
            "1820",
            "1822",
            "1824",
            "1825",
            "1826",
            "1827",
            "1828",
            "1832",
            "1833",
            "1834",
            "1835",
            "1836",
            "1837",
            "1838",
            "1839",
            "1840",
            "1841",
            "1845",
            "1848",
            "1851",
            "1853",
            "1856",
            "1857",
            "1859",
            "1860",
            "1865",
            "1866",
            "1867",
            "1868",
            "1870",
            "1871",
            "1874",
            "1875",
            "5501",
            "5503",
            "5510",
            "5512",
            "5514",
            "5516",
            "5518",
            "5520",
            "5522",
            "5524",
            "5526",
            "5528",
            "5530",
            "5532",
            "5534",
            "5536",
            "5538",
            "5540",
            "5542",
            "5544",
            "5546",
            "5601",
            "5603",
            "5605",
            "5607",
            "5610",
            "5612",
            "5614",
            "5616",
            "5618",
            "5620",
            "5622",
            "5624",
            "5626",
            "5628",
            "5630",
            "5632",
            "5634",
            "5636",
            "2111",
            "EAK",
            "EAKUO",
          ],
        },
      },
      {
        code: "ContentsCode",
        selection: {
          filter: "item",
          values: ["KOSvannk30000", "KOSavlopk30000"], // Water and wastewater prices
        },
      },
      {
        code: "Tid",
        selection: {
          filter: "item",
          values: ["2025"],
        },
      },
    ],
    response: {
      format: "json-stat2",
    },
  };

  try {
    const res = await fetch("https://data.ssb.no/api/v0/no/table/12842", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    });

    if (!res.ok) {
      throw new Error(`SSB API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Parse the response to extract water and wastewater prices
    // Data structure: value array is flat, ordered by [municipality, contentCode, year]
    const municipalities = data.dimension?.KOKkommuneregion0000?.category;
    const contentCodes = data.dimension?.ContentsCode?.category;
    const values = data.value || [];

    if (!municipalities || !contentCodes) {
      throw new Error("Invalid data structure from SSB API");
    }

    const municipalityIndex = municipalities.index || {};
    const municipalityLabels = municipalities.label || {};
    const contentCodeIndex = contentCodes.index || {};
    const contentCodeLabels = contentCodes.label || {};

    // Get indices for water and wastewater
    const waterIndex = contentCodeIndex["KOSvannk30000"];
    const wastewaterIndex = contentCodeIndex["KOSavlopk30000"];

    // Calculate dimensions
    const numMunicipalities = data.size?.[0] || 0;
    const numContentCodes = data.size?.[1] || 0;
    const numYears = data.size?.[2] || 0;

    // Reorganize data: { municipalityCode: { name, waterPrice, wastewaterPrice } }
    const organizedData: Record<
      string,
      {
        name: string;
        waterPrice: number | null; // kr per m³
        wastewaterPrice: number | null; // kr per m³
      }
    > = {};

    // Parse values array
    // Formula: valueIndex = municipalityIndex * (numContentCodes * numYears) + contentCodeIndex * numYears + yearIndex
    for (const [municipalityCode, municipalityIdx] of Object.entries(
      municipalityIndex
    )) {
      const municipalityName =
        municipalityLabels[municipalityCode] || municipalityCode;

      // Calculate indices in the value array
      const waterValueIdx =
        (municipalityIdx as number) * (numContentCodes * numYears) +
        (waterIndex as number) * numYears +
        0; // year index (only 2025)

      const wastewaterValueIdx =
        (municipalityIdx as number) * (numContentCodes * numYears) +
        (wastewaterIndex as number) * numYears +
        0; // year index (only 2025)

      const waterPrice = values[waterValueIdx] ?? null;
      const wastewaterPrice = values[wastewaterValueIdx] ?? null;

      organizedData[municipalityCode] = {
        name: municipalityName,
        waterPrice: typeof waterPrice === "number" ? waterPrice : null,
        wastewaterPrice:
          typeof wastewaterPrice === "number" ? wastewaterPrice : null,
      };
    }

    // Calculate averages (excluding null values)
    const validWaterPrices = Object.values(organizedData)
      .map((d) => d.waterPrice)
      .filter((p): p is number => p !== null);
    const validWastewaterPrices = Object.values(organizedData)
      .map((d) => d.wastewaterPrice)
      .filter((p): p is number => p !== null);

    const averageWaterPrice =
      validWaterPrices.length > 0
        ? validWaterPrices.reduce((a, b) => a + b, 0) / validWaterPrices.length
        : null;
    const averageWastewaterPrice =
      validWastewaterPrices.length > 0
        ? validWastewaterPrices.reduce((a, b) => a + b, 0) /
          validWastewaterPrices.length
        : null;

    const result = {
      municipalities: organizedData,
      averages: {
        waterPrice: averageWaterPrice,
        wastewaterPrice: averageWastewaterPrice,
      },
      metadata: {
        year: "2025",
        totalMunicipalities: Object.keys(organizedData).length,
        source: "SSB (Statistisk sentralbyrå)",
      },
    };

    return result;
  } catch (error) {
    console.error("Error fetching water prices:", error);
    console.warn("Falling back to hard-coded average prices");

    // Fallback to hard-coded averages if API fails completely
    const fallbackAverages = {
      waterPrice: 22.735632183908052,
      wastewaterPrice: 26.506017191977115,
    };

    // Return fallback structure with empty municipalities but valid averages
    return {
      municipalities: {},
      averages: fallbackAverages,
      metadata: {
        year: "2025",
        totalMunicipalities: 0,
        source: "Fallback (SSB API unavailable)",
      },
    };
  }
}

// Get average water and wastewater prices across all municipalities
export async function getAverageWaterPrices() {
  const data = await getWaterPrices();
  return {
    averageWaterPrice: data.averages.waterPrice,
    averageWastewaterPrice: data.averages.wastewaterPrice,
  };
}

// Get prices for a specific municipality by code
export async function getWaterPricesByMunicipality(municipalityCode: string) {
  const data = await getWaterPrices();
  return data.municipalities[municipalityCode] || null;
}
