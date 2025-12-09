# CoaxAPIError - Complete Error Documentation

This document explains all the different errors that can occur in the COAX RAG API, organized by error type.

## Error Hierarchy

All errors inherit from `CoaxAPIError`, which provides a unified error response format:

```python
{
    "error": "Error message in Norwegian",
    "error_code": "ERROR_CODE",
    "correlation_id": "uuid",
    "timestamp": "ISO 8601 timestamp",
    "details": {
        "service": "service_name",
        "retry_after": 300,  // Optional, in seconds
        // ... additional details
    }
}
```

---

## 1. ValidationError (HTTP 400)

**Service:** `validation`  
**Default Status Code:** `400`

Errors related to request validation and input validation.

### Error Codes:

#### `VALIDATION_ERROR` (Default)
- **When:** Generic validation error, typically from FastAPI request validation
- **Message:** "Ugyldig forespørselformat. Vennligst sjekk forespørselstrukturen din."
- **Location:** `main.py:503` - FastAPI RequestValidationError handler

#### `REQUEST_TOO_LARGE`
- **When:** Request body exceeds maximum size limit (50KB)
- **Message:** "Forespørselen er for stor. Maksimal størrelse: {max}KB (fikk {actual}KB)"
- **Location:** `main.py:626-629`
- **Details:** Includes request size information

#### `MISSING_QUERY`
- **When:** No user message/query provided in the chat request
- **Message:** "Ingen brukermelding oppgitt"
- **Location:** `main.py:635`

#### `PROMPT_INJECTION_DETECTED`
- **When:** Prompt injection attempt detected by the prompt guard
- **Message:** Custom message from prompt guard, or "Forespørselen inneholder innhold som ikke kan behandles."
- **Location:** `main.py:642`
- **Details:** May include information about the detected injection pattern

---

## 2. BedrockError (HTTP 500)

**Service:** `bedrock`  
**Default Status Code:** `500`

Errors from AWS Bedrock service (LLM/embedding service).

### Error Codes:

#### `BEDROCK_INIT_ERROR`
- **When:** Failed to initialize Bedrock LLM service
- **Message:** "Kunne ikke initialisere AI-tjenesten"
- **Location:** `rag/engine.py:328-331`
- **Details:** May include original error information

---

## 3. VectorStoreError (HTTP 500/403/404/504)

**Service:** `pinecone`  
**Default Status Code:** `500` (varies by error type)

Errors from Pinecone vector store service.

### Error Codes:

#### `PINECONE_AUTH` (HTTP 403)
- **When:** Authentication/authorization failure with Pinecone
- **Message:** "Tilgang til søketjenesten ble avslått. Sjekk at API-nøkkelen er korrekt." or "Tilgang til søketjenesten ble avslått"
- **Location:** `rag/index.py:51-56, 201-204`
- **Details:** Includes `index_name` and `original_error`

#### `PINECONE_INDEX_NOT_FOUND` (HTTP 404)
- **When:** The specified Pinecone index doesn't exist
- **Message:** "Pinecone index '{index_name}' finnes ikke. Sjekk at indeksen er opprettet og at API-nøkkelen har tilgang." or "Pinecone index '{index_name}' finnes ikke"
- **Location:** `rag/index.py:59-64, 207-210`
- **Details:** Includes `index_name`, `original_error`, and `error_type`

#### `PINECONE_TIMEOUT` (HTTP 504)
- **When:** Connection timeout or request timeout with Pinecone
- **Message:** "Søketjenesten tok for lang tid. Vennligst prøv igjen."
- **Location:** `rag/index.py:194-198`
- **Retry After:** `10` seconds
- **Details:** May include timeout information

#### `PINECONE_INIT_ERROR` (HTTP 500)
- **When:** Generic initialization error with Pinecone (not auth, not found, or timeout)
- **Message:** "Kunne ikke initialisere søketjenesten"
- **Location:** `rag/index.py:213-217`
- **Details:** Includes `original_error` information

---

## 4. RateLimitError (HTTP 429)

**Service:** `rate_limiter`  
**Status Code:** `429`

Errors from rate limiting (WAF or application-level).

### Error Codes:

#### `RATE_LIMIT_EXCEEDED` (Default)
- **When:** Too many requests from the same IP address
- **Message:** "Du har sendt for mange forespørsler. Vennligst vent litt før du prøver igjen."
- **Location:** `utils/exceptions.py:66`, `proxy-lambda/enhanced_proxy.py:176`
- **Retry After:** `300` seconds (5 minutes)
- **Details:** May include rate limit information

---

## 5. Generic CoaxAPIError (HTTP 500)

**Service:** `unknown` (or custom)  
**Status Code:** `500` (or custom)

Generic errors that don't fit into specific categories.

### Error Codes:

#### `INTERNAL_ERROR`
- **When:** Unexpected/unhandled exception during request processing
- **Message:** "En feil oppstod ved behandling av forespørselen din."
- **Location:** `main.py:463-468`
- **Details:** Includes `original_error` with the exception message
- **Note:** This is a catch-all for unexpected errors in the streaming generator

---

## 6. HTTPException (Non-CoaxAPIError)

These are FastAPI HTTPExceptions, not CoaxAPIError subclasses, but they follow a similar format:

### Error Codes:

#### `UNAUTHORIZED` (HTTP 401)
- **When:** Missing or invalid API key
- **Message:** "Missing API key. Please provide X-API-Key header." or "Invalid API key"
- **Location:** `main.py:152-164`
- **Headers:** Includes `WWW-Authenticate: ApiKey`

#### `HTTP_ERROR` (HTTP 500+)
- **When:** Other HTTP exceptions not covered above
- **Message:** From the HTTPException detail
- **Location:** `main.py:537-548`
- **Details:** Generic HTTP error wrapper

---

## Error Response Format

All `CoaxAPIError` instances return responses in this unified format:

```json
{
    "error": "Error message in Norwegian",
    "error_code": "ERROR_CODE",
    "correlation_id": "uuid-string",
    "timestamp": "2025-12-08T15:00:00.000Z",
    "details": {
        "service": "bedrock|pinecone|validation|rate_limiter|unknown",
        "retry_after": 300,  // Optional, only for rate limit and timeout errors
        "index_name": "...",  // Optional, for Pinecone errors
        "original_error": "...",  // Optional, for wrapped errors
        // ... other service-specific details
    }
}
```

## Error Handling Flow

1. **Request Validation** → `ValidationError` (400)
2. **API Key Validation** → `HTTPException` (401) - not CoaxAPIError
3. **Rate Limiting** → `RateLimitError` (429)
4. **Vector Store Operations** → `VectorStoreError` (403/404/500/504)
5. **LLM Operations** → `BedrockError` (500)
6. **Unexpected Errors** → `CoaxAPIError` with `INTERNAL_ERROR` (500)

## SSE (Server-Sent Events) Error Format

For streaming responses, errors are sent as SSE events:

```
data: {"type":"error","error":"...","error_code":"...","correlation_id":"...","timestamp":"...","details":{...}}

```

---

## Summary Table

| Error Class | Error Code | HTTP Status | Service | Retry After |
|------------|-----------|-------------|---------|-------------|
| ValidationError | `VALIDATION_ERROR` | 400 | validation | - |
| ValidationError | `REQUEST_TOO_LARGE` | 400 | validation | - |
| ValidationError | `MISSING_QUERY` | 400 | validation | - |
| ValidationError | `PROMPT_INJECTION_DETECTED` | 400 | validation | - |
| BedrockError | `BEDROCK_INIT_ERROR` | 500 | bedrock | - |
| VectorStoreError | `PINECONE_AUTH` | 403 | pinecone | - |
| VectorStoreError | `PINECONE_INDEX_NOT_FOUND` | 404 | pinecone | - |
| VectorStoreError | `PINECONE_TIMEOUT` | 504 | pinecone | 10s |
| VectorStoreError | `PINECONE_INIT_ERROR` | 500 | pinecone | - |
| RateLimitError | `RATE_LIMIT_EXCEEDED` | 429 | rate_limiter | 300s |
| CoaxAPIError | `INTERNAL_ERROR` | 500 | unknown | - |
| HTTPException | `UNAUTHORIZED` | 401 | - | - |
| HTTPException | `HTTP_ERROR` | varies | - | - |

