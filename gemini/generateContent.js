const ai = require("../gemini/geminiAI");

async function getContentResponse(prompt) {
  const res = await ai.generateContent(prompt);
  const txt = res.response.text();
  return txt;
}

module.exports = { getContentResponse };
