# Client Integration Guide

## Overview

The API has been updated with a new storage structure, but **all changes are backward compatible**. Your existing client should continue working without modifications.

## ✅ Quick Answer

**No, the client does NOT need to generate:**
- ❌ **Conversation ID** - Backend generates automatically if not provided
- ❌ **Message IDs** - Backend generates automatically if not provided  
- ❌ **Timestamps** - Backend generates automatically if not provided

**However, for conversation continuity:**
- ✅ **Track Conversation ID** - Capture it from response headers and send it back in subsequent requests (backend generates it, but you should reuse it)

## Recommended Updates (for better conversation tracking)

### 1. Send `X-Conversation-ID` Header (Optional but Recommended)

**The backend will generate a conversation ID automatically** if you don't send one. However, to maintain conversation continuity across multiple requests, you should:

1. **First request**: Don't send `X-Conversation-ID` (or send empty)
2. **Capture** the `X-Conversation-ID` from the response headers
3. **Subsequent requests**: Send the same `X-Conversation-ID` to continue the conversation

Example:

```javascript
// First request (new conversation) - NO conversation ID needed
fetch('https://your-api-url/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
    // Backend will generate conversation ID automatically
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello' }
      // NO id or timestamp needed - backend generates them
    ]
  })
});

// After first request, capture conversation ID from response headers
const conversationId = response.headers.get('X-Conversation-ID');

// Subsequent requests (same conversation) - reuse the ID
fetch('https://your-api-url/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
    'X-Conversation-ID': conversationId, // Reuse from previous response
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'Tell me more' }
      // NO id or timestamp needed - backend generates them
    ]
  })
});
```

### 2. Capture `X-Conversation-ID` from Response

The API now returns `X-Conversation-ID` in response headers. Capture it and reuse for the conversation:

```javascript
// Example with EventSource or fetch
const response = await fetch('https://your-api-url/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
    'X-Conversation-ID': conversationId || '', // Send existing or empty
  },
  body: JSON.stringify({ messages })
});

// Get conversation ID from response headers
const newConversationId = response.headers.get('X-Conversation-ID');
if (newConversationId) {
  // Store it for future requests in this conversation
  conversationId = newConversationId;
}
```

### 3. Message IDs (Fully Optional)

**You do NOT need to generate message IDs.** The backend generates them automatically.

However, if you're already generating them (for your own tracking), your format is compatible:

```javascript
// Your current format (compatible, but NOT required)
const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// But you can also just send:
messages: [
  { role: 'user', content: 'Hello' }  // Backend generates ID automatically
]
```

**Recommendation:** Don't generate IDs on the client - let the backend handle it unless you have a specific reason.

### 4. Complete Example

```javascript
class ChatClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.conversationId = null;
  }

  async sendMessage(userContent, history = []) {
    // Prepare messages - NO IDs or timestamps needed!
    const messages = [
      ...history,
      {
        role: 'user',
        content: userContent,
        // Backend generates id and timestamp automatically if not provided
      }
    ];

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
    
    // Add conversation ID if we have one
    if (this.conversationId) {
      headers['X-Conversation-ID'] = this.conversationId;
    }

    // Make request
    const response = await fetch(`${this.apiUrl}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages }),
    });

    // Capture conversation ID from response
    const newConversationId = response.headers.get('X-Conversation-ID');
    if (newConversationId) {
      this.conversationId = newConversationId;
    }

    // Handle SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'token') {
            // Handle streaming token
            console.log('Token:', data.token);
          } else if (data.type === 'done') {
            // Handle completed message
            console.log('Complete:', data.message);
          } else if (data.type === 'error') {
            // Handle error
            console.error('Error:', data);
          }
        }
      }
    }
  }
}

// Usage
const client = new ChatClient('https://your-api-url', 'your-api-key');
await client.sendMessage('Hello!');
await client.sendMessage('Tell me more', [/* previous messages */]);
```

## What Changed (Backend Only)

- ✅ **Storage structure**: Messages are now stored as interactions (user + assistant together)
- ✅ **Error tracking**: Errors are stored with structured error codes
- ✅ **Analytics**: Metadata tracks `total_user_messages` and error breakdown
- ✅ **Message IDs**: Improved format with random suffix to avoid collisions

## What Stayed the Same

- ✅ API endpoint (`/chat`)
- ✅ Request format (`{ messages: [...] }`)
- ✅ Response format (SSE streaming)
- ✅ Error format (same structure)
- ✅ CORS headers
- ✅ Authentication (API key)

## Summary

**No breaking changes required!** Your existing client will work as-is.

### What the Client MUST Provide:
- ✅ `role`: "user" or "assistant"
- ✅ `content`: The message text
- ✅ API key in `X-API-Key` header

### What the Backend Generates Automatically:
- ✅ **Conversation ID** - Generated if not sent in `X-Conversation-ID` header
- ✅ **Message IDs** - Generated if not provided in message objects
- ✅ **Timestamps** - Generated if not provided in message objects

### What's Recommended (for conversation continuity):
- ✅ Capture `X-Conversation-ID` from response headers
- ✅ Send `X-Conversation-ID` header in subsequent requests to continue the same conversation

**TL;DR:** Don't generate IDs - just send `{ role, content }` and let the backend handle everything else!

