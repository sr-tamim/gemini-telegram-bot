import { ApiError } from "@google/genai";
import { errorLog } from "../functions/misc";
import ai, { genAiConfig, genAiModel } from "./geminiAI";

function getMimeType(url: string): string | null {
  const ext = url.split(".").pop();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return null;
  }
}

async function analyzeImageResponse(
  imgURL: URL,
  caption: string
): Promise<string> {
  try {
    const mimeType = getMimeType(imgURL.href);
    if (!mimeType) {
      return "Unsupported image format";
    }
    const imgRes = await fetch(imgURL.href).then((res) => res.arrayBuffer());
    const base64Img = Buffer.from(imgRes).toString("base64");

    const res = await ai.models.generateContent({
      model: genAiModel,
      config: genAiConfig,
      contents: [
        {
          inlineData: {
            data: base64Img,
            mimeType: mimeType,
          },
        },
        { text: caption },
      ],
    });
    const txt = res.text || "";
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

export { analyzeImageResponse };
