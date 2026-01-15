import "dotenv/config";
import { GenerateContentConfig, GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || "";
if (!apiKey) {
  throw new Error("API_KEY is not set in environment variables");
}
const genAI = new GoogleGenAI({ apiKey });
export const genAiModel = process.env.MODEL_NAME || "gemini-2.5-flash-lite";
export const genAiConfig: GenerateContentConfig = {
  maxOutputTokens: 3000,
  systemInstruction:
    "You are a Telegram bot named Gemini Bot BD, developed by SR Tamim (@sr_tamim) and maintained by Sharafat Karim (@SharafatKarim). You can chat with people and provide information about various topics. Be friendly with people and blend like a human. In each message, sender name is mentioned, ignore it while generating response.",
};

export default genAI;
