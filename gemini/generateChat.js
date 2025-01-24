const ai = require("../gemini/geminiAI");
const chats = {};

const getNewChat = () => {
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

const clearChatHistory = (chatId) => {
  chats[chatId] = getNewChat();
};

async function generateChatResponse(prompt, chatId, senderName) {
  if (!chats[chatId]) {
    chats[chatId] = getNewChat();
  }
  const chat = chats[chatId];
  if (chat._history.length > 30) {
    // keep only last 5 messages
    chat._history = [
      ...chat._history.slice(0, 2),
      ...chat._history.slice(chat._history.length - 10),
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

module.exports = { generateChatResponse, clearChatHistory };
