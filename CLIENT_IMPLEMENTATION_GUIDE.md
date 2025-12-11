# Client-Side Implementation Guide

## Overview

To enable message storage, your client needs to:
1. Generate and persist a `conversation_id` (UUID)
2. Send `X-Conversation-ID` header with each request
3. Include message metadata (`id`, `timestamp`) in messages

## Required Changes

### 1. Generate and Store Conversation ID

**For new conversations:**
```javascript
// Generate a new conversation ID
const conversationId = crypto.randomUUID();

// Store in localStorage (or your state management)
localStorage.setItem('currentConversationId', conversationId);
```

**For continuing conversations:**
```javascript
// Retrieve existing conversation ID
const conversationId = localStorage.getItem('currentConversationId') || crypto.randomUUID();
```

### 2. Add X-Conversation-ID Header

Include the header in all `/chat` requests:

```javascript
const response = await fetch('https://d2t2yxckava21c.cloudfront.net/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key',
    'X-Conversation-ID': conversationId,  // ← Add this
  },
  body: JSON.stringify({
    messages: [...]
  })
});
```

### 3. Include Message Metadata

Each message should have:
- `id`: Unique message identifier
- `role`: "user" or "assistant"
- `content`: Message text
- `timestamp`: ISO 8601 timestamp

**Example message format:**
```javascript
const userMessage = {
  id: `user-${Date.now()}`,
  role: 'user',
  content: 'Hva er forskjellen mellom COAX og tank varmtvannsberederen?',
  timestamp: new Date().toISOString()
};
```

## Complete Example

### React/TypeScript Example

```typescript
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function ChatComponent() {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize conversation ID on mount
  useEffect(() => {
    const storedId = localStorage.getItem('conversationId');
    if (storedId) {
      setConversationId(storedId);
    } else {
      const newId = crypto.randomUUID();
      setConversationId(newId);
      localStorage.setItem('conversationId', newId);
    }
  }, []);

  const sendMessage = async (content: string) => {
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };

    // Add to local state
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('https://d2t2yxckava21c.cloudfront.net/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || '',
          'X-Conversation-ID': conversationId,  // ← Required for message storage
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        })
      });

      // Handle SSE streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message | null = null;
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'token') {
                  // Handle streaming token
                  // Update UI with partial response
                } else if (data.type === 'done') {
                  // Final message received
                  assistantMessage = {
                    id: data.message.id,
                    role: 'assistant',
                    content: data.message.content,
                    timestamp: data.message.timestamp
                  };
                  setMessages(prev => [...prev, assistantMessage!]);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    // Your chat UI here
  );
}
```

### Vanilla JavaScript Example

```javascript
// Initialize conversation ID
let conversationId = localStorage.getItem('conversationId');
if (!conversationId) {
  conversationId = crypto.randomUUID();
  localStorage.setItem('conversationId', conversationId);
}

// Send message function
async function sendMessage(userInput) {
  const userMessage = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: userInput,
    timestamp: new Date().toISOString()
  };

  const response = await fetch('https://d2t2yxckava21c.cloudfront.net/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key',
      'X-Conversation-ID': conversationId,  // ← Required
    },
    body: JSON.stringify({
      messages: [userMessage]
    })
  });

  // Handle SSE stream...
}
```

## Starting a New Conversation

To start a fresh conversation:

```javascript
// Generate new conversation ID
const newConversationId = crypto.randomUUID();
localStorage.setItem('conversationId', newConversationId);
setConversationId(newConversationId);
setMessages([]); // Clear messages
```

## Optional: Retrieving Stored Conversations

If you want to retrieve stored conversations (future feature), you can query the API:

```python
# Backend example (not yet implemented)
from utils.message_storage import get_conversation, get_conversation_metadata

# Get all messages in a conversation
messages = get_conversation(conversation_id)

# Get conversation metadata (total message count)
metadata = get_conversation_metadata(conversation_id)
```

## Important Notes

1. **Conversation ID Persistence**: Store the conversation ID in localStorage, sessionStorage, or your state management to maintain conversation continuity across page refreshes.

2. **Message IDs**: Each message should have a unique `id`. Use timestamps or UUIDs to ensure uniqueness.

3. **Timestamps**: Use ISO 8601 format (`new Date().toISOString()` in JavaScript).

4. **Header is Optional**: If you don't send `X-Conversation-ID`, the API will generate a new one for each request (messages won't be grouped in a conversation).

5. **Backward Compatible**: Existing clients without `X-Conversation-ID` will still work, but messages won't be stored in conversations.

## Testing

1. **Check Storage**: After sending messages, verify they're stored in DynamoDB:
   ```bash
   aws dynamodb query \
     --table-name coax-rag-prod-messages \
     --key-condition-expression "conversation_id = :id" \
     --expression-attribute-values '{":id":{"S":"your-conversation-id"}}'
   ```

2. **Check Metadata**: Verify conversation metadata exists:
   ```bash
   aws dynamodb get-item \
     --table-name coax-rag-prod-messages \
     --key '{"conversation_id":{"S":"your-conversation-id"},"message_id":{"S":"METADATA"}}'
   ```

## Troubleshooting

**Messages not being stored?**
- Check that `X-Conversation-ID` header is being sent
- Verify CORS is allowing the header (should be automatic)
- Check CloudWatch logs for storage errors

**Conversation ID not persisting?**
- Ensure localStorage is available (not in incognito mode)
- Check browser console for localStorage errors
- Consider using sessionStorage for temporary persistence

