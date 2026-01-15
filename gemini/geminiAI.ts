import "dotenv/config";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

const model: GenerativeModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite" 
});

export default model;
