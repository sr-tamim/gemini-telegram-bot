require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

module.exports = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
