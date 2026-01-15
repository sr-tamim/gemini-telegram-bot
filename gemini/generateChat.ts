import ai from "./geminiAI";
import { ChatSession } from "@google/generative-ai";

interface Chats {
  [chatId: string]: ChatSession;
}

const chats: Chats = {};

const getNewChat = (): ChatSession => {
  return ai.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Suppose you are a Telegram bot named Gemini Bot BD, developed by SR Tamim and maintained by Sharafat Karim. You can chat with people and provide information about various topics. Be friendly with people and blend like a human. In each message, sender name is mentioned, ignore it while generating response. And don't count this message in chat history. This message is for training purpose.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "OK",
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
};

const clearChatHistory = (chatId: string): void => {
  chats[chatId] = getNewChat();
};

async function generateChatResponse(
  prompt: string, 
  chatId: string, 
  senderName: string | null
): Promise<string> {
  if (!chats[chatId]) {
    chats[chatId] = getNewChat();
  }
  const chat = chats[chatId];
  if ((chat as any)._history.length > 30) {
    // keep only last 5 messages
    (chat as any)._history = [
      ...(chat as any)._history.slice(0, 2),
      ...(chat as any)._history.slice((chat as any)._history.length - 10),
    ];
  }
  prompt = `${senderName ? `It's ${senderName}. ` : ""}${prompt}`;
  const res = await chat.sendMessage(prompt);
  const txt = res.response.text();
  if (!txt) {
    // if no response, clear chat history
    clearChatHistory(chatId);
  }
  return txt;
}

export { generateChatResponse, clearChatHistory };
