import { Message } from "@/types/chat";

const userMessage1: Message = {
  id: "user-1",
  role: "user",
  content: "What's a good diet for high energy and iron levels?",
  timestamp: new Date(Date.now() - 60000 * 15).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const assistantMessage1: Message = {
  id: "assistant-1",
  role: "assistant",
  content:
    "For high energy and iron levels, a balanced diet is key. B-vitamins are crucial for energy metabolism, and you can find them in whole grains and legumes. Spinach is a great source of iron, and pairing it with foods rich in Vitamin C, like citrus fruits, will enhance iron absorption.",
  timestamp: new Date(Date.now() - 60000 * 13).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const userMessage2: Message = {
  id: "user-2",
  role: "user",
  content: "That's helpful! What about some good plant-based protein options?",
  timestamp: new Date(Date.now() - 60000 * 10).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const assistantMessage2: Message = {
  id: "assistant-2",
  role: "assistant",
  content:
    "Excellent question. For plant-based proteins, lentils and quinoa are fantastic choices. Lentils are rich in both protein and fiber. Quinoa is special because it's a complete protein, meaning it has all nine essential amino acids your body needs.",
  timestamp: new Date(Date.now() - 60000 * 8).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const userMessage3: Message = {
  id: "user-3",
  role: "user",
  content:
    "Great, last question. Any recommendations for foods that boost brain function?",
  timestamp: new Date(Date.now() - 60000 * 5).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

const assistantMessage3: Message = {
  id: "assistant-3",
  role: "assistant",
  content:
    "Absolutely. To boost brain function, incorporate foods rich in Omega-3 fatty acids, like flax seeds. Berries are packed with antioxidants that protect the brain, and spices like turmeric have anti-inflammatory benefits that support cognitive health.",
  timestamp: new Date(Date.now() - 60000 * 3).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

export const MOCK_CONVERSATION: Message[] = [
  userMessage1,
  assistantMessage1,
  userMessage2,
  assistantMessage2,
  userMessage3,
  assistantMessage3,
];

// Re-exporting these for other parts of the app that might use them directly
export const MOCK_USER_MESSAGE = userMessage3;
export const MOCK_ASSISTANT_MESSAGE = assistantMessage3;
