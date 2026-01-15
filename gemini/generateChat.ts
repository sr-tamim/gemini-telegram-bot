import { ApiError, Chat } from "@google/genai";
import ai, { genAiConfig, genAiModel } from "./geminiAI";
import { errorLog } from "../functions/misc";

interface Chats {
  [chatId: string]: { chat: Chat; lastActive: Date };
}

const chats: Chats = {};

const getNewChat = (): Chat => {
  return ai.chats.create({
    model: genAiModel,
    config: genAiConfig,
  });
};

const clearChatHistory = (chatId: string): void => {
  chats[chatId] = { chat: getNewChat(), lastActive: new Date() };
};

async function generateChatResponse(
  prompt: string,
  chatId: string,
  senderName: string | null
): Promise<string> {
  if (!chats[chatId]) {
    clearChatHistory(chatId);
  }
  let chat = chats[chatId].chat;

  // limit chat history to last 30 messages
  if (chat.getHistory().length > 30) {
    clearChatHistory(chatId);
    chat = chats[chatId].chat;
  }

  prompt = `${senderName ? `It's ${senderName}. ` : ""}${prompt}`;
  try {
    const res = await chat.sendMessage({ message: prompt });
    const txt = res.text || "";
    if (!txt) {
      // if no response, clear chat history
      clearChatHistory(chatId);
    }
    return txt || "";
  } catch (e: any) {
    errorLog(e);
    if (e instanceof ApiError) {
      const error = JSON.parse(e.message)?.error;
      if (error?.code === 429) {
        return "⚠️ Rate limit exceeded. Please try again later.";
      } else if (error?.code === 503) {
        return "⚠️ Service unavailable. Please try again later.";
      } else {
        return `⚠️ An error occurred: ${error?.message || "Unknown error"}`;
      }
    }
    return "⚠️ An unexpected error occurred. Please try again later.";
  }
}

export { generateChatResponse, clearChatHistory };
