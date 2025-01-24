const ai = require("../gemini/geminiAI");

function getMimeType(url) {
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

async function analyzeImageResponse(imgURL, caption) {
  const mimeType = getMimeType(imgURL.href);
  if (!mimeType) {
    return "Unsupported image format";
  }
  const imgRes = await fetch(imgURL.href).then((res) => res.arrayBuffer());
  const base64Img = Buffer.from(imgRes).toString("base64");
  const res = await ai.generateContent([
    {
      inlineData: {
        data: base64Img,
        mimeType: mimeType,
      },
    },
    caption,
  ]);
  const txt = res.response.text();
  return txt;
}

module.exports = { analyzeImageResponse };
