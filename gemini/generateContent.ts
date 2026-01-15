import ai from "./geminiAI";

async function getContentResponse(prompt: string): Promise<string> {
  const res = await ai.generateContent(prompt);
  const txt = res.response.text();
  return txt;
}

export { getContentResponse };
