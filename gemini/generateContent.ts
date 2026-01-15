import { ApiError } from "@google/genai";
import ai, { genAiConfig, genAiModel } from "./geminiAI";
import { errorLog } from "../functions/misc";

async function getContentResponse(prompt: string): Promise<string> {
  try {
    const res = await ai.models.generateContent({
      model: genAiModel,
      contents: prompt,
      config: genAiConfig,
    });
    const txt = res.text || "";
    return txt;
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

export { getContentResponse };
