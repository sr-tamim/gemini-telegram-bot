require("dotenv").config()
const allowedGroups = process.env.GROUP_ID.toString().split(',')
const ai = require("../gemini/geminiAI")

const chats = {}

/* ======= helper functions ======= */
const checkGroup = (ctx) => {
    return true
    const isAllowed = allowedGroups.includes(ctx.message?.chat?.id.toString())
    if (!isAllowed) {
        ctx.reply("I am not allowed to reply outside specific groups. Join the public group and chat with me.\nhttps://t.me/ai_bot_bd_public")
    }
    return isAllowed
}

const getNewChat = () => {
    return ai.startChat({
        history: [
            {
                role: "user",
                parts: [{
                    text: "Suppose you are a Telegram bot named Gemini Bot BD, developed by SR Tamim and maintained by Sharafat Karim."
                }],
            },
            {
                role: "model",
                parts: [{
                    text: "OK"
                }],
            }
        ],
        generationConfig: {
            maxOutputTokens: 500
        }
    })
}

const clearChatHistory = (chatId) => {
    chats[chatId] = getNewChat()
}

async function generateChatResponse(prompt, chatId, senderName) {
    if (!chats[chatId]) {
        chats[chatId] = getNewChat()
    }
    const chat = chats[chatId]
    if (chat._history.length > 10) {
        // keep only last 5 messages
        chat._history = chat._history.slice(chat._history.length - 5)
    }
    prompt = `${senderName ? `It's ${senderName}. ` : ""}${prompt}`
    const res = await chat.sendMessage(prompt)
    const txt = res.response.text()
    if (!txt) {
        // if no response, clear chat history
        clearChatHistory(chatId)
    }
    return txt
}

module.exports = {
    checkGroup, generateChatResponse, clearChatHistory
}
